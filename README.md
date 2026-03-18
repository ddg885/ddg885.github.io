# Bonus Ecosystem Platform

## Purpose

Bonus Ecosystem Platform is a browser-based HTML/CSS/JavaScript MVP for bonus program planning and execution analysis. It ingests source files, validates and normalizes them, applies reference-table-driven mappings, links authorization to budgets and approvals, calculates obligations and payout schedules, models projected bonus activity, and presents both executive and analyst views.

The MVP prioritizes calculation integrity, traceability, validation, and warning visibility over visual polish.

## File Structure

```text
/index.html
/styles.css
/app.js
/modules/constants.js
/modules/utils.js
/modules/data-loader.js
/modules/validation-engine.js
/modules/reference-manager.js
/modules/mapping-engine.js
/modules/authorization-engine.js
/modules/planning-engine.js
/modules/allocation-engine.js
/modules/obligation-engine.js
/modules/payout-engine.js
/modules/execution-engine.js
/modules/dashboard-renderer.js
/modules/storage-manager.js
/modules/export-manager.js
/sample-data/authorized_bonus_sample.csv
/sample-data/approval_execution_sample.csv
/sample-data/budget_sample.csv
/sample-data/reference_crosswalk_sample.csv
/sample-data/assumptions_sample.csv
/README.md
```

## How to Run Locally

### Option 1: Open directly
1. Open `index.html` in a modern browser.
2. Bundled sample data auto-loads if no saved state exists.
3. If your browser restricts module or file access under `file://`, use Option 2.

### Option 2: Serve statically
Run a simple local static server from the repo root, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Supported Source Types

### Required to build the model
- Authorized Bonus Source
- Approval / Execution Source
- Budget Source
- Reference / Crosswalk Source

### Optional in the MVP
- Assumptions Source
- Personnel / Population Source is recognized conceptually but does not drive MVP outputs.

If the assumptions source is missing, the app seeds default assumption rows in the UI and model logic.

## Required and Optional Columns

The app resolves logical fields using accepted aliases.

### 1. Authorized Bonus Source
Required logical fields:
- FY
- Category
- Budget Line Item
- O/E
- Bonus Type
- Amount
- Installment Structure
- Effective Date

Optional:
- Expiration Date
- Line Identifier
- Bonus Identifier

### 2. Approval / Execution Source
Required logical fields:
- Member ID or Record Key
- Status
- Approval Date
- Amount

Optional:
- Bonus Identifier
- Category
- Budget Line Item
- O/E
- Bonus Type
- Installment Count
- Initial Amount
- Obligation Date
- Payment Date
- Cancellation Date
- Line Identifier

### 3. Budget Source
Required logical fields:
- FY
- Budget Line Item
- Category
- O/E
- Bonus Type
- Amount

### 4. Reference / Crosswalk Source
Required logical fields:
- Reference Type
- Raw Value
- Standard Value
- Active Flag

Optional:
- Effective Date
- Expiration Date
- Notes

### 5. Assumptions Source
Required logical fields:
- FY
- Category

Optional:
- Target Avg Initial Bonus
- Planned Need
- Take Rate
- Priority Rank
- Distribution Rule
- Notes

## Alias Handling

Each source type is validated against exact logical field requirements, but physical column names can use accepted aliases. The app:
- resolves aliases centrally,
- flags missing required logical fields,
- flags duplicate column mappings,
- preserves raw values,
- stores normalized values separately,
- keeps validation errors on each normalized row,
- never overwrites uploaded raw data.

## How Model Rebuild Works

When the user clicks **Rebuild Model** or changes a global filter, the app:
1. validates every loaded source file,
2. resolves logical column aliases,
3. normalizes rows into canonical entities,
4. applies reference-table mappings,
5. seeds assumption defaults if assumptions are missing,
6. matches approved rows to authorized rows,
7. runs the planning engine,
8. generates obligation records,
9. generates installment and payout schedules,
10. recomputes KPIs, variances, and warning alerts,
11. auto-saves the current application state into IndexedDB.

## Model Readiness Rules

The app shows one of three readiness states:
- **Ready**: all required sources are loaded with at least one valid row, required mappings are available, and there are no critical failures.
- **Warning**: the model can build, but non-critical exceptions or partial mappings exist.
- **Not Ready**: required sources are missing or critical validation failures exist.

