import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vite-plus/test';
import MonthlySummaryCard from '../../resources/js/components/monthly-summary';
import type { MonthlySummary } from '../../resources/js/types/expense';

function makeSummary(month: string, empty = false): MonthlySummary {
    return {
        month,
        total_lkr: empty ? '0.00' : '700.00',
        expense_count: empty ? 0 : 2,
        by_type: [
            {
                expense_type: 'travel',
                total_lkr: empty ? '0.00' : '250.00',
                expense_count: empty ? 0 : 1,
            },
            {
                expense_type: 'food',
                total_lkr: empty ? '0.00' : '450.00',
                expense_count: empty ? 0 : 1,
            },
            {
                expense_type: 'other',
                total_lkr: '0.00',
                expense_count: 0,
            },
        ],
    };
}

function apiResponse(summary: MonthlySummary) {
    return new Response(JSON.stringify({ data: summary }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

it('shows the monthly total and each expense category', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValue(apiResponse(makeSummary('2026-09')));
    vi.stubGlobal('fetch', fetchMock);

    render(<MonthlySummaryCard revision={0} />);

    const monthInput = screen.getByLabelText(
        'Select month',
    ) as HTMLInputElement;

    expect(await screen.findByText(/^LKR\s+700\.00$/)).toBeTruthy();

    expect(screen.getByText(/^LKR\s+250\.00$/)).toBeTruthy();
    expect(screen.getByText(/^LKR\s+450\.00$/)).toBeTruthy();
    expect(screen.getByText(/^LKR\s+0\.00$/)).toBeTruthy();

    expect(screen.getByText('travel')).toBeTruthy();
    expect(screen.getByText('food')).toBeTruthy();
    expect(screen.getByText('other')).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith(
        `/api/expenses/summary?month=${monthInput.value}`,
        expect.any(Object),
    );
});

it('loads another month and shows an empty-month message', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(apiResponse(makeSummary('2026-09')));
    vi.stubGlobal('fetch', fetchMock);

    render(<MonthlySummaryCard revision={0} />);
    await screen.findByText(/^LKR\s+700\.00$/);

    const monthInput = screen.getByLabelText(
        'Select month',
    ) as HTMLInputElement;

    const nextMonth = monthInput.value === '2026-10' ? '2026-11' : '2026-10';

    fetchMock.mockResolvedValueOnce(apiResponse(makeSummary(nextMonth, true)));

    fireEvent.change(monthInput, {
        target: { value: nextMonth },
    });

    expect(
        await screen.findByText('No expenses recorded for this month.'),
    ).toBeTruthy();

    expect(screen.getAllByText(/^LKR\s+0\.00$/)).toHaveLength(4);

    expect(fetchMock).toHaveBeenLastCalledWith(
        `/api/expenses/summary?month=${nextMonth}`,
        expect.any(Object),
    );
});

it('allows retrying after a connection error', async () => {
    const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(apiResponse(makeSummary('2026-09')));

    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<MonthlySummaryCard revision={0} />);

    expect((await screen.findByRole('alert')).textContent).toContain(
        'Unable to load the monthly summary.',
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText(/^LKR\s+700\.00$/)).toBeTruthy();

    expect(screen.queryByRole('alert')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('refreshes totals when the revision changes', async () => {
    const updated = makeSummary('2026-09');
    updated.total_lkr = '800.00';
    updated.expense_count = 3;
    updated.by_type[0].total_lkr = '350.00';
    updated.by_type[0].expense_count = 2;

    const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(apiResponse(makeSummary('2026-09')))
        .mockResolvedValueOnce(apiResponse(updated));

    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(<MonthlySummaryCard revision={0} />);
    await screen.findByText(/^LKR\s+700\.00$/);

    rerender(<MonthlySummaryCard revision={1} />);

    expect(await screen.findByText(/^LKR\s+800\.00$/)).toBeTruthy();

    expect(screen.getByText(/^LKR\s+350\.00$/)).toBeTruthy();
    expect(screen.queryByText(/^LKR\s+700\.00$/)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
});
