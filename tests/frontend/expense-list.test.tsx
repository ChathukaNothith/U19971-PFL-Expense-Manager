import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { expect, test, vi } from 'vite-plus/test';
import ExpenseList from '../../resources/js/components/expense-list';
import type { Expense } from '../../resources/js/types/expense';

vi.mock('@inertiajs/react', () => ({
    Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

test('shows a helpful message when there are no expenses', () => {
    render(<ExpenseList expenses={[]} />);

    expect(screen.getByRole('heading', { name: 'Your expenses' })).toBeTruthy();

    expect(
        screen.getByText(
            'No expenses yet. Add your first expense using the form.',
        ),
    ).toBeTruthy();

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
});

test('shows expense information and a link to its details', () => {
    const expense: Expense = {
        id: 2,
        date: '2026-09-18',
        cost_lkr: '450.50',
        description: 'Lunch at university',
        expense_type: 'food',
        created_at: '2026-09-18T06:00:00.000000Z',
        updated_at: '2026-09-18T06:00:00.000000Z',
    };

    render(<ExpenseList expenses={[expense]} />);

    expect(screen.getByText('Lunch at university')).toBeTruthy();
    expect(screen.getByText('2026-09-18')).toBeTruthy();
    expect(screen.getByText(/food/i)).toBeTruthy();

    expect(screen.getByText(/^LKR\s+450\.50$/)).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);

    const detailsLink = screen.getByRole('link', {
        name: 'View details for expense 2: Lunch at university',
    });

    expect(detailsLink.getAttribute('href')).toBe('/expenses/2');
});
