import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vite-plus/test';
import ExpenseForm from '../../resources/js/components/expense-form';

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
    fireEvent.change(screen.getByLabelText('Date'), {
        target: { value: '2026-09-18' },
    });

    await user.type(screen.getByLabelText('Amount (LKR)'), '450.5');
    await user.selectOptions(screen.getByLabelText('Expense type'), 'food');
    await user.type(
        screen.getByLabelText('Description'),
        'Lunch at university',
    );
}

test('shows server validation errors and preserves entered values', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    message: 'Please check the amount.',
                    errors: {
                        cost_lkr: ['The amount is invalid.'],
                    },
                }),
                {
                    status: 422,
                    headers: { 'Content-Type': 'application/json' },
                },
            ),
        ),
    );

    render(<ExpenseForm onCreated={onCreated} />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(await screen.findByRole('alert')).toHaveProperty(
        'textContent',
        'Please check the amount.',
    );

    expect(screen.getByText('The amount is invalid.')).toBeTruthy();

    const amount = screen.getByLabelText('Amount (LKR)') as HTMLInputElement;

    expect(amount.value).toBe('450.5');
    expect(amount.getAttribute('aria-invalid')).toBe('true');
    expect(amount.getAttribute('aria-describedby')).toBe('cost-error');

    expect(
        (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
    ).toBe('Lunch at university');

    expect(onCreated).not.toHaveBeenCalled();

    await waitFor(() => {
        expect(document.activeElement).toBe(amount);
    });
});

test('shows a connection error and allows another attempt', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    render(<ExpenseForm onCreated={onCreated} />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(await screen.findByRole('alert')).toHaveProperty(
        'textContent',
        'Unable to connect. Please try again.',
    );

    await waitFor(() => {
        expect(
            screen
                .getByRole('button', { name: 'Save expense' })
                .matches(':disabled'),
        ).toBe(false);
    });

    expect(
        (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
    ).toBe('Lunch at university');

    expect(onCreated).not.toHaveBeenCalled();
});

test('disables the form and prevents duplicate submissions while saving', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    let finishRequest!: (response: Response) => void;

    const pendingResponse = new Promise<Response>((resolve) => {
        finishRequest = resolve;
    });

    const fetchMock = vi.fn().mockReturnValue(pendingResponse);
    vi.stubGlobal('fetch', fetchMock);

    render(<ExpenseForm onCreated={onCreated} />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    const savingButton = screen.getByRole('button', { name: 'Saving…' });

    expect(savingButton.matches(':disabled')).toBe(true);
    expect(screen.getByLabelText('Amount (LKR)').matches(':disabled')).toBe(
        true,
    );

    await user.click(savingButton);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onCreated).not.toHaveBeenCalled();

    const expense = {
        id: 2,
        date: '2026-09-18',
        cost_lkr: '450.50',
        description: 'Lunch at university',
        expense_type: 'food',
        created_at: '2026-09-18T06:00:00.000000Z',
        updated_at: '2026-09-18T06:00:00.000000Z',
    };

    finishRequest(
        new Response(JSON.stringify({ data: expense }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        }),
    );

    await waitFor(() => {
        expect(onCreated).toHaveBeenCalledExactlyOnceWith(expense);
        expect(
            screen
                .getByRole('button', { name: 'Save expense' })
                .matches(':disabled'),
        ).toBe(false);
    });
});
