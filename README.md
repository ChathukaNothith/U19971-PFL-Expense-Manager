# Expense Manager

U19971 - Programming Frameworks & Languages, Assessment 1.

A Laravel and React web application for recording expenses in Sri Lankan rupees, viewing the expense list and inspecting individual records. The extra feature provides monthly totals and spending by category.

## Features

- Save an expense with a date, LKR amount, description and type: travel, food or other.
- List expenses by date descending, then ID descending.
- Open individual expense details.
- Select a month and view the total, category totals and expense counts.
- Refresh the selected summary after a successful save.
- Show validation errors, loading states, connection errors, retry controls and a friendly missing-expense message.
- Provide labelled inputs, a skip link, visible keyboard focus and live status messages.
- Adapt the form and expense list to smaller screens.

## Requirements

- PHP 8.4 with SQLite support, matching the CI environment and locked development dependencies.
- Composer 2.
- Node.js 24 and npm.
- Git.

## Run locally on Windows PowerShell

```powershell
git clone https://github.com/ChathukaNothith/U19971-PFL-Expense-Manager.git
cd U19971-PFL-Expense-Manager
Copy-Item .env.example .env
php -r "file_exists('database/database.sqlite') || file_put_contents('database/database.sqlite', '');"
composer install
php artisan key:generate
npm.cmd ci
php artisan migrate
npm.cmd run build
php artisan serve
```

Open http://127.0.0.1:8000. These commands are for a fresh clone; keep an existing `.env` and database when updating an installation. The example environment selects SQLite. The database file is excluded from Git.

On macOS or Linux, use `cp .env.example .env` instead of `Copy-Item` and `npm` instead of `npm.cmd`; the other commands are the same.

For frontend development, run `npm.cmd run dev` in a second terminal while `php artisan serve` runs. For the built-asset demonstration, use the production build and stop the frontend development server.

## Checks and tests

```powershell
composer ci:check
npm.cmd run test
npm.cmd run build
```

`composer ci:check` runs frontend formatting/lint checks, TypeScript checking, PHP style checks, PHPStan/Larastan and the backend tests. Frontend tests run separately through `npm.cmd run test` using the Vitest runner included in Vite Plus.

To apply style fixes:

```powershell
npm.cmd run check:fix
composer lint
```

Validation at the monthly-summary implementation commit: 27 backend tests with 104 assertions, and 12 frontend tests across five files. These are test counts, not measured code-coverage percentages.

Backend tests use a separate in-memory SQLite database. Summary tests check month boundaries, decimal totals, category counts, empty months and invalid month input. Frontend tests check saving/resetting, validation errors, connection errors, duplicate submission prevention, expense lists/details and summary display, month selection, retry and refresh.

The GitHub Actions workflow runs on pushes to `main`, pull requests and manual dispatch. It installs dependencies, builds assets, runs code checks/backend tests and runs frontend tests. `LARAVEL_BYPASS_ENV_CHECK=1` is scoped to the frontend test step because the Laravel Vite plugin otherwise rejects the test runner's internal Vite server in CI.

## API

Base URL: `http://127.0.0.1:8000/api`. Requests and responses use JSON.

| Method | Path                              | Behaviour                                     |
| ------ | --------------------------------- | --------------------------------------------- |
| GET    | `/expenses`                       | List all expenses, newest dates first.        |
| POST   | `/expenses`                       | Save a validated expense; return HTTP 201.    |
| GET    | `/expenses/{expense}`             | Fetch one record; return HTTP 404 if missing. |
| GET    | `/expenses/summary?month=2026-09` | Return monthly totals and category counts.    |

Successful responses wrap their payload in `data`. Amounts in responses are strings with two decimal places. Validation failures return HTTP 422 with `message` and field `errors`.

Example POST body:

```json
{
    "date": "2026-09-18",
    "cost_lkr": "250.00",
    "description": "Bus fare to university",
    "expense_type": "travel"
}
```

All four fields are required. Dates must be valid `YYYY-MM-DD` values. Amounts must be positive, have at most two decimal places and not exceed `9999999999.99`. Descriptions have a maximum of 2,000 characters. Summary requests require a valid `YYYY-MM` month.

See [the OpenAPI 3.0.0 specification](docs/openapi.json) and [the marked changes and assumptions](docs/api-changes.md). The original Blackboard JSON was unavailable, so this contract is reconstructed from the brief and implemented code; compliance with that unseen original file has not been verified.

## Architecture

- `routes/api.php`: API routing.
- `app/Http/Controllers/Api/ExpenseController.php`: list, create, detail and summary responses.
- `app/Http/Requests/StoreExpenseRequest.php`: expense validation.
- `app/Models/Expense.php`: Eloquent persistence and date/decimal casts.
- `database/migrations/`: database schema.
- `resources/js/pages/`: Inertia React pages.
- `resources/js/components/`: expense form, list and monthly summary.
- `resources/js/lib/expense-api.ts`: shared fetch client and API errors.
- `resources/js/types/expense.ts`: TypeScript expense and summary contracts.
- `tests/Feature/`: backend API tests.
- `tests/frontend/`: React Testing Library tests.

## Scope and limitations

This is a local, single-user coursework prototype. Authentication, per-user data isolation, edit/delete operations, pagination and receipt uploads are not implemented. Accessibility features are present, but no formal WCAG conformance audit is claimed. Monthly totals are accumulated using integer cents; final amounts are formatted as rupees.

The assignment brief asks for rupees but mentions `cost_gbp`. The implementation uses `cost_lkr` to make the currency explicit. No currency conversion is performed.

## Specification reference

The API document follows the [official OpenAPI 3.0.0 specification](https://spec.openapis.org/oas/v3.0.0.html).
