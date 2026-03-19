import { SOURCE_TYPES, MODEL_READINESS, APP_TITLE, PAGE_DEFINITIONS } from './modules/constants.js';
import { matchApprovalsToAuthorized, summarizeAuthorized } from './modules/authorization-engine.js';
import { buildPlanningModel } from './modules/planning-engine.js';
import { buildObligationModel } from './modules/obligation-engine.js';
import { buildPayoutModel } from './modules/payout-engine.js';
import { buildExecutionModel } from './modules/execution-engine.js';
import { buildReferenceManager, seedDefaultAssumptions } from './modules/reference-manager.js';
import { createDashboardRenderer } from './modules/dashboard-renderer.js';
import { createSourceFileRecord, detectDuplicateUpload, loadBundledSampleSourceFiles, readBrowserFile } from './modules/data-loader.js';
import { applyMappings } from './modules/mapping-engine.js';
import { clearAppState, clearUiPrefs, loadAppState, loadUiPrefs, saveAppState, saveUiPrefs } from './modules/storage-manager.js';
import { createEmptyValidatedState, buildValidationSummary, determineModelReadiness, validateAndNormalizeSourceFile } from './modules/validation-engine.js';
import { exportCurrentChart, exportHtmlSnapshot, exportKpiSummary, exportVisibleTable } from './modules/export-manager.js';
import { nowIso } from './modules/utils.js';

const initialUiPrefs = loadUiPrefs();

const state = {
  sourceFiles: [],
  validated: createEmptyValidatedState(),
  model: {
    referenceManager: buildReferenceManager([], []),
    authorized: [],
    approvals: [],
    budgets: [],
    references: [],
    assumptions: [],
    authorizedSummary: { totalAuthorized: 0, averageAuthorizedAmount: 0, lineItemCount: 0, unmappedRowsCount: 0 },
    planningModel: { categoryRows: [], allocationRows: [], totals: { projected_taker_target: 0, supportable_takers: 0, projected_obligations: 0, unfunded_need: 0 } },
    obligationModel: { actualObligations: [], projectedObligations: [], totals: { totalActualObligations: 0, totalProjectedObligations: 0 } },
    payoutModel: { actualPayouts: [], projectedPayouts: [], selectedFyTotals: { actualPayouts: 0, projectedPayouts: 0, futureLiability: 0 }, reconciliationExceptions: [], liabilityByRecord: [] },
    executionModel: { kpis: {}, variances: {}, alerts: [], varianceTable: [], statusCounts: [] },
  },
  runtime: {
    lastRebuildAt: null,
    referenceTableOverrides: initialUiPrefs.referenceTableOverrides || {},
    customInstallmentRules: initialUiPrefs.customInstallmentRules || [],
  },
  ui: {
    currentPage: initialUiPrefs.currentPage || 'home',
    filters: {
      fy: initialUiPrefs.filters?.fy || '',
      category: initialUiPrefs.filters?.category || '',
      oe: initialUiPrefs.filters?.oe || '',
      bonusType: initialUiPrefs.filters?.bonusType || '',
      status: initialUiPrefs.filters?.status || '',
    },
  },
};

function persistUiPrefs() {
  saveUiPrefs({
    currentPage: state.ui.currentPage,
    filters: state.ui.filters,
    referenceTableOverrides: state.runtime.referenceTableOverrides,
    customInstallmentRules: state.runtime.customInstallmentRules,
  });
}

function aggregateValidatedFiles() {
  const validatedState = createEmptyValidatedState();
  state.sourceFiles.forEach((sourceFile) => {
    const result = validateAndNormalizeSourceFile(sourceFile);
    validatedState.datasets[sourceFile.source_type].files.push(result.file);
    validatedState.datasets[sourceFile.source_type].records.push(...result.records);
  });
  validatedState.validationIssues = buildValidationSummary(validatedState);
  return validatedState;
}

function convertReferenceOverridesToRecords(referenceTableOverrides = {}) {
  const output = [];
  Object.entries(referenceTableOverrides).forEach(([tableName, rows]) => {
    if (tableName === 'Installment Rules') return;
    rows.forEach((row, index) => {
      output.push({
        reference_record_id: `override-${tableName}-${index + 1}`,
        source_file_id: 'override',
        raw_row_number: index + 1,
        reference_type: row.reference_type || tableName,
        raw_value: row.raw_value,
        standard_value: row.standard_value,
        is_active: ['true', 'y', 'yes', '1'].includes(String(row.is_active).toLowerCase()) || row.is_active === true,
        effective_date: row.effective_date || null,
        expiration_date: row.expiration_date || null,
        notes: row.notes || 'User edited reference override',
        validation_errors: [],
        is_valid: true,
      });
    });
  });
  return output;
}

