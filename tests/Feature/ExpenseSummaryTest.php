<?php

use App\Models\Expense;

it('summarises only the selected month with accurate category totals', function () {
    $records = [
        ['2026-09-01', '250.10', 'travel'],
        ['2026-09-30', '0.20', 'travel'],
        ['2026-09-18', '450.50', 'food'],
        ['2026-09-29', '20.00', 'other'],
        ['2026-08-31', '999.00', 'food'],
        ['2026-10-01', '999.00', 'travel'],
    ];

    foreach ($records as [$date, $cost, $type]) {
        Expense::create([
            'date' => $date,
            'cost_lkr' => $cost,
            'description' => 'Summary test expense',
            'expense_type' => $type,
        ]);
    }

    $this->getJson('/api/expenses/summary?month=2026-09')
        ->assertOk()
        ->assertExactJson([
            'data' => [
                'month' => '2026-09',
                'total_lkr' => '720.80',
                'expense_count' => 4,
                'by_type' => [
                    [
                        'expense_type' => 'travel',
                        'total_lkr' => '250.30',
                        'expense_count' => 2,
                    ],
                    [
                        'expense_type' => 'food',
                        'total_lkr' => '450.50',
                        'expense_count' => 1,
                    ],
                    [
                        'expense_type' => 'other',
                        'total_lkr' => '20.00',
                        'expense_count' => 1,
                    ],
                ],
            ],
        ]);
});

it('returns zero totals for a month without expenses', function () {
    Expense::create([
        'date' => '2026-08-18',
        'cost_lkr' => '100.00',
        'description' => 'Expense in another month',
        'expense_type' => 'food',
    ]);

    $this->getJson('/api/expenses/summary?month=2026-09')
        ->assertOk()
        ->assertExactJson([
            'data' => [
                'month' => '2026-09',
                'total_lkr' => '0.00',
                'expense_count' => 0,
                'by_type' => [
                    [
                        'expense_type' => 'travel',
                        'total_lkr' => '0.00',
                        'expense_count' => 0,
                    ],
                    [
                        'expense_type' => 'food',
                        'total_lkr' => '0.00',
                        'expense_count' => 0,
                    ],
                    [
                        'expense_type' => 'other',
                        'total_lkr' => '0.00',
                        'expense_count' => 0,
                    ],
                ],
            ],
        ]);
});

it('requires a month for the summary', function () {
    $this->getJson('/api/expenses/summary')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['month']);
});

it('rejects invalid summary months', function (string $month) {
    $this->getJson('/api/expenses/summary?month='.urlencode($month))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['month']);
})->with([
    'invalid month number' => ['2026-13'],
    'incorrect format' => ['09-2026'],
    'invalid text' => ['not-a-month'],
]);
