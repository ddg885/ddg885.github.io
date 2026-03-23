# HOWTO: Bonus Ecosystem Platform

This guide explains how to use the **Bonus Ecosystem Platform** in this repository.

It is written for someone who is **not a programmer** and just wants to open the app, load files, review the results, and avoid common mistakes.

---

## 1) What this app does

The Bonus Ecosystem Platform is a **browser-based planning and monitoring tool** for bonus programs.

In plain language, it helps you:

- load bonus-related spreadsheets or CSV files,
- check whether those files have the right columns and valid values,
- translate raw values into standard values using a reference table,
- match approval records to authorized bonus records,
- estimate projected takers and obligations,
- build payout schedules by fiscal year,
- compare plan vs. actual execution,
- export the current page for sharing.

This app runs as a **static website**. That means it does **not** need a backend server or database service. It stores your working session in your browser using **IndexedDB** and **localStorage**. If you clear saved state, the app reloads the bundled sample files. The app also auto-loads the bundled sample files the first time it runs if no prior saved state exists. 【F:index.html†L23-L44】【F:modules/storage-manager.js†L3-L60】【F:app.js†L2504-L2522】

---

## 2) Who this app is for

This app is mainly for people who need to **review or model bonus program data** without setting up a software system.

Examples:

- program managers,
- financial planners,
- analysts,
- reviewers,
- leaders who want dashboards and summary views.

It is especially helpful if you want a **single browser app** that shows:

- data quality problems,
- mapping exceptions,
- unmatched approvals,
- projected obligations,
- payout timing,
- execution KPIs.

The app is **not** a transactional system. It does not write back to source systems. It is closer to a **self-contained analysis and review tool**. That is based on how the repository is built: the app loads local files, normalizes data, computes models in JavaScript, and exports snapshots, but there is no API, login flow, or backend service in this repository. 【F:README.md†L5-L10】【F:index.html†L6-L44】【F:modules/export-manager.js†L4-L122】

---

## 3) Files this app needs

### Required source files

To fully build the model, the app expects these source types:

1. **Authorized Bonus Source**
2. **Approval / Execution Source**
3. **Budget Source**
4. **Reference / Crosswalk Source**

These are the files the model treats as required before it can be fully ready. 【F:README.md†L38-L45】【F:modules/validation-engine.js†L267-L292】

### Optional source files

- **Assumptions Source**
- **Personnel / Population Source** is listed as a concept, but it does not drive the MVP outputs in this repository. 【F:README.md†L46-L49】【F:modules/constants.js†L14-L21】

If you do **not** upload an assumptions file, the app automatically creates default assumption rows from the valid authorized categories. 【F:modules/reference-manager.js†L53-L69】【F:app.js†L2404-L2408】

### Bundled sample files already included in this repository

The repository ships with sample files under `sample-data/`:

- `sample-data/authorized_bonus_sample.csv`
- `sample-data/approval_execution_sample.csv`
- `sample-data/budget_sample.csv`
- `sample-data/reference_crosswalk_sample.csv`
- `sample-data/assumptions_sample.csv` 【F:README.md†L25-L29】【F:sample-data/authorized_bonus_sample.csv†L1-L7】【F:sample-data/approval_execution_sample.csv†L1-L9】【F:sample-data/budget_sample.csv†L1-L6】【F:sample-data/reference_crosswalk_sample.csv†L1-L25】【F:sample-data/assumptions_sample.csv†L1-L5】

These sample files are also embedded in the app so they can auto-load even without reading from the `sample-data/` folder directly. 【F:modules/constants.js†L151-L162】【F:modules/data-loader.js†L102-L114】

---

## 4) How to launch it from GitHub Pages

### The short version

Because this repository contains a root `index.html`, GitHub Pages can serve the app as a static site. The main app screen is defined in that file. 【F:index.html†L1-L44】

### If this repository is published as a GitHub Pages **user site**

This repository is named `ddg885.github.io`, which usually means GitHub Pages serves it at:

- `https://ddg885.github.io/`

In that setup, visiting the site root should open the app, because the repository includes `index.html` at the top level. This is an inference based on the repository name and the presence of the root `index.html`. I did not verify the live Pages settings from GitHub itself. 【F:index.html†L1-L44】

### If GitHub Pages is not enabled yet

In GitHub:

1. Open the repository.
2. Go to **Settings**.
3. Open **Pages**.
4. Under **Build and deployment**, choose the branch that contains this repository.
5. Use the **root** folder as the publish location.
6. Save.
7. Wait for GitHub Pages to publish.
8. Open the published URL.