function normalizeInstallmentRuleRows(rows = []) {
  return rows.map((row) => ({
    installment_structure: row.installment_structure,
    installment_count: Number(row.installment_count),
    initial_payment_type: row.initial_payment_type,
    initial_payment_value: Number(row.initial_payment_value),
    anniversary_interval_months: Number(row.anniversary_interval_months),
    anniversary_amount_method: row.anniversary_amount_method,
    rounding_method: row.rounding_method,
    warning: ['true', 'y', 'yes', '1'].includes(String(row.warning).toLowerCase()) || row.warning === true,
  })).filter((row) => row.installment_structure);
}

function applyGlobalFilters(records, type) {
  return records.filter((record) => {
    const { fy, category, oe, bonusType, status } = state.ui.filters;
    if (fy) {
      const numericFy = Number(fy);
      if (type === 'approval' && record.obligation_fy !== numericFy && record.approval_fy !== numericFy) return false;
      if (type !== 'approval' && record.fy !== numericFy && record.obligation_fy !== numericFy && record.payout_fy !== numericFy) return false;
    }
    if (category && record.category !== category) return false;
    if (oe && record.oe !== oe) return false;
    if (bonusType && record.bonus_type !== bonusType) return false;
    if (status && type === 'approval' && record.status !== status) return false;
    return true;
  });
}

async function rebuildModel() {
  const validated = aggregateValidatedFiles();
  const baseReferenceRecords = validated.datasets[SOURCE_TYPES.REFERENCE].records;
  const referenceOverrideRecords = convertReferenceOverridesToRecords(state.runtime.referenceTableOverrides);
  const customInstallmentRules = [
    ...state.runtime.customInstallmentRules,
    ...(state.runtime.referenceTableOverrides['Installment Rules'] ? normalizeInstallmentRuleRows(state.runtime.referenceTableOverrides['Installment Rules']) : []),
  ];
  const referenceManager = buildReferenceManager([...baseReferenceRecords, ...referenceOverrideRecords], customInstallmentRules);
  const mappedState = applyMappings(validated, referenceManager);

  let assumptions = mappedState.datasets[SOURCE_TYPES.ASSUMPTIONS].records;
  if (!assumptions.some((record) => record.is_valid)) {
    assumptions = seedDefaultAssumptions(mappedState.datasets[SOURCE_TYPES.AUTHORIZED].records.filter((record) => record.is_valid));
  }

  const authorizedAll = mappedState.datasets[SOURCE_TYPES.AUTHORIZED].records;
  const budgetsAll = mappedState.datasets[SOURCE_TYPES.BUDGET].records;
  const approvalsMapped = matchApprovalsToAuthorized(mappedState.datasets[SOURCE_TYPES.APPROVAL].records, authorizedAll);
  const referencesAll = [...baseReferenceRecords, ...referenceOverrideRecords];
  const validationIssues = buildValidationSummary(mappedState);
  const modelReadiness = determineModelReadiness({ datasets: mappedState.datasets, validationIssues, mappingIssues: mappedState.mappingIssues || [] });
  const selectedFy = state.ui.filters.fy ? Number(state.ui.filters.fy) : (authorizedAll.find((row) => row.is_valid)?.fy || budgetsAll.find((row) => row.is_valid)?.fy || new Date().getUTCFullYear() + 1);

  let authorized = applyGlobalFilters(authorizedAll, 'authorized');
  let budgets = applyGlobalFilters(budgetsAll, 'budget');
  let approvals = applyGlobalFilters(approvalsMapped, 'approval');
  let filteredAssumptions = assumptions.filter((record) => !selectedFy || record.fy === selectedFy).filter((record) => !state.ui.filters.category || record.category === state.ui.filters.category);

  let planningModel = { categoryRows: [], allocationRows: [], totals: { projected_taker_target: 0, supportable_takers: 0, projected_obligations: 0, unfunded_need: 0 } };
  let obligationModel = { actualObligations: [], projectedObligations: [], totals: { totalActualObligations: 0, totalProjectedObligations: 0 } };
  let payoutModel = { actualPayouts: [], projectedPayouts: [], selectedFyTotals: { actualPayouts: 0, projectedPayouts: 0, futureLiability: 0 }, reconciliationExceptions: [], liabilityByRecord: [] };
  let executionModel = { kpis: {}, variances: {}, alerts: [], varianceTable: [], statusCounts: [] };

  if (modelReadiness.status !== MODEL_READINESS.NOT_READY) {
    planningModel = buildPlanningModel({
      authorizedRecords: authorized,
      budgetRecords: budgets,
      assumptionRecords: filteredAssumptions,
      referenceManager,
      selectedFy,
    });
    obligationModel = buildObligationModel({ approvals, planningAllocations: planningModel.allocationRows, authorizedRecords: authorized, selectedFy });
    payoutModel = buildPayoutModel({ actualObligations: obligationModel.actualObligations, projectedObligations: obligationModel.projectedObligations, authorizedRecords: authorized, referenceManager, selectedFy });
    executionModel = buildExecutionModel({ authorizedSummary: summarizeAuthorized(authorized), approvals, planningModel, obligationModel, payoutModel, budgetRecords: budgets, selectedFy });
  }

  state.validated = {
    ...mappedState,
    validationIssues,
    modelReadiness,
  };
  state.model = {
    referenceManager,
    authorized,
    approvals,
    budgets,
    references: referencesAll,
    assumptions: filteredAssumptions,
    authorizedSummary: summarizeAuthorized(authorized),
    planningModel,
    obligationModel,
    payoutModel,
    executionModel,
  };
  state.runtime.lastRebuildAt = nowIso();

  const fileSummaryMap = new Map(validated.validationIssues.map((issue) => [issue.file_name, issue]));
  state.sourceFiles = state.sourceFiles.map((sourceFile) => {
    const validatedFile = mappedState.datasets[sourceFile.source_type].files.find((file) => file.source_file_id === sourceFile.source_file_id);
    return validatedFile ? { ...sourceFile, ...validatedFile } : sourceFile;
  });

  renderer.syncTopBarFilters(state);
  renderer.render(state);
  await saveAppState({ sourceFiles: state.sourceFiles, runtime: state.runtime, ui: state.ui });
  persistUiPrefs();
}

