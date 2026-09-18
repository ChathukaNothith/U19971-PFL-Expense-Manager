# API changes and assumptions

## Baseline availability

The assignment brief refers to an OpenAPI 3.0.0 JSON file on Blackboard. That original JSON file was unavailable to the student. Therefore `openapi.json` is a reconstructed contract for the implemented application, not a verified revision or line-by-line diff of the original file.

## Marked changes

| Marker | Business need | Contract decision | Implementation status |
| --- | --- | --- | --- |
| CLARIFIED | Record spending in rupees. | Use `cost_lkr`; response amounts are decimal strings. The brief also mentions `cost_gbp`, creating a currency ambiguity. | Implemented; no currency conversion. |
| DOCUMENTED | Save, list and inspect expenses. | Document the implemented `/expenses` and `/expenses/{expense}` endpoints, `data` envelopes, HTTP 201/404/422 responses, validation and date/ID ordering. | Implemented; exact correspondence with the unavailable original JSON is unknown. |
| ADDED | Compare spending between months. | Add `GET /expenses/summary` with required `month=YYYY-MM`. | Implemented and tested. |
| ADDED | Understand category spending and empty months. | Add `MonthlySummary` and `CategorySummary` schemas with `total_lkr`, `expense_count` and all three category entries. | Implemented and tested. |

`x-assignment-change` markers identify the currency clarification and summary additions inside the JSON document. The root `x-assignment-changes` list records the overall assumptions and extensions. These annotations refer to the business brief and implemented baseline; they do not assert a comparison with the missing original specification.

## Monthly summary behaviour

The date interval includes the first day of the selected month and excludes the first day of the next month. The response contains one category entry for travel, food and other, in that order. Categories without records return `0.00` and a zero count. Invalid or missing month values produce HTTP 422 field errors. The React month selector changes the summary; the main expense list continues to show all recorded expenses.

Example response:

```json
{
    "data": {
        "month": "2026-09",
        "total_lkr": "700.00",
        "expense_count": 2,
        "by_type": [
            {
                "expense_type": "travel",
                "total_lkr": "250.00",
                "expense_count": 1
            },
            {
                "expense_type": "food",
                "total_lkr": "450.00",
                "expense_count": 1
            },
            {
                "expense_type": "other",
                "total_lkr": "0.00",
                "expense_count": 0
            }
        ]
    }
}
```

## Validation and representation

The React form submits amounts as numeric strings; the API also accepts JSON numbers. Both input forms are subject to server-side positivity, range and decimal-place checks. The string branch of the OpenAPI input schema documents the decimal syntax; its positive value and upper bound are enforced by the server. The response uses two-decimal strings through Eloquent's decimal cast. Descriptions are trimmed by Laravel; whitespace-only values are rejected.

## Report appendix

Include the complete `docs/openapi.json` specification as an appendix and include this change table to explain the marked additions. State the missing-original-file limitation and the LKR/GBP assumption explicitly in the report.

## Reference

[OpenAPI Specification 3.0.0](https://spec.openapis.org/oas/v3.0.0.html).
