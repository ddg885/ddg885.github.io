import { APP_TITLE, MODEL_READINESS, PAGE_DEFINITIONS, SOURCE_TYPE_OPTIONS, SOURCE_TYPES } from './constants.js';
import { exportRows } from './export-manager.js';
import { formatDate, nowIso, optionize, toCurrency, toPercent } from './utils.js';

function card(title, value, tone = 'default', subtitle = '') {
  return `<div class="metric-card ${tone}"><div class="metric-title">${title}</div><div class="metric-value">${value}</div>${subtitle ? `<div class="metric-subtitle">${subtitle}</div>` : ''}</div>`;
}

function renderCardGrid(cards) {
  return `<div class="card-grid">${cards.join('')}</div>`;
}

function renderAlertList(alerts = []) {
  if (!alerts.length) return '<div class="panel"><h3>Top Alerts</h3><p>No current alerts. Model calculations are within configured warning thresholds.</p></div>';
  return `<div class="panel"><h3>Top Alerts</h3><ul class="alert-list">${alerts.map((alert) => `<li>${alert}</li>`).join('')}</ul></div>`;
}

function makeColumns(fields) {
  return fields.map((field) => ({ title: field.title, field: field.field, sorter: field.sorter || 'string', headerFilter: 'input', hozAlign: field.align || 'left', formatter: field.formatter }));
}

function createTable(containerSelector, data, columns, options = {}) {
  const element = document.querySelector(containerSelector);
  if (!element) return null;
  element.innerHTML = '';
  return new window.Tabulator(containerSelector, {
    data,
    columns,
    layout: 'fitColumns',
    movableColumns: true,
    pagination: true,
    paginationSize: 8,
    placeholder: 'No records available under current filters.',
    initialSort: options.initialSort || [],
    ...options,
  });
}

function destroyCharts(chartMap) {
  Object.values(chartMap).forEach((chart) => chart?.destroy?.());
}

function destroyTables(tableMap) {
  Object.values(tableMap).forEach((table) => table?.destroy?.());
}

function createBarChart(canvasSelector, labels, datasets, options = {}) {
  const canvas = document.querySelector(canvasSelector);
  if (!canvas) return null;
  return new window.Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } },
      ...options,
    },
  });
}

function readinessTone(status) {
  if (status === MODEL_READINESS.READY) return 'positive';
  if (status === MODEL_READINESS.WARNING) return 'warning';
  return 'negative';
}

function renderPageHeader(title, description, actions = '') {
  return `<div class="page-header"><div><h1>${title}</h1><p>${description}</p></div><div class="page-actions">${actions}</div></div>`;
}

function pageShell(inner) {
  return `<div class="page-content">${inner}</div>`;
}

