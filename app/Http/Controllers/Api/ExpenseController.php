<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ExpenseController extends Controller
{
    public function index(): JsonResponse
    {
        $expenses = Expense::query()
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $expenses,
        ]);
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $expense = Expense::create($request->validated());

        return response()->json([
            'data' => $expense,
        ], 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json([
            'data' => $expense,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $start = Carbon::parse($validated['month'].'-01');
        $nextMonth = $start->copy()->addMonth();

        $expenses = Expense::query()
            ->where('date', '>=', $start->toDateString())
            ->where('date', '<', $nextMonth->toDateString())
            ->get();

        $totalCents = 0;
        $byType = [];

        foreach (['travel', 'food', 'other'] as $type) {
            $typeCents = 0;
            $count = 0;

            foreach ($expenses as $expense) {
                if ($expense->expense_type !== $type) {
                    continue;
                }

                $typeCents += (int) str_replace(
                    '.',
                    '',
                    (string) $expense->cost_lkr
                );
                $count++;
            }

            $totalCents += $typeCents;

            $byType[] = [
                'expense_type' => $type,
                'total_lkr' => number_format($typeCents / 100, 2, '.', ''),
                'expense_count' => $count,
            ];
        }

        return response()->json([
            'data' => [
                'month' => $validated['month'],
                'total_lkr' => number_format($totalCents / 100, 2, '.', ''),
                'expense_count' => $expenses->count(),
                'by_type' => $byType,
            ],
        ]);
    }
}