### Important note about internet access

This app loads several libraries from public CDNs:

- Tabulator
- Papa Parse
- SheetJS (`xlsx`)
- Chart.js 【F:index.html†L6-L44】

So GitHub Pages is a good fit, but the page still needs normal browser internet access to load those libraries.

### If you want to run it locally instead

You can also:

- open `index.html` directly in a browser, or
- start a simple local web server such as `python3 -m http.server 8000` and then open `http://localhost:8000`. 【F:README.md†L31-L37】

---

## 5) What you will see when the app opens

The app has:

- a left sidebar with pages,
- a top bar with filters,
- buttons to rebuild, clear saved state, and export the current view,
- a data intake area where you choose a source type and upload files. 【F:index.html†L10-L44】【F:modules/dashboard-renderer.js†L79-L99】

### Main pages in the sidebar

- Home
- Data Intake
- Reference Tables
- Planning & Costing
- Authorized Construct
- Approvals & Obligations
- Payout Engine
- Executive Dashboard
- Execution Monitoring 【F:modules/constants.js†L4-L12】

### Top filters

You can filter by:

- Fiscal Year
- Category
- O/E
- Bonus Type
- Status 【F:index.html†L23-L41】

Changing a top filter triggers a rebuild of the model. 【F:app.js†L2480-L2491】

---

## 6) How to use the app step by step

## Step 1: Start with the sample data

If there is no saved state in your browser, the bundled sample data loads automatically. You can also click **Reload Bundled Samples** at any time. 【F:index.html†L48-L57】【F:app.js†L2504-L2522】

This is the easiest way to learn the screens before using your own files.

---

## Step 2: Use the **Data Intake** page

Go to **Data Intake**.

Here you can:

- choose a **Source Type**,
- upload one or more `.csv`, `.xls`, or `.xlsx` files,
- review loaded file counts,
- review validation issues,
- see the current **Model Readiness** state. 【F:index.html†L48-L52】【F:modules/data-loader.js†L29-L88】【F:modules/dashboard-renderer.js†L168-L205】

### Important upload tip

The app does **not** automatically detect the business meaning of your file. You must choose the correct **Source Type** before uploading. The uploaded file record stores the type you selected. 【F:index.html†L48-L52】【F:modules/data-loader.js†L43-L88】

### Duplicate upload behavior

If you upload a file that looks similar to one already loaded, the app asks whether to replace the existing one. Duplicate checking is based on filename plus row count or file hash. 【F:modules/data-loader.js†L116-L121】【F:app.js†L2457-L2466】

---

## Step 3: Check **Model Readiness**

The app shows one of three states:

- **Ready**
- **Warning**
- **Not Ready** 【F:README.md†L100-L107】【F:modules/constants.js†L27-L31】

### What they mean

- **Ready**: all required source types have at least one valid row and there are no critical failures.
- **Warning**: the model can still run, but there are exceptions, mapping issues, or other non-critical problems.
- **Not Ready**: a required source is missing or there are critical validation errors. When this happens, the deeper model calculations do not run. 【F:modules/validation-engine.js†L267-L292】【F:app.js†L2422-L2438】

If you are stuck, always go back to **Data Intake** and review the validation table first.

---

## Step 4: Review or edit **Reference Tables**

Go to **Reference Tables**.

This page lets you review and edit mapping tables for:

- status,
- category,
- budget line item,
- O/E,
- bonus type,
- installment structure,
- installment rules. 【F:modules/dashboard-renderer.js†L207-L238】

### Why this matters

The app uses these mappings to standardize raw values from your files. For example:

- status code `A` can become `Approved`,
- `Officer` can become `O`,
- raw line-item names can map to a standard line item. 【F:modules/reference-manager.js†L4-L35】【F:modules/mapping-engine.js†L23-L80】

### Important limitation

When you click **Save Edits**, the changes are stored in browser state and used in rebuilds, but they are **not written back into the CSV files in this repository**. The saved edits live in the app's local browser storage unless you manually update the source files yourself. That behavior comes from `referenceTableOverrides` being stored in UI/runtime state and reused during rebuilds. 【F:modules/dashboard-renderer.js†L219-L238】【F:app.js†L2335-L2348】【F:app.js†L2392-L2403】

---

## Step 5: Open **Authorized Construct**

This page shows the valid authorized bonus records after mapping.

You will see:

- total authorized dollars,
- line-item count,
- average authorized amount,
- unmapped row count,
- a category chart,
- a detailed table. 【F:modules/dashboard-renderer.js†L240-L261】

