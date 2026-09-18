<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'expenses')->name('home');

Route::get('/expenses/{expense}', function (string $expense) {
    return Inertia::render('expense-details', [
        'expenseId' => (int) $expense,
    ]);
})->whereNumber('expense')->name('expenses.show');
