import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vite-plus/test';
import ExpenseForm from '../../resources/js/components/expense-form';
import type { Expense } from '../../resources/js/types/expense';

test('submits an expense and resets the form after success', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    const savedExpense: Expense = {
        id: 2,
        date: '2026-09-18',
        cost_lkr: '450.50',
        description: 'Lunch at university',
        expense_type: 'food',
        created_at: '2026-09-18T06:00:00.000000Z',
        updated_at: '2026-09-18T06:00:00.000000Z',
    };

    const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: savedExpense }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<ExpenseForm onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText('Date'), {
        target: { value: '2026-09-18' },
    });

    await user.type(screen.getByLabelText('Amount (LKR)'), '450.5');
    await user.selectOptions(screen.getByLabelText('Expense type'), 'food');
    await user.type(
        screen.getByLabelText('Description'),
        'Lunch at university',
    );
    await user.click(screen.getByRole('button', { name: 'Save expense' }));

    await waitFor(() => {
        expect(onCreated).toHaveBeenCalledExactlyOnceWith(savedExpense);
    });

    expect(fetchMock).toHaveBeenCalledWith(
        '/api/expenses',
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
                date: '2026-09-18',
                cost_lkr: '450.5',
                description: 'Lunch at university',
                expense_type: 'food',
            }),
        }),
    );

    expect(
        (screen.getByLabelText('Amount (LKR)') as HTMLInputElement).value,
    ).toBe('');

    expect(
        (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
    ).toBe('');
});
