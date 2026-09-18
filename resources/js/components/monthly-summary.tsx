import { useEffect, useState } from 'react';
import { getMonthlySummary } from '../lib/expense-api';
import type { MonthlySummary } from '../types/expense';

const currency = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
});

function currentMonth() {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function SummaryResult({
    month,
    onRetry,
}: {
    month: string;
    onRetry: () => void;
}) {
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        getMonthlySummary(month, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setSummary(data);
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setError('Unable to load the monthly summary.');
                }
            });

        return () => controller.abort();
    }, [month]);

    if (error) {
        return (
            <div className="mt-5">
                <p role="alert" className="text-red-800">
                    {error}
                </p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!summary) {
        return (
            <p role="status" className="mt-5 text-slate-600">
                Loading monthly summary...
            </p>
        );
    }

    return (
        <div role="status" aria-live="polite" className="mt-5">
            <p className="text-sm text-slate-600">
                {summary.expense_count} expenses recorded in {summary.month}
            </p>

            {summary.expense_count === 0 && (
                <p className="mt-2 text-slate-600">
                    No expenses recorded for this month.
                </p>
            )}

            <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-indigo-50 p-4">
                    <dt className="text-sm font-medium text-indigo-800">
                        Total spending
                    </dt>
                    <dd className="mt-2 text-xl font-bold text-indigo-800">
                        {currency.format(Number(summary.total_lkr))}
                    </dd>
                </div>

                {summary.by_type.map((category) => (
                    <div
                        key={category.expense_type}
                        className="rounded-xl bg-slate-50 p-4"
                    >
                        <dt className="text-sm font-medium text-slate-600 capitalize">
                            {category.expense_type}
                        </dt>
                        <dd className="mt-2 text-xl font-semibold">
                            {currency.format(Number(category.total_lkr))}
                        </dd>
                        <dd className="mt-1 text-sm text-slate-600">
                            {category.expense_count} expenses
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export default function MonthlySummaryCard({ revision }: { revision: number }) {
    const [month, setMonth] = useState(currentMonth);
    const [attempt, setAttempt] = useState(0);

    return (
        <section
            aria-labelledby="monthly-summary-title"
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2
                        id="monthly-summary-title"
                        className="text-xl font-semibold"
                    >
                        Monthly summary
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        View spending totals by month and expense type.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="summary-month"
                        className="mb-2 block text-sm font-medium"
                    >
                        Select month
                    </label>
                    <input
                        id="summary-month"
                        type="month"
                        min="0001-01"
                        max="9999-12"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
            </div>

            {month ? (
                <SummaryResult
                    key={`${month}-${revision}-${attempt}`}
                    month={month}
                    onRetry={() => setAttempt((previous) => previous + 1)}
                />
            ) : (
                <p className="mt-5 text-slate-600">
                    Select a month to view its summary.
                </p>
            )}
        </section>
    );
}