Dependent calculations are prevented when the state is **Not Ready**.

## Reference-Driven Mapping

The MVP applies mappings for:
- category,
- budget line item,
- O/E,
- bonus type,
- status,
- installment structure.

If a raw value cannot be mapped:
- the raw value is retained,
- the normalized value becomes `null`,
- the row is kept,
- an exception or validation issue is surfaced explicitly.

## Matching Logic for Approved Records

The app matches approved rows to authorized rows using this hierarchy:
1. exact `bonus_identifier`
2. exact `line_identifier`
3. FY + category + bonus type + O/E + amount
4. FY + category + bonus type + amount
5. category + bonus type + amount
6. no match

Tie-breaks:
1. identifier match beats non-identifier match
2. same FY wins
3. latest effective date not after approval date wins
4. if still tied, the row is marked **Partial** with low confidence and is not auto-linked

Match statuses:
- `Matched`
- `Partial`
- `Unmatched`

Important MVP behavior:
- Partial and Unmatched rows remain visible in the model.
- All Approved rows count in overall approved dollars unless filtered out by the user.
- Partial and Unmatched rows are visible in exception tables.

## KPI Definitions

The UI uses these definitions:
- **Total Authorized Dollars** = sum of valid authorized amounts under current filters.
- **Total Projected Obligations** = projected obligations from planning under current filters.
- **Total Actual Obligations** = sum of approved amounts for rows standardized to `Approved` under current filters.
- **Total Projected Payouts** = projected payout schedule amounts under current filters and selected FY.
- **Total Actual Payouts** = derived payout schedule amounts generated from actual approved records under current filters and selected FY.
- **Remaining Headroom** = budget total minus actual obligations under current filters.
- **Approved Takers** = count of standardized `Approved` approval rows under current filters.
- **Future Liability** = sum of payout amounts with payout FY greater than selected FY under current filters.

## Important MVP Note on Actual Payouts

**Actual payouts in this MVP are derived schedules, not true payment transactions.** The payout engine creates an actual payout schedule from approved obligation records because the MVP does not yet ingest a dedicated payment transaction source.

## Browser Storage Usage

### IndexedDB
Used for:
- uploaded raw file content,
- normalized / rebuild-ready state snapshots,
- persisted rebuild outputs and runtime configuration.

### LocalStorage
Used for:
- selected filters,
- last selected page,
- reference table edits / installment rule overrides for convenience.

## How to Clear Saved State

Use the **Clear Saved State** button in the top bar or on the Data Intake page. This clears IndexedDB and LocalStorage, then reloads bundled sample files.

## Export Support

The MVP supports:
1. exporting the visible table to CSV,
2. exporting the current chart to PNG,
3. exporting the current KPI summary to CSV.

## Sample Data Coverage

The bundled sample files include:
- approved records,
- cancelled records,
- unknown status rows,
- matched approvals,
- unmatched approvals,
- lump sum structure,
- multi-installment structure,
- multiple categories,
- both Officer and Enlisted rows,
- warning / exception scenarios such as duplicate authorized rows, negative amount approval rows, unmapped or inactive line scenarios, and unmatched approvals.

## Assumptions and Current Limitations

- The app is static-only and has no backend.
- The assumptions source is optional; seeded defaults appear if assumptions are missing.
- Payment transactions are not separately loaded in the MVP.
- Reference table editing is session-persisted in browser storage and intended for lightweight rule maintenance, not full governance workflow.
- Excel parsing depends on client-side SheetJS loaded from a CDN.
- CSV parsing depends on client-side PapaParse loaded from a CDN.
- Charts and tables depend on Chart.js and Tabulator loaded from CDNs.
- The app focuses on FY/category/OE/bonus type/status filters. Additional advanced drilldowns can be added later.

## Validation Coverage

The app implements validation at these levels:
- file level,
- column level,
- record level,
- model readiness level.

Examples include:
- invalid extension,
- unreadable content,
- required columns missing,
- duplicate logical column mappings,
- numeric parse failures,
- integer parse failures,
- invalid dates,
- negative amount failures,
- duplicate-key warnings,
- unmapped critical values,
- readiness blockers for missing required sources.

## Static Technology Stack

- HTML
- CSS
- Vanilla JavaScript modules
- PapaParse
- SheetJS
- Chart.js
- Tabulator

No framework, build step, backend, or bundler is required.
