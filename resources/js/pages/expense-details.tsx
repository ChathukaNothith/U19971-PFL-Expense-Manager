import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ExpenseApiError, getExpense } from '../lib/expense-api';
import type { Expense } from '../types/expense';

interface ExpenseDetailsProps {
    expenseId: number;
}

const money = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
});

function DetailsContent({ expenseId }: ExpenseDetailsProps) {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        getExpense(expenseId, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setExpense(data);
                    setLoading(false);
                }
            })
            .catch((failure: unknown) => {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof ExpenseApiError &&
                            failure.status === 404
                            ? 'This expense could not be found.'
                            : 'Unable to load this expense. Please try again.',
                    );
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [expenseId, attempt]);

    function retry() {
        setError('');
        setLoading(true);
        setAttempt((previous) => previous + 1);
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            <Link
                href="/"
                className="rounded text-indigo-700 underline underline-offset-4 focus:ring-2 focus:ring-indigo-600"
            >
                Back to expenses
            </Link>

            <section
                aria-labelledby="details-title"
                className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <h1 id="details-title" className="text-2xl font-bold">
                    Expense details
                </h1>

                {loading ? (
                    <p role="status" className="mt-6 text-slate-600">
                        Loading expense…
                    </p>
                ) : error ? (
                    <div className="mt-6">
                        <p role="alert" className="text-red-800">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={retry}
                            className="mt-4 rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                        >
                            Try again
                        </button>
                    </div>
                ) : expense ? (
                    <dl className="mt-6 space-y-5">
                        <div>
                            <dt className="text-sm text-slate-600">
                                Expense ID
                            </dt>
                            <dd className="mt-1 font-medium">#{expense.id}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-600">Date</dt>
                            <dd className="mt-1 font-medium">
                                <time dateTime={expense.date}>
                                    {expense.date}
                                </time>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-600">
                                Amount (LKR)
                            </dt>
                            <dd className="mt-1 text-2xl font-bold text-indigo-700">
                                {money.format(Number(expense.cost_lkr))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-600">
                                Expense type
                            </dt>
                            <dd className="mt-1 font-medium capitalize">
                                {expense.expense_type}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-600">
                                Description
                            </dt>
                            <dd className="mt-1 break-words whitespace-pre-wrap">
                                {expense.description}
                            </dd>
                        </div>
                    </dl>
                ) : null}
            </section>
        </main>
    );
}

export default function ExpenseDetailsPage(props: ExpenseDetailsProps) {
    return (
        <>
            <Head title="Expense details" />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <DetailsContent key={props.expenseId} {...props} />
            </div>
        </>
    );
}
