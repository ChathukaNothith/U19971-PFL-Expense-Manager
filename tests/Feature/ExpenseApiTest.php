<?php

use App\Models\Expense;

test('an expense can be saved for each allowed type', function (string $type) {
    $payload = [
        'date' => '2026-09-18',
        'cost_lkr' => '250.50',
        'description' => 'University expense',
        'expense_type' => $type,
    ];

    $response = $this->postJson('/api/expenses', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.date', '2026-09-18')
        ->assertJsonPath('data.cost_lkr', '250.50')
        ->assertJsonPath('data.description', 'University expense')
        ->assertJsonPath('data.expense_type', $type);

    $this->assertDatabaseCount('expenses', 1);

    $this->assertDatabaseHas('expenses', [
        'id' => $response->json('data.id'),
        ...$payload,
    ]);
})->with(['travel', 'food', 'other']);

test('the list is empty when there are no expenses', function () {
    $this->getJson('/api/expenses')
        ->assertOk()
        ->assertExactJson(['data' => []]);
});

test('expenses are listed by date and then id descending', function () {
    $older = Expense::create([
        'date' => '2026-09-17',
        'cost_lkr' => '100.00',
        'description' => 'Older expense',
        'expense_type' => 'travel',
    ]);

    $first = Expense::create([
        'date' => '2026-09-18',
        'cost_lkr' => '200.00',
        'description' => 'First expense today',
        'expense_type' => 'food',
    ]);

    $latest = Expense::create([
        'date' => '2026-09-18',
        'cost_lkr' => '300.00',
        'description' => 'Latest expense today',
        'expense_type' => 'other',
    ]);

    $this->getJson('/api/expenses')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.id', $latest->id)
        ->assertJsonPath('data.1.id', $first->id)
        ->assertJsonPath('data.2.id', $older->id);
});

test('an individual expense can be retrieved', function () {
    $expense = Expense::create([
        'date' => '2026-09-18',
        'cost_lkr' => '250.00',
        'description' => 'Bus fare',
        'expense_type' => 'travel',
    ]);

    $this->getJson("/api/expenses/{$expense->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $expense->id)
        ->assertJsonPath('data.date', '2026-09-18')
        ->assertJsonPath('data.cost_lkr', '250.00')
        ->assertJsonPath('data.description', 'Bus fare')
        ->assertJsonPath('data.expense_type', 'travel');
});

test('a missing expense returns 404', function () {
    $this->getJson('/api/expenses/999')
        ->assertNotFound();
});

test('all expense fields are required', function () {
    $this->postJson('/api/expenses', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'date',
            'cost_lkr',
            'description',
            'expense_type',
        ]);

    $this->assertDatabaseCount('expenses', 0);
});

test('invalid expense values are rejected', function (string $field, mixed $value) {
    $payload = [
        'date' => '2026-09-18',
        'cost_lkr' => '250.00',
        'description' => 'Bus fare',
        'expense_type' => 'travel',
    ];

    $payload[$field] = $value;

    $this->postJson('/api/expenses', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);

    $this->assertDatabaseCount('expenses', 0);
})->with([
    'invalid date' => ['date', 'not-a-date'],
    'impossible date' => ['date', '2026-02-30'],
    'wrong date format' => ['date', '18/09/2026'],
    'negative cost' => ['cost_lkr', '-1.00'],
    'zero cost' => ['cost_lkr', '0'],
    'non-numeric cost' => ['cost_lkr', 'abc'],
    'too many decimal places' => ['cost_lkr', '250.123'],
    'cost above maximum' => ['cost_lkr', '10000000000.00'],
    'empty description' => ['description', ''],
    'long description' => ['description', str_repeat('a', 2001)],
    'invalid expense type' => ['expense_type', 'shopping'],
]);