Use this page to confirm that your authorization source loaded the way you expected.

---

## Step 6: Open **Planning & Costing**

This page creates the planning model.

It shows:

- projected taker target,
- supportable takers,
- projected obligations,
- unfunded need,
- budget vs projected obligations by category,
- target vs achieved initial average bonus,
- projected allocation detail. 【F:modules/dashboard-renderer.js†L264-L299】

### How the planning model works in this repository

In simplified terms:

1. The app groups valid records by category.
2. It reads planned need and take rate from the assumptions file.
3. It sets `projected_taker_target` to `round(planned_need * take_rate)` when take rate is present.
4. It tries to allocate takers within the category budget.
5. It may shift takers between rows if that improves the average initial payment target without exceeding budget. 【F:modules/planning-engine.js†L14-L66】【F:modules/allocation-engine.js†L3-L83】

If no assumptions file is provided, the app seeds basic default assumptions, but those defaults start with `planned_need: 0`, so the planning outputs may be minimal until you provide better assumptions or edit your sources. 【F:modules/reference-manager.js†L53-L69】

---

## Step 7: Open **Approvals & Obligations**

This page shows actual approval data and matching results.

It includes:

- approved count and dollars,
- cancelled count and dollars,
- obligation by fiscal year,
- status distribution,
- a detail table,
- an exception table. 【F:modules/dashboard-renderer.js†L300-L351】

### How approval matching works

The app tries to link approval rows to authorized rows in this order:

1. exact `bonus_identifier`
2. exact `line_identifier`
3. FY + category + bonus type + O/E + amount
4. FY + category + bonus type + amount
5. category + bonus type + amount
6. no match 【F:README.md†L124-L135】【F:modules/authorization-engine.js†L63-L100】

If a tie still cannot be resolved, the row becomes:

- `Partial`
- low confidence
- exception flag = true
- no automatic link to an authorized bonus ID. 【F:modules/authorization-engine.js†L13-L42】【F:modules/authorization-engine.js†L110-L124】

This is why you may see approved records that are still counted in totals but also appear in exception lists.

---

## Step 8: Open **Payout Engine**

This page turns obligations into payout schedules.

It shows:

- projected payouts for the selected FY,
- actual payouts for the selected FY,
- future liability,
- reconciliation exceptions,
- installment detail,
- liability by record. 【F:modules/dashboard-renderer.js†L352-L399】

### How payout schedules are built

The app uses the installment structure rules to decide:

- how many installments exist,
- how much is paid initially,
- how much remains for anniversary installments,
- how far apart installment dates are. 【F:modules/payout-engine.js†L3-L73】

The final installment is “true-upped” so the displayed installment amounts add up exactly to the original obligation amount. 【F:modules/payout-engine.js†L27-L73】

### One thing to know

If an approval row does not clearly resolve to an authorized bonus row, the app may fall back to `Unknown` installment structure logic for payout generation. That comes from the payout engine resolving an explicit structure first, then an authorized structure if linked, and otherwise using `Unknown`. 【F:modules/payout-engine.js†L4-L11】【F:modules/reference-manager.js†L37-L42】

---

## Step 9: Open **Executive Dashboard**

This is the leadership summary page.

It shows KPIs such as:

- total authorized dollars,
- total projected obligations,
- total actual obligations,
- total projected payouts,
- total actual payouts,
- remaining headroom,
- approved takers,
- future liability. 【F:modules/dashboard-renderer.js†L400-L448】【F:modules/execution-engine.js†L3-L32】

In this repository, **actual obligations** are calculated directly from approved rows, not from a blended or projected source. 【F:modules/execution-engine.js†L8-L19】

---

## Step 10: Open **Execution Monitoring**

This is the more detailed analyst page.

It shows:

- taker variance,
- obligation variance,
- payout variance,
- cancellation rate,
- unmapped rate,
- category variance charts,
- trend charts,
- variance detail,
- exception lists. 【F:modules/dashboard-renderer.js†L450-L503】

Alerts are raised when warning thresholds are exceeded, such as large obligation variance, high cancellation rate, high unmapped rate, budget overruns, or heavy future liability concentration. 【F:modules/constants.js†L47-L53】【F:modules/execution-engine.js†L55-L74】

---

## Step 11: Use **Export Current View**

The **Export Current View** button tries to export:

