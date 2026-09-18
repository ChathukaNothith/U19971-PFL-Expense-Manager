export type ExpenseType = 'travel' | 'food' | 'other';

export interface ExpenseInput {
    date: string;
    cost_lkr: string;
    description: string;
    expense_type: ExpenseType;
}

export interface Expense extends ExpenseInput {
    id: number;
    created_at: string;
    updated_at: string;
}

export type ValidationErrors = Partial<Record<keyof ExpenseInput, string[]>>;
