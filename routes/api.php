<?php

use App\Http\Controllers\Api\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'store']);

Route::get('/expenses/summary', [ExpenseController::class, 'summary']);

Route::get('/expenses/{expense}', [ExpenseController::class, 'show'])
    ->whereNumber('expense');