- the visible table as CSV,
- the active chart as PNG,
- the current KPI summary as CSV,
- an HTML snapshot of the current page. 【F:index.html†L39-L44】【F:modules/export-manager.js†L4-L122】【F:app.js†L2493-L2522】

So in many cases, one click produces several download files.

---

## 7) What file format the app expects

## Accepted file types

The uploader accepts:

- `.csv`
- `.xlsx`
- `.xls` 【F:index.html†L50-L52】【F:modules/data-loader.js†L43-L88】

### Spreadsheet note

For Excel files, the app reads **only the first worksheet**. If your data is on another tab, move it to the first sheet or save that sheet as CSV first. 【F:modules/data-loader.js†L14-L23】

---

## 8) Required columns by source type

The app supports some column name aliases, but the meaning must still match the expected logical fields.

## A. Authorized Bonus Source

### Required columns

- FY
- Category
- Budget Line Item
- O/E
- Bonus Type
- Amount
- Installment Structure
- Effective Date 【F:README.md†L53-L63】【F:modules/constants.js†L56-L68】

### Optional columns

- Expiration Date
- Line Identifier
- Bonus Identifier 【F:README.md†L64-L67】【F:modules/constants.js†L64-L68】

### Example header from this repository

`FY,Category,Budget Line Item,O/E,Bonus Type,Amount,Installment Structure,Effective Date,Expiration Date,Line Identifier,Bonus Identifier` 【F:sample-data/authorized_bonus_sample.csv†L1-L1】

---

## B. Approval / Execution Source

### Required columns

- Member ID or Record Key
- Status
- Approval Date
- Amount

The code uses aliases such as `Member ID`, `MemberID`, `Record Key`, `EDIPI`, and others. 【F:README.md†L69-L84】【F:modules/constants.js†L71-L85】

### Optional columns

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
- Line Identifier 【F:README.md†L74-L84】【F:modules/constants.js†L75-L85】

### Example header from this repository

`Member ID,Status,Approval Date,Amount,Bonus Identifier,Category,Budget Line Item,O/E,Bonus Type,Installment Count,Initial Amount,Obligation Date,Payment Date,Cancellation Date,Line Identifier` 【F:sample-data/approval_execution_sample.csv†L1-L1】

---

## C. Budget Source

### Required columns

- FY
- Budget Line Item
- Category
- O/E
- Bonus Type
- Amount 【F:README.md†L86-L92】【F:modules/constants.js†L88-L96】

### Example header from this repository

`FY,Budget Line Item,Category,O/E,Bonus Type,Amount` 【F:sample-data/budget_sample.csv†L1-L1】

---

## D. Reference / Crosswalk Source

### Required columns

- Reference Type
- Raw Value
- Standard Value
- Active Flag 【F:README.md†L93-L98】【F:modules/constants.js†L98-L106】

### Optional columns

- Effective Date
- Expiration Date
- Notes 【F:README.md†L97-L98】【F:modules/constants.js†L102-L106】

### Example header from this repository

`Reference Type,Raw Value,Standard Value,Active Flag,Effective Date,Expiration Date,Notes` 【F:sample-data/reference_crosswalk_sample.csv†L1-L1】

---

## E. Assumptions Source

### Required columns

- FY
- Category 【F:README.md†L99-L107】【F:modules/constants.js†L108-L117】

### Optional columns

- Target Avg Initial Bonus
- Planned Need
- Take Rate
- Priority Rank
- Distribution Rule
- Notes 【F:README.md†L99-L107】【F:modules/constants.js†L110-L117】

### Example header from this repository

`FY,Category,Target Avg Initial Bonus,Planned Need,Take Rate,Priority Rank,Distribution Rule,Notes` 【F:sample-data/assumptions_sample.csv†L1-L1】

---

## 9) Rules about values inside the files

Here are the most important data rules the app enforces.

### Numbers

- Numeric fields must be numeric.
- Negative numbers are rejected for most required amount fields.
- The parser can handle values with commas, dollar signs, spaces, or percent signs because it strips those characters before converting to a number. 【F:modules/validation-engine.js†L21-L44】【F:modules/utils.js†L18-L23】

### Dates

- Date fields must be valid dates.
- The date parser accepts normal date strings and also numeric Excel-style date serial values. 【F:modules/validation-engine.js†L21-L44】【F:modules/utils.js†L31-L43】

### Fiscal year logic

The app derives fiscal year from dates using this rule:

- October through December roll into the next fiscal year.
- January through September stay in the same calendar year. 【F:modules/utils.js†L45-L53】

### Blank mapped values

