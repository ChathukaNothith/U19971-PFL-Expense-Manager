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
export interface MonthlySummary {
    month: string;
    total_lkr: string;
    expense_count: number;
    by_type: {
        expense_type: ExpenseType;
        total_lkr: string;
        expense_count: number;
    }[];
}