export function createDashboardRenderer({ onNavigate, onRebuild, onClearState, onUpload, onLoadSamples, onUpdateReferenceTable, onExportCurrentView }) {
  const sidebar = document.getElementById('sidebar-nav');
  const content = document.getElementById('page-content');
  const statusNode = document.getElementById('model-readiness-badge');
  const lastRebuildNode = document.getElementById('last-rebuild');
  const titleNode = document.getElementById('app-title');
  const sourceTypeSelector = document.getElementById('source-type-selector');

  titleNode.textContent = APP_TITLE;
  sourceTypeSelector.innerHTML = SOURCE_TYPE_OPTIONS.map((sourceType) => `<option value="${sourceType}">${sourceType}</option>`).join('');

  sidebar.innerHTML = PAGE_DEFINITIONS.map((page) => `<button class="sidebar-link" data-page="${page.id}">${page.label}</button>`).join('');
  sidebar.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page]');
    if (!target) return;
    onNavigate(target.dataset.page);
  });

  document.getElementById('rebuild-model-btn').addEventListener('click', onRebuild);
  document.getElementById('clear-state-btn').addEventListener('click', onClearState);
  document.getElementById('export-view-btn').addEventListener('click', onExportCurrentView);
  document.getElementById('load-samples-btn').addEventListener('click', onLoadSamples);
  document.getElementById('file-upload-input').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;
    await onUpload(files, sourceTypeSelector.value);
    event.target.value = '';
  });

  const renderer = {
    tables: {},
    charts: {},
    currentPageId: 'home',
    currentChart: null,
    currentTable: null,
    currentKpis: null,
    currentReferenceTable: 'status',
    currentEditLog: [],
    setReadiness(modelReadiness, rebuiltAt) {
      statusNode.textContent = modelReadiness.status;
      statusNode.className = `badge ${readinessTone(modelReadiness.status)}`;
      lastRebuildNode.textContent = rebuiltAt ? `Latest rebuild: ${new Date(rebuiltAt).toLocaleString()}` : 'Latest rebuild: not yet run';
    },
    render(state) {
      destroyCharts(this.charts);
      destroyTables(this.tables);
      this.charts = {};
      this.tables = {};
      this.currentChart = null;
      this.currentTable = null;
      this.currentKpis = state.model.executionModel?.kpis || null;
      this.setReadiness(state.validated.modelReadiness, state.runtime.lastRebuildAt);
      [...sidebar.querySelectorAll('.sidebar-link')].forEach((node) => node.classList.toggle('active', node.dataset.page === state.ui.currentPage));

      const pageId = state.ui.currentPage;
      this.currentPageId = pageId;
      const renderers = {
        home: () => this.renderHome(state),
        'data-intake': () => this.renderDataIntake(state),
        'reference-tables': () => this.renderReferenceTables(state),
        'planning-costing': () => this.renderPlanningCosting(state),
        'authorized-construct': () => this.renderAuthorizedConstruct(state),
        'approvals-obligations': () => this.renderApprovalsObligations(state),
        'payout-engine': () => this.renderPayoutEngine(state),
        'executive-dashboard': () => this.renderExecutiveDashboard(state),
        'execution-monitoring': () => this.renderExecutionMonitoring(state),
      };
      renderers[pageId]?.();
    },
    renderHome(state) {
      const { sourceFiles } = state;
      const alerts = state.model.executionModel?.alerts || [];
      const unmatchedApprovals = state.model.approvals.filter((row) => row.match_status === 'Unmatched').length;
      content.innerHTML = pageShell(
        renderPageHeader('Home', 'Executive landing page for model readiness, data health, and top alerting.') +
          `<div class="hero-panel">
            <h2>${APP_TITLE}</h2>
            <p>Financial planning MVP for bonus authorization, obligation modeling, payout scheduling, and execution monitoring.</p>
            <div class="hero-meta"><span class="badge ${readinessTone(state.validated.modelReadiness.status)}">${state.validated.modelReadiness.status}</span><span>${state.runtime.lastRebuildAt ? `Rebuilt ${new Date(state.runtime.lastRebuildAt).toLocaleString()}` : 'Not rebuilt yet'}</span></div>
          </div>` +
          renderCardGrid([
            card('Loaded Source Files', String(sourceFiles.length), 'default', `${sourceFiles.filter((file) => file.origin === 'bundled-sample').length} bundled samples`),
            card('Validation Issue Count', String(state.validated.validationIssues.length), state.validated.validationIssues.length ? 'warning' : 'positive'),
            card('Unmatched Approvals', String(unmatchedApprovals), unmatchedApprovals ? 'warning' : 'positive'),
            card('Future Liability', toCurrency(state.model.executionModel?.kpis?.futureLiability || 0), 'default'),
          ]) +
          `<div class="two-column">${renderAlertList(alerts)}<div class="panel"><h3>Quick Navigation</h3><div class="quick-nav-grid">${PAGE_DEFINITIONS.map((page) => `<button class="quick-nav-btn" data-page="${page.id}">${page.label}</button>`).join('')}</div></div></div>`,
      );
      content.querySelectorAll('.quick-nav-btn').forEach((button) => button.addEventListener('click', () => onNavigate(button.dataset.page)));
    },
    renderDataIntake(state) {
      const actions = '<button id="data-intake-rebuild" class="secondary-btn">Rebuild Model</button><button id="data-intake-clear" class="secondary-btn danger-btn">Clear Saved State</button>';
      content.innerHTML = pageShell(
        renderPageHeader('Data Intake', 'Ingest source files, review validation, and confirm readiness before dependent calculations run.', actions) +
          `<div class="two-column"><div class="panel"><h3>Upload Panel</h3><p>Choose a source type, upload CSV/XLS/XLSX content, or reload the bundled samples.</p><p class="subtle">Duplicate uploads are detected by filename and simple content hash.</p></div><div class="panel"><h3>Model Readiness</h3><div class="readiness-box ${readinessTone(state.validated.modelReadiness.status)}"><strong>${state.validated.modelReadiness.status}</strong><ul>${state.validated.modelReadiness.reasons.map((reason) => `<li>${reason}</li>`).join('') || '<li>No readiness blockers.</li>'}</ul></div></div></div>` +
          `<div class="two-column"><div class="panel"><h3>Loaded Files</h3><div id="loaded-files-table"></div></div><div class="panel"><h3>Validation Summary</h3>${renderCardGrid([
            card('Files Loaded', String(state.sourceFiles.length)),
            card('Total Rows', String(state.sourceFiles.reduce((sum, file) => sum + file.row_count, 0))),
            card('Valid Rows', String(state.sourceFiles.reduce((sum, file) => sum + file.valid_row_count, 0)), 'positive'),
            card('Exceptions', String(state.validated.validationIssues.length), state.validated.validationIssues.length ? 'warning' : 'positive'),
          ])}</div></div>` +
          `<div class="panel"><h3>Validation & Exception Detail</h3><div id="validation-table"></div></div>`,
      );
      document.getElementById('data-intake-rebuild').addEventListener('click', onRebuild);
      document.getElementById('data-intake-clear').addEventListener('click', onClearState);
      this.tables.loadedFiles = createTable('#loaded-files-table', state.sourceFiles, makeColumns([
        { title: 'File Name', field: 'file_name' },
        { title: 'Source Type', field: 'source_type' },
        { title: 'Upload Timestamp', field: 'uploaded_at' },
        { title: 'Row Count', field: 'row_count', sorter: 'number' },
        { title: 'Valid Row Count', field: 'valid_row_count', sorter: 'number' },
        { title: 'Validation Status', field: 'validation_status' },
      ]));
      this.tables.validation = createTable('#validation-table', state.validated.validationIssues, makeColumns([
        { title: 'Level', field: 'level' },
        { title: 'Source Type', field: 'source_type' },
        { title: 'File', field: 'file_name' },
        { title: 'Row', field: 'row', sorter: 'number' },
        { title: 'Issue', field: 'issue' },
      ]));
      this.currentTable = this.tables.validation;
    },
    renderReferenceTables(state) {
      const tableChoices = ['status', 'category', 'budget_line_item', 'oe', 'bonus_type', 'installment_structure', 'Installment Rules'];
      const selected = this.currentReferenceTable;
      const rows = selected === 'Installment Rules'
        ? state.model.referenceManager.getReferenceTableRows('Installment Rules')
        : state.model.referenceManager.getReferenceTableRows(selected);
      content.innerHTML = pageShell(
        renderPageHeader('Reference Tables', 'Reference-driven mappings and editable installment rules used across normalization and payout logic.', `<select id="reference-table-selector">${tableChoices.map((choice) => `<option value="${choice}" ${choice === selected ? 'selected' : ''}>${choice}</option>`).join('')}</select><button id="save-reference-btn" class="secondary-btn">Save Edits</button>`) +
          `<div class="panel"><h3>Editable Grid</h3><div id="reference-edit-grid"></div></div><div class="panel"><h3>Edit Log</h3><div class="edit-log">${this.currentEditLog.length ? this.currentEditLog.map((log) => `<div>${log}</div>`).join('') : '<div>No edits recorded this session.</div>'}</div></div>`,
      );
      const grid = document.getElementById('reference-edit-grid');
      const keys = rows.length ? Object.keys(rows[0]) : [];
      grid.innerHTML = `<div class="editable-grid-wrapper"><table class="editable-grid"><thead><tr>${keys.map((key) => `<th>${key}</th>`).join('')}</tr></thead><tbody>${rows.map((row, rowIndex) => `<tr data-row-index="${rowIndex}">${keys.map((key) => `<td contenteditable="true" data-key="${key}">${row[key] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      document.getElementById('reference-table-selector').addEventListener('change', (event) => {
        this.currentReferenceTable = event.target.value;
        this.render(state);
      });
      document.getElementById('save-reference-btn').addEventListener('click', () => {
        const updatedRows = [...grid.querySelectorAll('tbody tr')].map((row) => {
          const obj = {};
          row.querySelectorAll('td').forEach((cell) => {
            obj[cell.dataset.key] = cell.textContent.trim();
          });
          return obj;
        });
        this.currentEditLog.unshift(`${new Date().toLocaleTimeString()}: saved ${updatedRows.length} row(s) to ${this.currentReferenceTable}.`);
        onUpdateReferenceTable(this.currentReferenceTable, updatedRows);
      });
    },
    renderAuthorizedConstruct(state) {
      const summary = state.model.authorizedSummary;
      const rows = state.model.authorized.filter((row) => row.is_valid);
      content.innerHTML = pageShell(
        renderPageHeader('Authorized Construct', 'Authorized bonus structure, mapped dimensions, and base rule constructs.') +
          renderCardGrid([
            card('Total Authorized Dollars', toCurrency(summary.totalAuthorized), 'default'),
            card('Authorized Line Item Count', String(summary.lineItemCount), 'default'),
            card('Average Authorized Amount', toCurrency(summary.averageAuthorizedAmount), 'default'),
            card('Unmapped Rows Count', String(summary.unmappedRowsCount), summary.unmappedRowsCount ? 'warning' : 'positive'),
          ]) +
          `<div class="chart-panel"><h3>Authorized by Category</h3><div class="chart-canvas-wrapper"><canvas id="authorized-chart"></canvas></div></div><div class="panel"><h3>Authorized Detail</h3><div id="authorized-table"></div></div>`,
      );
      const categoryTotals = Object.values(rows.reduce((acc, row) => {
        acc[row.category] ||= { category: row.category, amount: 0 };
        acc[row.category].amount += Number(row.authorized_amount || 0);
        return acc;
      }, {}));
      this.charts.authorized = createBarChart('#authorized-chart', categoryTotals.map((row) => row.category), [{ label: 'Authorized Dollars', data: categoryTotals.map((row) => row.amount), backgroundColor: '#2255aa' }]);
      this.tables.authorized = createTable('#authorized-table', rows, makeColumns([
        { title: 'FY', field: 'fy', sorter: 'number' },
        { title: 'Category', field: 'category' },
        { title: 'Budget Line Item', field: 'budget_line_item' },
        { title: 'O/E', field: 'oe' },
        { title: 'Bonus Type', field: 'bonus_type' },
        { title: 'Authorized Amount', field: 'authorized_amount', sorter: 'number' },
        { title: 'Installment Structure', field: 'installment_structure' },
        { title: 'Effective Date', field: 'effective_date' },
        { title: 'Expiration Date', field: 'expiration_date' },
        { title: 'Mapping Status', field: 'mapping_status' },
      ]));
      this.currentTable = this.tables.authorized;
      this.currentChart = this.charts.authorized;
    },
    renderPlanningCosting(state) {
      const planning = state.model.planningModel;
      content.innerHTML = pageShell(
        renderPageHeader('Planning & Costing', 'Reference-driven planning engine, category budget caps, and supportable taker allocation.') +
          renderCardGrid([
            card('Projected Taker Target', String(planning.totals.projected_taker_target)),
            card('Supportable Takers', String(planning.totals.supportable_takers), 'positive'),
            card('Projected Obligations', toCurrency(planning.totals.projected_obligations), 'default'),
            card('Unfunded Need', String(planning.totals.unfunded_need), planning.totals.unfunded_need ? 'warning' : 'positive'),
          ]) +
          `<div class="two-column"><div class="chart-panel"><h3>Category Budget vs Projected Obligations</h3><div class="chart-canvas-wrapper"><canvas id="planning-budget-chart"></canvas></div></div><div class="chart-panel"><h3>Target vs Achieved Initial Average</h3><div class="chart-canvas-wrapper"><canvas id="planning-avg-chart"></canvas></div></div></div><div class="panel"><h3>Projected Allocation Detail</h3><div id="planning-table"></div></div>`,
      );
      const rows = planning.categoryRows;
      this.charts.planningBudget = createBarChart('#planning-budget-chart', rows.map((row) => row.category), [
        { label: 'Category Budget', data: rows.map((row) => row.category_budget), backgroundColor: '#9bb8f5' },
        { label: 'Projected Obligations', data: rows.map((row) => row.projected_obligations), backgroundColor: '#2255aa' },
      ]);
      this.charts.planningAvg = createBarChart('#planning-avg-chart', rows.map((row) => row.category), [
        { label: 'Target Avg Initial Bonus', data: rows.map((row) => row.target_avg_initial_bonus || 0), backgroundColor: '#f7b500' },
        { label: 'Achieved Avg Initial Bonus', data: rows.map((row) => row.achieved_avg_initial_bonus || 0), backgroundColor: '#3eb489' },
      ]);
      this.tables.planning = createTable('#planning-table', planning.allocationRows, makeColumns([
        { title: 'FY', field: 'fy', sorter: 'number' },
        { title: 'Category', field: 'category' },
        { title: 'Budget Line Item', field: 'budget_line_item' },
        { title: 'O/E', field: 'oe' },
        { title: 'Bonus Type', field: 'bonus_type' },
        { title: 'Authorized Amount', field: 'authorized_amount', sorter: 'number' },
        { title: 'Initial Payment Amount', field: 'initial_payment_amount', sorter: 'number' },
        { title: 'Pass1 Takers', field: 'pass1_takers', sorter: 'number' },
        { title: 'Final Takers', field: 'final_takers', sorter: 'number' },
        { title: 'Projected Obligation', field: 'projected_obligation', sorter: 'number' },
        { title: 'Target Avg Initial Bonus', field: 'target_avg_initial_bonus', sorter: 'number' },
        { title: 'Achieved Avg Initial Bonus', field: 'achieved_avg_initial_bonus', sorter: 'number' },
        { title: 'Shift Count', field: 'shift_count', sorter: 'number' },
      ]));
      this.currentTable = this.tables.planning;
      this.currentChart = this.charts.planningBudget;
    },
    renderApprovalsObligations(state) {
      const approvals = state.model.approvals;
      const approved = approvals.filter((row) => row.status === 'Approved');
      const cancelled = approvals.filter((row) => row.status === 'Cancelled');
      content.innerHTML = pageShell(
        renderPageHeader('Approvals & Obligations', 'Actual approval records, matching results, obligation creation, and exceptions.') +
          renderCardGrid([
            card('Approved Count', String(approved.length), 'positive'),
            card('Approved Dollars', toCurrency(approved.reduce((sum, row) => sum + Number(row.approved_amount || 0), 0))),
            card('Cancelled Count', String(cancelled.length), cancelled.length ? 'warning' : 'positive'),
            card('Cancelled Dollars', toCurrency(cancelled.reduce((sum, row) => sum + Math.max(Number(row.approved_amount || 0), 0), 0))),
          ]) +
          `<div class="two-column"><div class="chart-panel"><h3>Obligation by FY</h3><div class="chart-canvas-wrapper"><canvas id="obligation-fy-chart"></canvas></div></div><div class="chart-panel"><h3>Status Distribution</h3><div class="chart-canvas-wrapper"><canvas id="status-chart"></canvas></div></div></div><div class="panel"><h3>Approvals / Obligation Detail</h3><div id="approval-table"></div></div><div class="panel"><h3>Exception Detail</h3><div id="approval-exception-table"></div></div>`,
      );
      const fyBuckets = Object.values(state.model.obligationModel.actualObligations.reduce((acc, row) => {
        acc[row.obligation_fy] ||= { fy: row.obligation_fy, amount: 0 };
        acc[row.obligation_fy].amount += row.obligation_amount;
        return acc;
      }, {}));
      this.charts.obligationFy = createBarChart('#obligation-fy-chart', fyBuckets.map((row) => String(row.fy)), [{ label: 'Actual Obligations', data: fyBuckets.map((row) => row.amount), backgroundColor: '#2255aa' }]);
      this.charts.status = new window.Chart(document.getElementById('status-chart'), {
        type: 'pie',
        data: {
          labels: state.model.executionModel.statusCounts.map((row) => row.status),
          datasets: [{ data: state.model.executionModel.statusCounts.map((row) => row.count), backgroundColor: ['#3eb489', '#d85d5d', '#f7b500', '#7b8aa0'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
      this.tables.approvals = createTable('#approval-table', approvals, makeColumns([
        { title: 'Member Record Key', field: 'member_record_key' },
        { title: 'Status', field: 'status' },
        { title: 'Approval Date', field: 'approval_date' },
        { title: 'Approved Amount', field: 'approved_amount', sorter: 'number' },
        { title: 'Category', field: 'category' },
        { title: 'Budget Line Item', field: 'budget_line_item' },
        { title: 'O/E', field: 'oe' },
        { title: 'Bonus Type', field: 'bonus_type' },
        { title: 'Obligation Date', field: 'obligation_date' },
        { title: 'Obligation FY', field: 'obligation_fy', sorter: 'number' },
        { title: 'Match Status', field: 'match_status' },
        { title: 'Match Confidence', field: 'match_confidence' },
        { title: 'Exception Flag', field: 'exception_flag' },
      ]));
      this.tables.approvalExceptions = createTable('#approval-exception-table', approvals.filter((row) => row.exception_flag || row.match_status !== 'Matched' || !row.is_valid), makeColumns([
        { title: 'Member', field: 'member_record_key' },
        { title: 'Status', field: 'status' },
        { title: 'Match Status', field: 'match_status' },
        { title: 'Validation Errors', field: 'validation_errors' },
      ]));
      this.currentTable = this.tables.approvals;
      this.currentChart = this.charts.obligationFy;
    },
    renderPayoutEngine(state) {
      const payoutModel = state.model.payoutModel;
      content.innerHTML = pageShell(
        renderPageHeader('Payout Engine', 'Installment scheduling, fiscal-year payout rollups, and forward liability monitoring.') +
          renderCardGrid([
            card('Projected Payouts Selected FY', toCurrency(payoutModel.selectedFyTotals.projectedPayouts)),
            card('Actual Payouts Selected FY', toCurrency(payoutModel.selectedFyTotals.actualPayouts), 'default', 'Derived schedule in MVP'),
            card('Future Liability', toCurrency(payoutModel.selectedFyTotals.futureLiability), payoutModel.selectedFyTotals.futureLiability ? 'warning' : 'positive'),
            card('Reconciliation Exceptions', String(payoutModel.reconciliationExceptions.length), payoutModel.reconciliationExceptions.length ? 'warning' : 'positive'),
          ]) +
          `<div class="chart-panel"><h3>Payout by FY</h3><div class="chart-canvas-wrapper"><canvas id="payout-fy-chart"></canvas></div></div><div class="panel"><h3>Installment Detail</h3><div id="installment-table"></div></div><div class="panel"><h3>Liability by Record</h3><div id="liability-table"></div></div>`,
      );
      const payoutBuckets = Object.values([...payoutModel.actualPayouts, ...payoutModel.projectedPayouts].reduce((acc, row) => {
        acc[row.payout_fy] ||= { fy: row.payout_fy, actual: 0, projected: 0 };
        acc[row.payout_fy][row.source_mode.toLowerCase()] += row.payout_amount;
        return acc;
      }, {})).sort((a, b) => a.fy - b.fy);
      this.charts.payoutFy = createBarChart('#payout-fy-chart', payoutBuckets.map((row) => String(row.fy)), [
        { label: 'Projected Payouts', data: payoutBuckets.map((row) => row.projected), backgroundColor: '#9bb8f5' },
        { label: 'Actual Payouts', data: payoutBuckets.map((row) => row.actual), backgroundColor: '#2255aa' },
      ]);
      this.tables.installments = createTable('#installment-table', [...payoutModel.actualPayouts, ...payoutModel.projectedPayouts], makeColumns([
        { title: 'Source Mode', field: 'source_mode' },
        { title: 'Source Record ID', field: 'source_record_id' },
        { title: 'Category', field: 'category' },
        { title: 'Budget Line Item', field: 'budget_line_item' },
        { title: 'Installment Number', field: 'installment_number', sorter: 'number' },
        { title: 'Total Installments', field: 'total_installments', sorter: 'number' },
        { title: 'Installment Type', field: 'installment_type' },
        { title: 'Payout Date', field: 'payout_date' },
        { title: 'Payout FY', field: 'payout_fy', sorter: 'number' },
        { title: 'Payout Amount', field: 'payout_amount', sorter: 'number' },
        { title: 'Remaining Balance After Installment', field: 'remaining_balance_after_installment', sorter: 'number' },
      ]));
      this.tables.liability = createTable('#liability-table', payoutModel.liabilityByRecord, makeColumns([
        { title: 'Source Mode', field: 'source_mode' },
        { title: 'Source Record ID', field: 'source_record_id' },
        { title: 'Category', field: 'category' },
        { title: 'Budget Line Item', field: 'budget_line_item' },
        { title: 'Obligation Amount', field: 'obligation_amount', sorter: 'number' },
        { title: 'Payout Count', field: 'payout_count', sorter: 'number' },
        { title: 'Current FY Payouts', field: 'current_fy_payouts', sorter: 'number' },
        { title: 'Future Liability', field: 'future_liability', sorter: 'number' },
      ]));
      this.currentTable = this.tables.installments;
      this.currentChart = this.charts.payoutFy;
    },
    renderExecutiveDashboard(state) {
      const kpis = state.model.executionModel.kpis;
      content.innerHTML = pageShell(
        renderPageHeader('Executive Dashboard', 'Simplified leadership view of authorization, plan, actual execution, and future liability.') +
          renderCardGrid([
            card('Total Authorized Dollars', toCurrency(kpis.totalAuthorizedDollars)),
            card('Total Projected Obligations', toCurrency(kpis.totalProjectedObligations)),
            card('Total Actual Obligations', toCurrency(kpis.totalActualObligations)),
            card('Total Projected Payouts', toCurrency(kpis.totalProjectedPayouts)),
            card('Total Actual Payouts', toCurrency(kpis.totalActualPayouts)),
            card('Remaining Headroom', toCurrency(kpis.remainingHeadroom), kpis.remainingHeadroom < 0 ? 'negative' : 'positive'),
            card('Approved Takers', String(kpis.approvedTakers), 'positive'),
            card('Future Liability', toCurrency(kpis.futureLiability), kpis.futureLiability ? 'warning' : 'positive'),
          ]) +
          `<div class="two-column"><div class="chart-panel"><h3>Obligations by FY</h3><div class="chart-canvas-wrapper"><canvas id="exec-obligation-fy-chart"></canvas></div></div><div class="chart-panel"><h3>Payouts by FY</h3><div class="chart-canvas-wrapper"><canvas id="exec-payout-fy-chart"></canvas></div></div></div><div class="two-column"><div class="chart-panel"><h3>Category Execution</h3><div class="chart-canvas-wrapper"><canvas id="category-execution-chart"></canvas></div></div><div class="panel"><h3>Plan vs Actual Variance</h3><div id="variance-table"></div></div></div>`,
      );
      const obligationBuckets = Object.values([...state.model.obligationModel.actualObligations, ...state.model.obligationModel.projectedObligations].reduce((acc, row) => {
        acc[row.obligation_fy] ||= { fy: row.obligation_fy, actual: 0, projected: 0 };
        acc[row.obligation_fy][row.source_mode.toLowerCase()] += row.obligation_amount;
        return acc;
      }, {})).sort((a, b) => a.fy - b.fy);
      this.charts.execObligations = createBarChart('#exec-obligation-fy-chart', obligationBuckets.map((row) => String(row.fy)), [
        { label: 'Projected', data: obligationBuckets.map((row) => row.projected), backgroundColor: '#9bb8f5' },
        { label: 'Actual', data: obligationBuckets.map((row) => row.actual), backgroundColor: '#2255aa' },
      ]);
      const payoutBuckets = Object.values([...state.model.payoutModel.actualPayouts, ...state.model.payoutModel.projectedPayouts].reduce((acc, row) => {
        acc[row.payout_fy] ||= { fy: row.payout_fy, actual: 0, projected: 0 };
        acc[row.payout_fy][row.source_mode.toLowerCase()] += row.payout_amount;
        return acc;
      }, {})).sort((a, b) => a.fy - b.fy);
      this.charts.execPayouts = createBarChart('#exec-payout-fy-chart', payoutBuckets.map((row) => String(row.fy)), [
        { label: 'Projected', data: payoutBuckets.map((row) => row.projected), backgroundColor: '#9bb8f5' },
        { label: 'Actual', data: payoutBuckets.map((row) => row.actual), backgroundColor: '#2255aa' },
      ]);
      this.charts.categoryExecution = createBarChart('#category-execution-chart', state.model.executionModel.varianceTable.map((row) => row.category), [
        { label: 'Projected Obligations', data: state.model.executionModel.varianceTable.map((row) => row.projected_obligations), backgroundColor: '#9bb8f5' },
        { label: 'Actual Obligations', data: state.model.executionModel.varianceTable.map((row) => row.actual_obligations), backgroundColor: '#2255aa' },
      ]);
      this.tables.variance = createTable('#variance-table', state.model.executionModel.varianceTable, makeColumns([
        { title: 'Category', field: 'category' },
        { title: 'Projected Takers', field: 'projected_takers', sorter: 'number' },
        { title: 'Actual Approved Takers', field: 'actual_approved_takers', sorter: 'number' },
        { title: 'Taker Variance', field: 'taker_variance', sorter: 'number' },
        { title: 'Projected Obligations', field: 'projected_obligations', sorter: 'number' },
        { title: 'Actual Obligations', field: 'actual_obligations', sorter: 'number' },
        { title: 'Obligation Variance', field: 'obligation_variance', sorter: 'number' },
      ]));
      this.currentTable = this.tables.variance;
      this.currentChart = this.charts.execObligations;
    },
    renderExecutionMonitoring(state) {
      const variances = state.model.executionModel.variances;
      content.innerHTML = pageShell(
        renderPageHeader('Execution Monitoring', 'Analyst view of model variance, warning rates, and drilldown-friendly exception tracking.') +
          renderCardGrid([
            card('Taker Variance', String(variances.takerVariance), variances.takerVariance ? 'warning' : 'positive'),
            card('Obligation Variance', toCurrency(variances.obligationVariance), variances.obligationVariance ? 'warning' : 'positive'),
            card('Payout Variance', toCurrency(variances.payoutVariance), variances.payoutVariance ? 'warning' : 'positive'),
            card('Cancellation Rate', toPercent(variances.cancellationRate), variances.cancellationRate > 0.1 ? 'warning' : 'positive'),
            card('Unmapped Rate', toPercent(variances.unmappedRecordRate), variances.unmappedRecordRate > 0.05 ? 'warning' : 'positive'),
          ]) +
          `<div class="two-column"><div class="chart-panel"><h3>Category Variance</h3><div class="chart-canvas-wrapper"><canvas id="category-variance-chart"></canvas></div></div><div class="chart-panel"><h3>Execution Trend</h3><div class="chart-canvas-wrapper"><canvas id="execution-trend-chart"></canvas></div></div></div><div class="panel"><h3>Variance Detail</h3><div id="execution-variance-table"></div></div><div class="panel"><h3>Exception List</h3><div id="execution-exception-table"></div></div>`,
      );
      this.charts.categoryVariance = createBarChart('#category-variance-chart', state.model.executionModel.varianceTable.map((row) => row.category), [
        { label: 'Obligation Variance', data: state.model.executionModel.varianceTable.map((row) => row.obligation_variance), backgroundColor: '#d85d5d' },
        { label: 'Payout Variance', data: state.model.executionModel.varianceTable.map((row) => row.payout_variance), backgroundColor: '#f7b500' },
      ]);
      const trendRows = Object.values(state.model.obligationModel.actualObligations.reduce((acc, row) => {
        acc[row.obligation_fy] ||= { fy: row.obligation_fy, obligations: 0, payouts: 0 };
        acc[row.obligation_fy].obligations += row.obligation_amount;
        return acc;
      }, {}));
      state.model.payoutModel.actualPayouts.forEach((row) => {
        trendRows.find((item) => item.fy === row.payout_fy) || trendRows.push({ fy: row.payout_fy, obligations: 0, payouts: 0 });
        const target = trendRows.find((item) => item.fy === row.payout_fy);
        target.payouts += row.payout_amount;
      });
      trendRows.sort((a, b) => a.fy - b.fy);
      this.charts.executionTrend = createBarChart('#execution-trend-chart', trendRows.map((row) => String(row.fy)), [
        { label: 'Actual Obligations', data: trendRows.map((row) => row.obligations), backgroundColor: '#2255aa' },
        { label: 'Actual Payouts', data: trendRows.map((row) => row.payouts), backgroundColor: '#3eb489' },
      ]);
      this.tables.executionVariance = createTable('#execution-variance-table', state.model.executionModel.varianceTable, makeColumns([
        { title: 'Category', field: 'category' },
        { title: 'Projected Takers', field: 'projected_takers', sorter: 'number' },
        { title: 'Actual Approved Takers', field: 'actual_approved_takers', sorter: 'number' },
        { title: 'Taker Variance', field: 'taker_variance', sorter: 'number' },
        { title: 'Projected Obligations', field: 'projected_obligations', sorter: 'number' },
        { title: 'Actual Obligations', field: 'actual_obligations', sorter: 'number' },
        { title: 'Projected Payouts', field: 'projected_payouts', sorter: 'number' },
        { title: 'Actual Payouts', field: 'actual_payouts', sorter: 'number' },
        { title: 'Payout Variance', field: 'payout_variance', sorter: 'number' },
      ]));
      this.tables.executionExceptions = createTable('#execution-exception-table', state.model.approvals.filter((row) => row.exception_flag || row.match_status !== 'Matched' || !row.is_valid), makeColumns([
        { title: 'Member Record Key', field: 'member_record_key' },
        { title: 'Status', field: 'status' },
        { title: 'Category', field: 'category' },
        { title: 'Match Status', field: 'match_status' },
        { title: 'Match Confidence', field: 'match_confidence' },
        { title: 'Validation Errors', field: 'validation_errors' },
      ]));
      this.currentTable = this.tables.executionVariance;
      this.currentChart = this.charts.categoryVariance;
    },
    buildFilterOptions(state) {
      const categories = optionize(state.model.authorized.map((row) => row.category).concat(state.model.approvals.map((row) => row.category)).filter(Boolean));
      const oes = optionize(state.model.authorized.map((row) => row.oe).concat(state.model.approvals.map((row) => row.oe)).filter(Boolean));
      const bonusTypes = optionize(state.model.authorized.map((row) => row.bonus_type).concat(state.model.approvals.map((row) => row.bonus_type)).filter(Boolean));
      const statuses = optionize(state.model.approvals.map((row) => row.status).filter(Boolean));
      const fys = optionize(state.model.authorized.map((row) => row.fy).concat(state.model.approvals.map((row) => row.obligation_fy)).concat(state.model.budgets.map((row) => row.fy)).filter(Boolean));
      return { categories, oes, bonusTypes, statuses, fys };
    },
    syncTopBarFilters(state) {
      const options = this.buildFilterOptions(state);
      const bindOptions = (elementId, values, currentValue) => {
        const select = document.getElementById(elementId);
        const allLabel = elementId === 'fy-filter' ? 'All FYs' : 'All';
        select.innerHTML = [`<option value="">${allLabel}</option>`, ...values.map((value) => `<option value="${value}" ${String(currentValue) === String(value) ? 'selected' : ''}>${value}</option>`)].join('');
      };
      bindOptions('fy-filter', options.fys, state.ui.filters.fy);
      bindOptions('category-filter', options.categories, state.ui.filters.category);
      bindOptions('oe-filter', options.oes, state.ui.filters.oe);
      bindOptions('bonus-type-filter', options.bonusTypes, state.ui.filters.bonusType);
      bindOptions('status-filter', options.statuses, state.ui.filters.status);
    },
  };

  return renderer;
}