If a raw value should be mapped through a reference table but no active mapping exists, the standardized value becomes blank (`null`) and the row is flagged. The raw value is still preserved. 【F:modules/mapping-engine.js†L3-L21】【F:modules/mapping-engine.js†L23-L80】

---

## 10) Common errors and how to fix them

## Error: “Missing required column for …”

**What it means:**
Your file is missing a required column name or alias.

**How to fix it:**

- Compare your header row to the examples above.
- Rename your columns to one of the accepted aliases.
- Re-upload the corrected file. 【F:modules/utils.js†L139-L162】【F:modules/constants.js†L56-L117】

---

## Error: “Multiple columns resolve to …”

**What it means:**
Two or more of your columns look like aliases for the same logical field.

**How to fix it:**

- Keep only one matching column.
- Remove duplicate columns like `FY` and `Fiscal Year` if they both contain the same meaning. 【F:modules/utils.js†L139-L162】

---

## Error: “Physical column X mapped to multiple logical fields”

**What it means:**
One column header is being interpreted as more than one field.

**How to fix it:**

- Rename the header so it clearly matches just one expected field. 【F:modules/utils.js†L153-L160】

---

## Error: “must be numeric” or “cannot be negative”

**What it means:**
A numeric field contains text or a negative value the model does not allow.

**How to fix it:**

- Remove non-numeric text.
- Use positive amounts where required.
- If your source truly contains negative adjustments, note that this MVP treats those as validation errors for many fields, so you may need to preprocess the data outside the app first. That is visible in the validation rules and sample negative approval row behavior. 【F:modules/validation-engine.js†L21-L44】【F:sample-data/approval_execution_sample.csv†L9-L9】

---

## Error: “must be a valid date”

**What it means:**
A date column has an unrecognized or invalid date.

**How to fix it:**

- Use standard date values like `2025-10-01`.
- If you upload Excel, make sure the date cell really contains a date value.
- If the workbook uses multiple sheets, make sure the first sheet has the correct data. 【F:modules/validation-engine.js†L21-L44】【F:modules/data-loader.js†L14-L23】

---

## Warning: unmapped category / line item / O/E / bonus type / installment structure / status

**What it means:**
The raw value is not in the active reference mappings.

**How to fix it:**

- Go to **Reference Tables** and add or correct the mapping.
- Or update the source CSV so the raw value matches an active mapping.
- Then rebuild the model. 【F:modules/mapping-engine.js†L3-L21】【F:modules/reference-manager.js†L4-L35】【F:modules/dashboard-renderer.js†L207-L238】

---

## Warning: duplicate upload detected

**What it means:**
The app thinks you uploaded the same or a very similar file again.

**How to fix it:**

- If you intended to replace it, click **OK** when prompted.
- If not, cancel and keep the existing file. 【F:modules/data-loader.js†L116-L121】【F:app.js†L2457-L2466】

---

## Problem: model stays “Not Ready”

**What it usually means:**

- a required source file is missing,
- every row in a required source is invalid,
- or critical validation errors still exist. 【F:modules/validation-engine.js†L267-L292】

**How to fix it:**

1. Go to **Data Intake**.
2. Check the loaded files table.
3. Check the validation issue table.
4. Confirm you have all four required source types.
5. Fix the bad rows and re-upload.
6. Click **Rebuild Model**. 【F:modules/dashboard-renderer.js†L168-L205】【F:app.js†L2392-L2449】

---

## Problem: a file uploads, but the results look wrong

**Common reasons:**

- you chose the wrong **Source Type** before uploading,
- your data was on the wrong Excel sheet,
- your reference mappings do not cover your raw values,
- your top-bar filters are hiding part of the data. 【F:index.html†L48-L52】【F:modules/data-loader.js†L14-L23】【F:app.js†L2373-L2390】

**How to fix it:**

- confirm the selected source type,
- review the Data Intake validation table,
- check Reference Tables,
- temporarily clear filters to “All.”

---

## Problem: my edits disappeared

**Possible reason:**
The app saves state in your browser. If you click **Clear Saved State**, use a different browser, use private browsing, or clear browser storage, your locally saved app state and reference edits can disappear. 【F:index.html†L39-L44】【F:modules/storage-manager.js†L15-L60】【F:app.js†L2469-L2476】

**How to fix it:**

- keep backup copies of your CSV files,
- if you make important reference-table changes, also update the repository files or document those edits outside the app,
- avoid clearing state unless you intend to reset. 【F:app.js†L2469-L2476】

---

## 11) How to update the app safely

