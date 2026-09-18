import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { expect, test, vi } from 'vite-plus/test';
import ExpenseDetails from '../../resources/js/pages/expense-details';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

test('loads and displays an individual expense', async () => {
    const expense = {
        id: 2,
        date: '2026-09-18',
        cost_lkr: '450.50',
        description: 'Lunch at university',
        expense_type: 'food',
        created_at: '2026-09-18T06:00:00.000000Z',
        updated_at: '2026-09-18T06:00:00.000000Z',
    };

    const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: expense }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    render(<ExpenseDetails expenseId={2} />);

    expect(await screen.findByText('Lunch at university')).toBeTruthy();

    expect(screen.getByText('#2')).toBeTruthy();
    expect(screen.getByText('2026-09-18')).toBeTruthy();
    expect(screen.getByText(/^LKR\s+450\.50$/)).toBeTruthy();
    expect(screen.getByText(/^food$/i)).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith(
        '/api/expenses/2',
        expect.any(Object),
    );

    const backLink = screen.getByRole('link', {
        name: 'Back to expenses',
    });

    expect(backLink.getAttribute('href')).toBe('/');
});

test('shows a helpful message when the expense does not exist', async () => {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ message: 'Not found.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            }),
        ),
    );

    render(<ExpenseDetails expenseId={999} />);

    const alert = await screen.findByRole('alert');

    expect(alert.textContent).toContain('This expense could not be found.');

    expect(screen.getByRole('link', { name: 'Back to expenses' })).toBeTruthy();
});
