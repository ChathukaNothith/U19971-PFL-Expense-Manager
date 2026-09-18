import type { Expense } from '../types/expense';
import { Link } from '@inertiajs/react';

interface ExpenseListProps {
    expenses: Expense[];
}

const money = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
});

export default function ExpenseList({ expenses }: ExpenseListProps) {
    return (
        <section
            aria-labelledby="expense-list-title"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <h2
                id="expense-list-title"
                className="text-xl font-semibold text-slate-900"
            >
                Your expenses
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                {expenses.length} recorded expenses · Latest dates first
            </p>

            {expenses.length === 0 ? (
                <p className="mt-6 rounded-lg bg-slate-50 p-4 text-slate-600">
                    No expenses yet. Add your first expense using the form.
                </p>
            ) : (
                <ul className="mt-6 divide-y divide-slate-200">
                    {expenses.map((expense) => (
                        <li key={expense.id} className="py-4 first:pt-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium break-words text-slate-900">
                                        {expense.description}
                                    </p>
                                    <Link
                                        href={`/expenses/${expense.id}`}
                                        aria-label={`View details for expense ${expense.id}: ${expense.description}`}
                                        className="mt-2 inline-block rounded text-sm font-medium text-indigo-700 underline underline-offset-4 focus:ring-2 focus:ring-indigo-600"
                                    >
                                        View details
                                    </Link>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                        <time dateTime={expense.date}>
                                            {expense.date}
                                        </time>
                                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-800 capitalize">
                                            {expense.expense_type}
                                        </span>
                                    </div>
                                </div>
                                <p className="font-semibold text-slate-900">
                                    {money.format(Number(expense.cost_lkr))}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