If you maintain this repository and want to update the app without breaking it, this is the safest non-technical process.

### Safe update checklist

1. **Keep a backup** of your current CSV files.
2. **Test with the bundled sample data first** by reloading samples.
3. **Open every major page** and make sure charts and tables still load.
4. **Check Data Intake** for new validation issues.
5. **Check Reference Tables** if you changed column names or allowed values.
6. **Verify exports** using **Export Current View**.
7. **Only then** move on to real data. 【F:app.js†L2469-L2522】【F:modules/dashboard-renderer.js†L79-L99】

### If you change input columns

Be careful. The app depends on alias mappings in `modules/constants.js`. If you invent new column names and they are not listed there, the app will report missing required columns. 【F:modules/constants.js†L56-L117】【F:modules/utils.js†L139-L162】

### If you change reference values

Also update the reference crosswalk or in-app reference edits so the raw values still map cleanly. Otherwise you will see unmapped warnings and blanks in the normalized fields. 【F:modules/reference-manager.js†L4-L35】【F:modules/mapping-engine.js†L3-L21】

### If you publish to GitHub Pages

After updating the repository:

- confirm that GitHub Pages is still publishing from the correct branch and root,
- reload the site,
- use **Reload Bundled Samples** or **Clear Saved State** if the browser is still holding old state. 【F:app.js†L2469-L2476】【F:app.js†L2504-L2522】

---

## 12) FAQ

### Q1: Do I need to install anything?

Usually no. This app is a static website. You open it in a browser or host it on GitHub Pages. 【F:index.html†L1-L44】【F:README.md†L31-L37】

### Q2: Does it support Excel files?

Yes, `.xls` and `.xlsx` are accepted. But the app reads only the **first worksheet**. 【F:index.html†L50-L52】【F:modules/data-loader.js†L14-L23】

### Q3: Does it save my work?

Yes, in your browser storage. It uses IndexedDB for app state and localStorage for UI preferences. That means your saved state is local to that browser. 【F:modules/storage-manager.js†L3-L60】

### Q4: Can I share results with someone else?

Yes. Use **Export Current View** to download table data, chart images, KPI summaries, and an HTML snapshot. 【F:modules/export-manager.js†L4-L122】【F:app.js†L2493-L2522】

### Q5: Why do I see a row in totals and also in exceptions?

Because the app intentionally keeps partial and unmatched approval rows visible instead of silently removing them. 【F:README.md†L141-L145】【F:modules/authorization-engine.js†L110-L133】

### Q6: What happens if I do not upload assumptions?

The app creates default assumptions from the valid authorized categories. Those defaults are basic and may not give meaningful planning outputs until you supply real planning values. 【F:modules/reference-manager.js†L53-L69】【F:app.js†L2404-L2408】

### Q7: Does the app write changes back into my CSV files?

No. It works on in-browser copies and local saved state. Exports create new files, but the original uploaded CSV or Excel files are not rewritten by the app. That is based on the code paths for upload, storage, and export in this repository. 【F:modules/data-loader.js†L43-L88】【F:modules/storage-manager.js†L15-L60】【F:modules/export-manager.js†L4-L122】

### Q8: What behavior is still unclear?

A few things are not fully explained in the UI text even after inspecting the code:

- The app allows editing reference tables in the browser, but there is no built-in “download updated reference table back to source file” workflow.
- The repository contains both `index.md` and `index.html`; based on standard static-site behavior, `index.html` should be the app entry point, but I did not verify the live GitHub Pages deployment settings.
- The app accepts `.xls/.xlsx`, but only the first worksheet is used, so multi-sheet workflows are limited. This behavior is clear in code, but the UI itself does not spell it out. 【F:index.html†L1-L44】【F:index.md†L1-L8】【F:modules/data-loader.js†L14-L23】【F:modules/dashboard-renderer.js†L207-L238】

---

## 13) Recommended first-time workflow

If you are brand new to this app, use this order:

1. Open the app.
2. Click **Reload Bundled Samples**.
3. Visit **Data Intake** and confirm readiness.
4. Visit **Reference Tables** and scan the mappings.
5. Visit **Authorized Construct**.
6. Visit **Planning & Costing**.
7. Visit **Approvals & Obligations**.
8. Visit **Payout Engine**.
9. Visit **Executive Dashboard**.
10. Visit **Execution Monitoring**.
11. Use **Export Current View** on a page you want to share. 【F:modules/constants.js†L4-L12】【F:index.html†L23-L57】

That path gives the smoothest introduction to how the repository's app works.
