import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ExpenseForm from '../components/expense-form';
import ExpenseList from '../components/expense-list';
import MonthlySummaryCard from '../components/monthly-summary';
import { listExpenses } from '../lib/expense-api';
import type { Expense } from '../types/expense';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [summaryRevision, setSummaryRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        listExpenses(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setExpenses(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setError('Unable to load expenses. Please try again.');
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [attempt]);

    function retry() {
        setError('');
        setLoading(true);
        setAttempt((previous) => previous + 1);
    }

    function handleCreated(expense: Expense) {
        setExpenses((previous) =>
            [expense, ...previous].sort(
                (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
            ),
        );
        setSuccess(`Expense #${expense.id} saved successfully.`);
        setSummaryRevision((previous) => previous + 1);
    }

    return (
        <>
            <Head title="Expense Manager" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                <a
                    href="#main-content"
                    className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
                >
                    Skip to main content
                </a>

                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                        <p className="text-sm font-semibold tracking-widest text-indigo-700 uppercase">
                            Personal finance
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            Expense Manager
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Record your everyday spending in Sri Lankan rupees.
                        </p>
                    </div>
                </header>

                <main
                    id="main-content"
                    tabIndex={-1}
                    className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
                >
                    <div role="status" aria-live="polite">
                        {success && (
                            <p className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                                {success}
                            </p>
                        )}
                    </div>

                    <MonthlySummaryCard revision={summaryRevision} />

                    {loading ? (
                        <p role="status" className="text-slate-600">
                            Loading expenses...
                        </p>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-white p-6">
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
                    ) : (
                        <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
                            <ExpenseForm onCreated={handleCreated} />
                            <ExpenseList expenses={expenses} />
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
