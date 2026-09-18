import { useState } from 'react';
import type { FormEvent } from 'react';
import { createExpense, ExpenseApiError } from '../lib/expense-api';
import type {
    Expense,
    ExpenseInput,
    ExpenseType,
    ValidationErrors,
} from '../types/expense';

interface ExpenseFormProps {
    onCreated: (expense: Expense) => void;
}

function initialValues(): ExpenseInput {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return {
        date: `${year}-${month}-${day}`,
        cost_lkr: '',
        description: '',
        expense_type: 'travel',
    };
}

const inputClass =
    'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600';

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
    if (!messages?.length) return null;

    return (
        <p id={id} className="mt-1 text-sm text-red-700">
            {messages.join(' ')}
        </p>
    );
}

export default function ExpenseForm({ onCreated }: ExpenseFormProps) {
    const [values, setValues] = useState<ExpenseInput>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    function update<K extends keyof ExpenseInput>(
        field: K,
        value: ExpenseInput[K],
    ) {
        setValues((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;

        const form = event.currentTarget;
        setSaving(true);
        setErrors({});
        setMessage('');

        try {
            const expense = await createExpense(values);
            setValues(initialValues());
            onCreated(expense);
        } catch (error) {
            if (error instanceof ExpenseApiError) {
                setErrors(error.errors);
                setMessage(error.message);
            } else {
                setMessage('Unable to connect. Please try again.');
            }
        } finally {
            setSaving(false);
            // Wait until React has enabled the fields before focusing.
            requestAnimationFrame(() => {
                form.querySelector<HTMLElement>(
                    '[aria-invalid="true"]',
                )?.focus();
            });
        }
    }

    return (
        <section
            aria-labelledby="add-expense-title"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <h2
                id="add-expense-title"
                className="text-xl font-semibold text-slate-900"
            >
                Add an expense
            </h2>
            <p className="mt-1 text-sm text-slate-600">
                All fields are required. Enter the amount in Sri Lankan rupees.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
                {message && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg bg-red-50 p-3 text-red-800"
                    >
                        {message}
                    </p>
                )}

                <fieldset disabled={saving} className="space-y-4">
                    <legend className="sr-only">Expense information</legend>

                    <div>
                        <label htmlFor="expense-date" className="font-medium">
                            Date
                        </label>
                        <input
                            id="expense-date"
                            name="date"
                            type="date"
                            required
                            value={values.date}
                            onChange={(event) =>
                                update('date', event.target.value)
                            }
                            aria-invalid={Boolean(errors.date?.length)}
                            aria-describedby={
                                errors.date?.length ? 'date-error' : undefined
                            }
                            className={inputClass}
                        />
                        <FieldError id="date-error" messages={errors.date} />
                    </div>

                    <div>
                        <label htmlFor="expense-cost" className="font-medium">
                            Amount (LKR)
                        </label>
                        <input
                            id="expense-cost"
                            name="cost_lkr"
                            type="number"
                            min="0.01"
                            max="9999999999.99"
                            step="0.01"
                            required
                            value={values.cost_lkr}
                            onChange={(event) =>
                                update('cost_lkr', event.target.value)
                            }
                            aria-invalid={Boolean(errors.cost_lkr?.length)}
                            aria-describedby={
                                errors.cost_lkr?.length
                                    ? 'cost-error'
                                    : undefined
                            }
                            className={inputClass}
                        />
                        <FieldError
                            id="cost-error"
                            messages={errors.cost_lkr}
                        />
                    </div>

                    <div>
                        <label htmlFor="expense-type" className="font-medium">
                            Expense type
                        </label>
                        <select
                            id="expense-type"
                            name="expense_type"
                            required
                            value={values.expense_type}
                            onChange={(event) =>
                                update(
                                    'expense_type',
                                    event.target.value as ExpenseType,
                                )
                            }
                            aria-invalid={Boolean(errors.expense_type?.length)}
                            aria-describedby={
                                errors.expense_type?.length
                                    ? 'type-error'
                                    : undefined
                            }
                            className={inputClass}
                        >
                            <option value="travel">Travel</option>
                            <option value="food">Food</option>
                            <option value="other">Other</option>
                        </select>
                        <FieldError
                            id="type-error"
                            messages={errors.expense_type}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="expense-description"
                            className="font-medium"
                        >
                            Description
                        </label>
                        <textarea
                            id="expense-description"
                            name="description"
                            rows={3}
                            maxLength={2000}
                            required
                            value={values.description}
                            onChange={(event) =>
                                update('description', event.target.value)
                            }
                            aria-invalid={Boolean(errors.description?.length)}
                            aria-describedby={
                                errors.description?.length
                                    ? 'description-error'
                                    : undefined
                            }
                            className={inputClass}
                        />
                        <FieldError
                            id="description-error"
                            messages={errors.description}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : 'Save expense'}
                    </button>
                </fieldset>
            </form>
        </section>
    );
}
