import type { Expense, ExpenseInput, ValidationErrors } from '../types/expense';

interface ApiPayload<T> {
    data?: T;
    message?: string;
    errors?: ValidationErrors;
}

export class ExpenseApiError extends Error {
    status: number;
    errors: ValidationErrors;

    constructor(
        message: string,
        status: number,
        errors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'ExpenseApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    const response = await fetch(`/api${path}`, {
        ...options,
        headers,
    });

    const payload: ApiPayload<T> | null = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new ExpenseApiError(
            payload?.message ?? 'The request failed. Please try again.',
            response.status,
            payload?.errors ?? {},
        );
    }

    if (!payload || payload.data === undefined) {
        throw new ExpenseApiError(
            'The server returned an unexpected response.',
            response.status,
        );
    }

    return payload.data;
}

export function listExpenses(signal?: AbortSignal): Promise<Expense[]> {
    return request<Expense[]>('/expenses', { signal });
}

export function getExpense(id: number, signal?: AbortSignal): Promise<Expense> {
    return request<Expense>(`/expenses/${id}`, { signal });
}

export function createExpense(input: ExpenseInput): Promise<Expense> {
    return request<Expense>('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });
}
