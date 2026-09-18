<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'date',
        'cost_lkr',
        'description',
        'expense_type',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'cost_lkr' => 'decimal:2',
        ];
    }
}