async function addFiles(files, sourceType) {
  for (const file of files) {
    const content = await readBrowserFile(file);
    const record = await createSourceFileRecord({ fileName: file.name, sourceType, content, origin: 'uploaded' });
    const duplicate = detectDuplicateUpload(state.sourceFiles, record);
    if (duplicate) {
      const overwrite = window.confirm(`A similar upload already exists (${duplicate.file_name}). Replace it?`);
      if (!overwrite) continue;
      state.sourceFiles = state.sourceFiles.filter((item) => item.source_file_id !== duplicate.source_file_id);
    }
    state.sourceFiles.push(record);
  }
  await rebuildModel();
}

async function loadSamples() {
  state.sourceFiles = await loadBundledSampleSourceFiles();
  await rebuildModel();
}

async function clearState() {
  await clearAppState();
  clearUiPrefs();
  state.sourceFiles = [];
  state.runtime = { lastRebuildAt: null, referenceTableOverrides: {}, customInstallmentRules: [] };
  state.ui = { currentPage: 'home', filters: { fy: '', category: '', oe: '', bonusType: '', status: '' } };
  await loadSamples();
}

function updateReferenceTable(tableName, rows) {
  state.runtime.referenceTableOverrides[tableName] = rows;
  if (tableName === 'Installment Rules') {
    state.runtime.customInstallmentRules = normalizeInstallmentRuleRows(rows);
  }
  rebuildModel();
}

function wireTopBarFilterEvents() {
  const mappings = {
    'fy-filter': 'fy',
    'category-filter': 'category',
    'oe-filter': 'oe',
    'bonus-type-filter': 'bonusType',
    'status-filter': 'status',
  };
  Object.entries(mappings).forEach(([elementId, stateKey]) => {
    document.getElementById(elementId).addEventListener('change', async (event) => {
      state.ui.filters[stateKey] = event.target.value;
      persistUiPrefs();
      await rebuildModel();
    });
  });
}

function exportCurrentView() {
  const exportedTable = exportVisibleTable(renderer.currentTable, renderer.currentPageId);
  const exportedChart = exportCurrentChart(renderer.currentChart, renderer.currentPageId);
  const exportedKpis = exportKpiSummary(renderer.currentKpis, renderer.currentPageId);
  const currentPageLabel = PAGE_DEFINITIONS.find((page) => page.id === renderer.currentPageId)?.label || renderer.currentPageId;
  const chartDataUrl = renderer.currentChart?.toBase64Image?.('image/png', 1) || null;
  const tableRows = renderer.currentTable?.getData?.('active') || renderer.currentTable?.getData?.() || [];
  exportHtmlSnapshot({
    appTitle: APP_TITLE,
    pageTitle: currentPageLabel,
    pageId: renderer.currentPageId,
    readiness: state.validated.modelReadiness.status,
    lastRebuildAt: state.runtime.lastRebuildAt,
    filters: state.ui.filters,
    kpis: renderer.currentKpis,
    tableRows,
    chartDataUrl,
  });
  if (!exportedTable && !exportedChart && !exportedKpis) {
    window.alert('No active table, chart, or KPI summary is available on this page yet. An HTML snapshot export was still generated when possible.');
  }
}

const renderer = createDashboardRenderer({
  onNavigate: async (pageId) => {
    state.ui.currentPage = pageId;
    persistUiPrefs();
    renderer.render(state);
  },
  onRebuild: rebuildModel,
  onClearState: clearState,
  onUpload: addFiles,
  onLoadSamples: loadSamples,
  onUpdateReferenceTable: updateReferenceTable,
  onExportCurrentView: exportCurrentView,
});

wireTopBarFilterEvents();

async function bootstrap() {
  const restored = await loadAppState().catch(() => null);
  if (restored?.sourceFiles?.length) {
    state.sourceFiles = restored.sourceFiles;
    state.runtime = { ...state.runtime, ...(restored.runtime || {}) };
    state.ui = { ...state.ui, ...(restored.ui || {}) };
    renderer.syncTopBarFilters(state);
    await rebuildModel();
    return;
  }
  await loadSamples();
}

bootstrap();
