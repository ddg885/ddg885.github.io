/* Bonus Ecosystem Platform - self-contained browser bundle */

/* modules/constants.js */
const APP_TITLE = 'Bonus Ecosystem Platform';
const APP_VERSION = 'MVP';

const PAGE_DEFINITIONS = [
  { id: 'home', label: 'Home' },
  { id: 'data-intake', label: 'Data Intake' },
  { id: 'reference-tables', label: 'Reference Tables' },
  { id: 'planning-costing', label: 'Planning & Costing' },
  { id: 'authorized-construct', label: 'Authorized Construct' },
  { id: 'approvals-obligations', label: 'Approvals & Obligations' },
  { id: 'payout-engine', label: 'Payout Engine' },
  { id: 'executive-dashboard', label: 'Executive Dashboard' },
  { id: 'execution-monitoring', label: 'Execution Monitoring' },
];

const SOURCE_TYPES = {
  AUTHORIZED: 'Authorized Bonus Source',
  APPROVAL: 'Approval / Execution Source',
  BUDGET: 'Budget Source',
  REFERENCE: 'Reference / Crosswalk Source',
  ASSUMPTIONS: 'Assumptions Source',
  PERSONNEL: 'Personnel / Population Source',
};

const SOURCE_TYPE_OPTIONS = Object.values(SOURCE_TYPES);

const MODEL_READINESS = {
  READY: 'Ready',
  WARNING: 'Warning',
  NOT_READY: 'Not Ready',
};

const MATCH_STATUS = {
  MATCHED: 'Matched',
  PARTIAL: 'Partial',
  UNMATCHED: 'Unmatched',
};

const MATCH_CONFIDENCE = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NONE: 'None',
};

const STANDARD_STATUSES = ['Approved', 'Cancelled', 'Pending', 'Unknown'];
const STATUS_METRIC_ELIGIBLE = ['Approved', 'Cancelled'];

const WARNING_THRESHOLDS = {
  varianceWarningThresholdPercent: 0.1,
  cancellationRateWarningThreshold: 0.1,
  unmappedRecordWarningThreshold: 0.05,
  futureLiabilityConcentrationThreshold: 0.5,
  budgetOverrunThreshold: 0,
  payoutReconciliationTolerance: 0.01,
};

const STORAGE_KEYS = {
  DB_NAME: 'bonus-ecosystem-platform-db',
  DB_STORE: 'appState',
  DB_KEY: 'currentState',
  UI_PREFS: 'bonus-ecosystem-platform-ui-prefs',
};

const INSTALLMENT_RULE_FIELDS = [
  'installment_structure',
  'installment_count',
  'initial_payment_type',
  'initial_payment_value',
  'anniversary_interval_months',
  'anniversary_amount_method',
  'rounding_method',
];

const DEFAULT_INSTALLMENT_RULES = [
  {
    installment_structure: 'Lump Sum',
    installment_count: 1,
    initial_payment_type: 'full_amount',
    initial_payment_value: 1,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'none',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Initial + Anniversary',
    installment_count: 2,
    initial_payment_type: 'percent_of_total',
    initial_payment_value: 0.5,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'equal_remaining',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Initial + Multiple Anniversary',
    installment_count: 4,
    initial_payment_type: 'percent_of_total',
    initial_payment_value: 0.5,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'equal_remaining',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Unknown',
    installment_count: 1,
    initial_payment_type: 'full_amount',
    initial_payment_value: 1,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'none',
    rounding_method: 'final_installment_true_up',
    warning: true,
  },
];

const SOURCE_SCHEMAS = {
  [SOURCE_TYPES.AUTHORIZED]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      category: { required: true, aliases: ['Category', 'Bonus Category'], type: 'string' },
      budget_line_item: { required: true, aliases: ['Budget Line Item', 'BudgetLineItem', 'Line Item'], type: 'string' },
      oe: { required: true, aliases: ['O/E', 'OE', 'OfficerEnlisted'], type: 'string' },
      bonus_type: { required: true, aliases: ['Bonus Type', 'BonusType', 'Incentive Type'], type: 'string' },
      amount: { required: true, aliases: ['Amount', 'Authorized Amount', 'Bonus Amount'], type: 'number' },
      installment_structure: { required: true, aliases: ['Installment Structure', 'InstallmentStructure', 'Payout Structure'], type: 'string' },
      effective_date: { required: true, aliases: ['Effective Date', 'EffectiveDate'], type: 'date' },
      expiration_date: { required: false, aliases: ['Expiration Date', 'ExpirationDate'], type: 'date' },
      line_identifier: { required: false, aliases: ['Line Identifier', 'LineID', 'Authorized Line ID'], type: 'string' },
      bonus_identifier: { required: false, aliases: ['Bonus Identifier', 'BonusID'], type: 'string' },
    },
  },
  [SOURCE_TYPES.APPROVAL]: {
    logicalFields: {
      member_record_key: { required: true, aliases: ['Member ID', 'MemberID', 'Record Key', 'RecordKey', 'SSN', 'EDIPI', 'Unique Record ID'], type: 'string' },
      status: { required: true, aliases: ['Status', 'SRB Status', 'Approval Status'], type: 'string' },
      approval_date: { required: true, aliases: ['Approval Date', 'ApprovalDate', 'Approved Date'], type: 'date' },
      amount: { required: true, aliases: ['Amount', 'Approved Amount', 'Bonus Amount'], type: 'number' },
      bonus_identifier: { required: false, aliases: ['Bonus Identifier', 'BonusID'], type: 'string' },
      category: { required: false, aliases: ['Category'], type: 'string' },
      budget_line_item: { required: false, aliases: ['Budget Line Item', 'Line Item'], type: 'string' },
      oe: { required: false, aliases: ['O/E', 'OE'], type: 'string' },
      bonus_type: { required: false, aliases: ['Bonus Type'], type: 'string' },
      installment_count: { required: false, aliases: ['Installment Count', 'Installments', 'Num Installments'], type: 'integer' },
      initial_amount: { required: false, aliases: ['Initial Amount', 'Initial Payment', 'Initial Installment'], type: 'number' },
      obligation_date: { required: false, aliases: ['Obligation Date', 'ObligationDate'], type: 'date' },
      payment_date: { required: false, aliases: ['Payment Date', 'PaymentDate'], type: 'date' },
      cancellation_date: { required: false, aliases: ['Cancellation Date', 'Cancel Date'], type: 'date' },
      line_identifier: { required: false, aliases: ['Line Identifier', 'LineID'], type: 'string' },
    },
  },
  [SOURCE_TYPES.BUDGET]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      budget_line_item: { required: true, aliases: ['Budget Line Item', 'BudgetLineItem', 'Line Item'], type: 'string' },
      category: { required: true, aliases: ['Category'], type: 'string' },
      oe: { required: true, aliases: ['O/E', 'OE'], type: 'string' },
      bonus_type: { required: true, aliases: ['Bonus Type'], type: 'string' },
      amount: { required: true, aliases: ['Amount', 'Budget Amount', 'Budget'], type: 'number' },
    },
  },
  [SOURCE_TYPES.REFERENCE]: {
    logicalFields: {
      reference_type: { required: true, aliases: ['Reference Type', 'ReferenceType'], type: 'string' },
      raw_value: { required: true, aliases: ['Raw Value', 'RawValue'], type: 'string' },
      standard_value: { required: true, aliases: ['Standard Value', 'StandardValue'], type: 'string' },
      is_active: { required: true, aliases: ['Active Flag', 'Active', 'Is Active'], type: 'string' },
      effective_date: { required: false, aliases: ['Effective Date', 'EffectiveDate'], type: 'date' },
      expiration_date: { required: false, aliases: ['Expiration Date', 'ExpirationDate'], type: 'date' },
      notes: { required: false, aliases: ['Notes', 'Comment', 'Comments'], type: 'string' },
    },
  },
  [SOURCE_TYPES.ASSUMPTIONS]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      category: { required: true, aliases: ['Category'], type: 'string' },
      target_avg_initial_bonus: { required: false, aliases: ['Target Avg Initial Bonus', 'Target Average Initial Bonus', 'TargetInitialAvg'], type: 'number' },
      planned_need: { required: false, aliases: ['Planned Need', 'Need', 'Projected Need'], type: 'integer' },
      take_rate: { required: false, aliases: ['Take Rate', 'TakeRate'], type: 'number' },
      priority_rank: { required: false, aliases: ['Priority Rank', 'Priority'], type: 'integer' },
      distribution_rule: { required: false, aliases: ['Distribution Rule', 'Distribution'], type: 'string' },
      notes: { required: false, aliases: ['Notes'], type: 'string' },
    },
  },
};

const DEFAULT_REFERENCE_MAPPINGS = [
  { reference_type: 'status', raw_value: 'A', standard_value: 'Approved', is_active: true },
  { reference_type: 'status', raw_value: 'Approved', standard_value: 'Approved', is_active: true },
  { reference_type: 'status', raw_value: 'C', standard_value: 'Cancelled', is_active: true },
  { reference_type: 'status', raw_value: 'Cancelled', standard_value: 'Cancelled', is_active: true },
  { reference_type: 'status', raw_value: 'P', standard_value: 'Pending', is_active: true },
  { reference_type: 'status', raw_value: 'Pending', standard_value: 'Pending', is_active: true },
  { reference_type: 'status', raw_value: '', standard_value: 'Unknown', is_active: true },
  { reference_type: 'oe', raw_value: 'O', standard_value: 'O', is_active: true },
  { reference_type: 'oe', raw_value: 'Officer', standard_value: 'O', is_active: true },
  { reference_type: 'oe', raw_value: 'E', standard_value: 'E', is_active: true },
  { reference_type: 'oe', raw_value: 'Enlisted', standard_value: 'E', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Lump Sum', standard_value: 'Lump Sum', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Initial + Anniversary', standard_value: 'Initial + Anniversary', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Initial + Multiple Anniversary', standard_value: 'Initial + Multiple Anniversary', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Unknown', standard_value: 'Unknown', is_active: true },
];

const TABLE_EXPORT_FILENAME_PREFIX = 'bonus-ecosystem-platform';

const SAMPLE_FILE_CONTENTS = {
  'authorized_bonus_sample.csv': `FY,Category,Budget Line Item,O/E,Bonus Type,Amount,Installment Structure,Effective Date,Expiration Date,Line Identifier,Bonus Identifier\n2026,Aviation,Pilot Retention,O,Flight,50000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-100,BONUS-100\n2026,Aviation,Pilot Accession,O,Accession,30000,Lump Sum,2025-10-01,2026-09-30,LINE-101,BONUS-101\n2026,Cyber,Cyber Enlistment,E,Enlistment,20000,Initial + Multiple Anniversary,2025-10-01,2026-09-30,LINE-200,BONUS-200\n2026,Medical,Medical Retention,O,Retention,40000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-300,BONUS-300\n2026,Aviation,Pilot Retention,O,Flight,50000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-100,BONUS-100\n2027,Cyber,Cyber Enlistment,E,Enlistment,21000,Unknown,2026-10-01,2027-09-30,LINE-201,BONUS-201`,
  'approval_execution_sample.csv': `Member ID,Status,Approval Date,Amount,Bonus Identifier,Category,Budget Line Item,O/E,Bonus Type,Installment Count,Initial Amount,Obligation Date,Payment Date,Cancellation Date,Line Identifier\nMEM-001,Approved,2025-10-10,50000,BONUS-100,Aviation,Pilot Retention,O,Flight,2,25000,2025-10-10,2025-10-10,,LINE-100\nMEM-002,C,2025-11-15,30000,BONUS-101,Aviation,Pilot Accession,O,Accession,1,30000,2025-11-15,2025-11-15,2025-12-01,LINE-101\nMEM-003,A,2026-01-12,20000,BONUS-200,Cyber,Cyber Enlistment,E,Enlistment,4,10000,2026-01-12,2026-01-12,,LINE-200\nMEM-004,,2026-02-05,15000,,Cyber,Cyber Enlistment,E,Enlistment,4,7500,2026-02-05,2026-02-05,,\nMEM-005,Pending,2026-03-22,40000,BONUS-300,Medical,Medical Retention,O,Retention,2,20000,2026-03-22,2026-03-22,,LINE-300\nMEM-006,Approved,2026-04-18,50000,,Aviation,Pilot Retention,O,Flight,2,25000,2026-04-18,2026-04-18,,LINE-999\nMEM-007,Approved,2026-06-01,25000,,Space,Orbital Retention,O,Retention,2,12500,2026-06-01,2026-06-01,,LINE-777\nMEM-008,Approved,2026-06-01,-5000,,Cyber,Cyber Enlistment,E,Enlistment,4,1000,2026-06-01,2026-06-01,,LINE-200`,
  'budget_sample.csv': `FY,Budget Line Item,Category,O/E,Bonus Type,Amount\n2026,Pilot Retention,Aviation,O,Flight,160000\n2026,Pilot Accession,Aviation,O,Accession,45000\n2026,Cyber Enlistment,Cyber,E,Enlistment,70000\n2026,Medical Retention,Medical,O,Retention,90000\n2027,Cyber Enlistment,Cyber,E,Enlistment,60000`,
  'reference_crosswalk_sample.csv': `Reference Type,Raw Value,Standard Value,Active Flag,Effective Date,Expiration Date,Notes\nstatus,A,Approved,Y,2025-01-01,,Seed status mapping\nstatus,Approved,Approved,Y,2025-01-01,,Seed status mapping\nstatus,C,Cancelled,Y,2025-01-01,,Seed status mapping\nstatus,Cancelled,Cancelled,Y,2025-01-01,,Seed status mapping\nstatus,P,Pending,Y,2025-01-01,,Seed status mapping\nstatus,Pending,Pending,Y,2025-01-01,,Seed status mapping\noe,O,O,Y,2025-01-01,,Officer seed\noe,E,E,Y,2025-01-01,,Enlisted seed\ncategory,Aviation,Aviation,Y,2025-01-01,,Category seed\ncategory,Cyber,Cyber,Y,2025-01-01,,Category seed\ncategory,Medical,Medical,Y,2025-01-01,,Category seed\ncategory,Space,Space,Y,2025-01-01,,Intentional warning category\nbonus_type,Flight,Flight,Y,2025-01-01,,Bonus type seed\nbonus_type,Accession,Accession,Y,2025-01-01,,Bonus type seed\nbonus_type,Enlistment,Enlistment,Y,2025-01-01,,Bonus type seed\nbonus_type,Retention,Retention,Y,2025-01-01,,Bonus type seed\nbudget_line_item,Pilot Retention,Pilot Retention,Y,2025-01-01,,Line seed\nbudget_line_item,Pilot Accession,Pilot Accession,Y,2025-01-01,,Line seed\nbudget_line_item,Cyber Enlistment,Cyber Enlistment,Y,2025-01-01,,Line seed\nbudget_line_item,Medical Retention,Medical Retention,Y,2025-01-01,,Line seed\nbudget_line_item,Orbital Retention,Orbital Retention,N,2025-01-01,,Inactive to trigger exception\ninstallment_structure,Lump Sum,Lump Sum,Y,2025-01-01,,Installment seed\ninstallment_structure,Initial + Anniversary,Initial + Anniversary,Y,2025-01-01,,Installment seed\ninstallment_structure,Initial + Multiple Anniversary,Initial + Multiple Anniversary,Y,2025-01-01,,Installment seed`,
  'assumptions_sample.csv': `FY,Category,Target Avg Initial Bonus,Planned Need,Take Rate,Priority Rank,Distribution Rule,Notes\n2026,Aviation,26000,4,0.75,1,balanced,Priority community\n2026,Cyber,12000,5,0.8,2,balanced,Supports pipeline need\n2026,Medical,22000,2,0.5,3,balanced,Limited hiring pool\n2027,Cyber,13000,4,0.75,2,balanced,Future year example`,
};

const BUNDLED_SAMPLE_FILES = [
  { fileName: 'authorized_bonus_sample.csv', sourceType: SOURCE_TYPES.AUTHORIZED },
  { fileName: 'approval_execution_sample.csv', sourceType: SOURCE_TYPES.APPROVAL },
  { fileName: 'budget_sample.csv', sourceType: SOURCE_TYPES.BUDGET },
  { fileName: 'reference_crosswalk_sample.csv', sourceType: SOURCE_TYPES.REFERENCE },
  { fileName: 'assumptions_sample.csv', sourceType: SOURCE_TYPES.ASSUMPTIONS },
];

/* modules/utils.js */
function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase();
}

function sanitizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[$,%\s,]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : null;
}

/** Centralized date parsing for all source data. */
function parseDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const parsed = new Date(excelEpoch.getTime() + value * 86400000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const normalized = String(value).trim();
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Centralized FY derivation: Oct-Dec roll into next FY, Jan-Sep use calendar year. */
function deriveFiscalYear(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return null;
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return month >= 9 ? year + 1 : year;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

function toCurrency(value) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numeric);
}

function toPercent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.0%';
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function safeDivide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function chunkArray(items = [], size = 50) {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function sumBy(items, selector) {
  return items.reduce((sum, item) => sum + Number(selector(item) ?? 0), 0);
}

function averageBy(items, selector) {
  if (!items.length) return 0;
  return sumBy(items, selector) / items.length;
}

function uniqueValues(items, selector) {
  return [...new Set(items.map(selector).filter((value) => value !== null && value !== undefined && value !== ''))];
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hashContent(content = '') {
  let hash = 0;
  const text = String(content);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function downloadCsv(rows, fileName) {
  if (!rows.length) return;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => csvEscape(row[column])).join(','));
  });
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), fileName);
}

function resolveColumns(headers = [], logicalFieldConfig = {}) {
  const normalizedHeaders = headers.map((header) => ({ raw: header, normalized: normalizeKey(header) }));
  const resolved = {};
  const issues = [];
  Object.entries(logicalFieldConfig).forEach(([logicalField, config]) => {
    const matches = normalizedHeaders.filter((header) => config.aliases.some((alias) => normalizeKey(alias) === header.normalized));
    if (!matches.length && config.required) {
      issues.push(`Missing required column for ${logicalField}`);
      return;
    }
    if (matches.length > 1) {
      issues.push(`Multiple columns resolve to ${logicalField}: ${matches.map((match) => match.raw).join(', ')}`);
    }
    resolved[logicalField] = matches[0]?.raw ?? null;
  });
  const duplicatePhysicalColumns = Object.entries(resolved)
    .filter(([, physical]) => physical)
    .reduce((acc, [logicalField, physical]) => {
      acc[physical] ||= [];
      acc[physical].push(logicalField);
      return acc;
    }, {});
  Object.entries(duplicatePhysicalColumns).forEach(([physical, logicalFields]) => {
    if (logicalFields.length > 1) {
      issues.push(`Physical column ${physical} mapped to multiple logical fields: ${logicalFields.join(', ')}`);
    }
  });
  return { resolved, issues };
}

function isValidExtension(fileName = '') {
  return /\.(csv|xlsx|xls)$/i.test(fileName);
}

function coerceBooleanFlag(value) {
  return ['y', 'yes', 'true', '1'].includes(normalizeKey(value));
}

function optionize(values) {
  return uniqueValues(values, (item) => item).sort((a, b) => String(a).localeCompare(String(b)));
}

function buildLookupKey(parts = []) {
  return parts.map((part) => normalizeKey(part)).join('|');
}

function nowIso() {
  return new Date().toISOString();
}

/* modules/data-loader.js */

function parseCsv(content) {
  return new Promise((resolve, reject) => {
    if (!window.Papa) {
      reject(new Error('PapaParse is not available.'));
      return;
    }
    window.Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
    });
  });
}

function parseWorkbook(content, fileName) {
  if (!window.XLSX) {
    throw new Error('SheetJS is not available.');
  }
  const workbook = window.XLSX.read(content, { type: 'binary' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error(`Workbook ${fileName} has no sheets.`);
  return window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
}

async function parseContentByExtension({ fileName, content }) {
  if (/\.csv$/i.test(fileName)) {
    return parseCsv(content);
  }
  if (/\.(xlsx|xls)$/i.test(fileName)) {
    return parseWorkbook(content, fileName);
  }
  throw new Error(`Unsupported file type for ${fileName}`);
}

async function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error(`Unable to read ${file.name}`));
    if (/\.csv$/i.test(file.name)) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });
}

async function createSourceFileRecord({ fileName, sourceType, content, origin = 'uploaded' }) {
  if (!isValidExtension(fileName)) {
    return {
      source_file_id: uid('file'),
      file_name: fileName,
      source_type: sourceType,
      origin,
      uploaded_at: nowIso(),
      row_count: 0,
      valid_row_count: 0,
      file_hash: hashContent(content),
      validation_status: 'Not Ready',
      file_errors: ['Invalid file extension.'],
      raw_content: content,
      rows: [],
    };
  }

  try {
    const rows = await parseContentByExtension({ fileName, content });
    return {
      source_file_id: uid('file'),
      file_name: fileName,
      source_type: sourceType,
      origin,
      uploaded_at: nowIso(),
      row_count: rows.length,
      valid_row_count: 0,
      file_hash: hashContent(`${fileName}:${rows.length}:${content.slice(0, 500)}`),
      validation_status: 'Pending',
      file_errors: [],
      raw_content: content,
      rows,
    };
  } catch (error) {
    return {
      source_file_id: uid('file'),
      file_name: fileName,
      source_type: sourceType,
      origin,
      uploaded_at: nowIso(),
      row_count: 0,
      valid_row_count: 0,
      file_hash: hashContent(content),
      validation_status: 'Not Ready',
      file_errors: [error.message],
      raw_content: content,
      rows: [],
    };
  }
}

async function loadBundledSampleSourceFiles() {
  const files = [];
  for (const sample of BUNDLED_SAMPLE_FILES) {
    files.push(
      await createSourceFileRecord({
        fileName: sample.fileName,
        sourceType: sample.sourceType,
        content: SAMPLE_FILE_CONTENTS[sample.fileName],
        origin: 'bundled-sample',
      }),
    );
  }
  return files;
}

function detectDuplicateUpload(existingFiles, candidateFile) {
  const match = existingFiles.find(
    (file) => file.file_name === candidateFile.file_name && (file.row_count === candidateFile.row_count || file.file_hash === candidateFile.file_hash),
  );
  return match || null;
}

function getRequiredSourceTypes() {
  return [SOURCE_TYPES.AUTHORIZED, SOURCE_TYPES.APPROVAL, SOURCE_TYPES.BUDGET, SOURCE_TYPES.REFERENCE];
}

/* modules/validation-engine.js */

function baseOutput(sourceFile, rowIndex) {
  return {
    source_file_id: sourceFile.source_file_id,
    raw_row_number: rowIndex + 2,
    validation_errors: [],
    is_valid: true,
  };
}

function parseValueByType(type, rawValue, fieldLabel, errors, { required = false, allowNegative = false } = {}) {
  const value = sanitizeString(rawValue);
  if (!value) {
    if (required) errors.push(`${fieldLabel} is required.`);
    return null;
  }
  if (type === 'string') return value;
  if (type === 'number') {
    const parsed = parseNumber(value);
    if (parsed === null) errors.push(`${fieldLabel} must be numeric.`);
    else if (!allowNegative && parsed < 0) errors.push(`${fieldLabel} cannot be negative.`);
    return parsed;
  }
  if (type === 'integer') {
    const parsed = parseInteger(value);
    if (parsed === null) errors.push(`${fieldLabel} must be an integer.`);
    return parsed;
  }
  if (type === 'date') {
    const parsed = parseDate(value);
    if (!parsed) errors.push(`${fieldLabel} must be a valid date.`);
    return parsed ? formatDate(parsed) : null;
  }
  return value;
}

function normalizeAuthorized(sourceFile, row, rowIndex, columnMap) {
  const output = {
    authorized_bonus_id: uid('authorized'),
    ...baseOutput(sourceFile, rowIndex),
    category_raw: sanitizeString(row[columnMap.category]),
    budget_line_item_raw: sanitizeString(row[columnMap.budget_line_item]),
    oe_raw: sanitizeString(row[columnMap.oe]),
    bonus_type_raw: sanitizeString(row[columnMap.bonus_type]),
    installment_structure_raw: sanitizeString(row[columnMap.installment_structure]),
    mapping_status: 'Pending',
  };
  const errors = output.validation_errors;
  output.fy = parseValueByType('integer', row[columnMap.fy], 'FY', errors, { required: true });
  output.category = output.category_raw || null;
  output.budget_line_item = output.budget_line_item_raw || null;
  output.oe = output.oe_raw || null;
  output.bonus_type = output.bonus_type_raw || null;
  output.authorized_amount = parseValueByType('number', row[columnMap.amount], 'Amount', errors, { required: true });
  output.installment_structure = output.installment_structure_raw || null;
  output.installment_count = null;
  output.effective_date = parseValueByType('date', row[columnMap.effective_date], 'Effective Date', errors, { required: true });
  output.expiration_date = columnMap.expiration_date ? parseValueByType('date', row[columnMap.expiration_date], 'Expiration Date', errors) : null;
  output.line_identifier = columnMap.line_identifier ? sanitizeString(row[columnMap.line_identifier]) || null : null;
  output.bonus_identifier = columnMap.bonus_identifier ? sanitizeString(row[columnMap.bonus_identifier]) || null : null;
  output.is_valid = !errors.length;
  return output;
}

function normalizeApproval(sourceFile, row, rowIndex, columnMap) {
  const output = {
    approved_bonus_record_id: uid('approval'),
    ...baseOutput(sourceFile, rowIndex),
    status_raw: sanitizeString(row[columnMap.status]),
    category_raw: columnMap.category ? sanitizeString(row[columnMap.category]) : '',
    budget_line_item_raw: columnMap.budget_line_item ? sanitizeString(row[columnMap.budget_line_item]) : '',
    oe_raw: columnMap.oe ? sanitizeString(row[columnMap.oe]) : '',
    bonus_type_raw: columnMap.bonus_type ? sanitizeString(row[columnMap.bonus_type]) : '',
    match_authorized_bonus_id: null,
    match_status: 'Unmatched',
    match_confidence: 'None',
    exception_flag: false,
  };
  const errors = output.validation_errors;
  output.member_record_key = parseValueByType('string', row[columnMap.member_record_key], 'Member ID or Record Key', errors, { required: true });
  output.status = output.status_raw || 'Unknown';
  output.approval_date = parseValueByType('date', row[columnMap.approval_date], 'Approval Date', errors, { required: true });
  output.approved_amount = parseValueByType('number', row[columnMap.amount], 'Amount', errors, { required: true });
  output.bonus_identifier = columnMap.bonus_identifier ? sanitizeString(row[columnMap.bonus_identifier]) || null : null;
  output.category = output.category_raw || null;
  output.budget_line_item = output.budget_line_item_raw || null;
  output.oe = output.oe_raw || null;
  output.bonus_type = output.bonus_type_raw || null;
  output.installment_count = columnMap.installment_count ? parseValueByType('integer', row[columnMap.installment_count], 'Installment Count', errors) : null;
  output.initial_amount = columnMap.initial_amount ? parseValueByType('number', row[columnMap.initial_amount], 'Initial Amount', errors, { allowNegative: false }) : null;
  output.obligation_date = columnMap.obligation_date ? parseValueByType('date', row[columnMap.obligation_date], 'Obligation Date', errors) : null;
  output.payment_date = columnMap.payment_date ? parseValueByType('date', row[columnMap.payment_date], 'Payment Date', errors) : null;
  output.cancellation_date = columnMap.cancellation_date ? parseValueByType('date', row[columnMap.cancellation_date], 'Cancellation Date', errors) : null;
  output.line_identifier = columnMap.line_identifier ? sanitizeString(row[columnMap.line_identifier]) || null : null;
  output.obligation_fy = deriveFiscalYear(output.obligation_date || output.approval_date);
  output.is_valid = !errors.length;
  return output;
}

function normalizeBudget(sourceFile, row, rowIndex, columnMap) {
  const output = {
    budget_record_id: uid('budget'),
    ...baseOutput(sourceFile, rowIndex),
    category_raw: sanitizeString(row[columnMap.category]),
    budget_line_item_raw: sanitizeString(row[columnMap.budget_line_item]),
    oe_raw: sanitizeString(row[columnMap.oe]),
    bonus_type_raw: sanitizeString(row[columnMap.bonus_type]),
  };
  const errors = output.validation_errors;
  output.fy = parseValueByType('integer', row[columnMap.fy], 'FY', errors, { required: true });
  output.category = output.category_raw || null;
  output.budget_line_item = output.budget_line_item_raw || null;
  output.oe = output.oe_raw || null;
  output.bonus_type = output.bonus_type_raw || null;
  output.budget_amount = parseValueByType('number', row[columnMap.amount], 'Amount', errors, { required: true });
  output.is_valid = !errors.length;
  return output;
}

function normalizeReference(sourceFile, row, rowIndex, columnMap) {
  const output = {
    reference_record_id: uid('reference'),
    ...baseOutput(sourceFile, rowIndex),
  };
  const errors = output.validation_errors;
  output.reference_type = parseValueByType('string', row[columnMap.reference_type], 'Reference Type', errors, { required: true });
  output.raw_value = parseValueByType('string', row[columnMap.raw_value], 'Raw Value', errors, { required: true });
  output.standard_value = parseValueByType('string', row[columnMap.standard_value], 'Standard Value', errors, { required: true });
  output.is_active = columnMap.is_active ? coerceBooleanFlag(row[columnMap.is_active]) : false;
  output.effective_date = columnMap.effective_date ? parseValueByType('date', row[columnMap.effective_date], 'Effective Date', errors) : null;
  output.expiration_date = columnMap.expiration_date ? parseValueByType('date', row[columnMap.expiration_date], 'Expiration Date', errors) : null;
  output.notes = columnMap.notes ? sanitizeString(row[columnMap.notes]) : '';
  output.is_valid = !errors.length;
  return output;
}

function normalizeAssumption(sourceFile, row, rowIndex, columnMap) {
  const output = {
    assumption_record_id: uid('assumption'),
    ...baseOutput(sourceFile, rowIndex),
    category_raw: sanitizeString(row[columnMap.category]),
  };
  const errors = output.validation_errors;
  output.fy = parseValueByType('integer', row[columnMap.fy], 'FY', errors, { required: true });
  output.category = output.category_raw || null;
  output.target_avg_initial_bonus = columnMap.target_avg_initial_bonus ? parseValueByType('number', row[columnMap.target_avg_initial_bonus], 'Target Avg Initial Bonus', errors) : null;
  output.planned_need = columnMap.planned_need ? parseValueByType('integer', row[columnMap.planned_need], 'Planned Need', errors) : null;
  output.take_rate = columnMap.take_rate ? parseValueByType('number', row[columnMap.take_rate], 'Take Rate', errors) : null;
  output.priority_rank = columnMap.priority_rank ? parseValueByType('integer', row[columnMap.priority_rank], 'Priority Rank', errors) : null;
  output.distribution_rule = columnMap.distribution_rule ? sanitizeString(row[columnMap.distribution_rule]) : '';
  output.notes = columnMap.notes ? sanitizeString(row[columnMap.notes]) : '';
  output.is_valid = !errors.length;
  return output;
}

const NORMALIZERS = {
  [SOURCE_TYPES.AUTHORIZED]: normalizeAuthorized,
  [SOURCE_TYPES.APPROVAL]: normalizeApproval,
  [SOURCE_TYPES.BUDGET]: normalizeBudget,
  [SOURCE_TYPES.REFERENCE]: normalizeReference,
  [SOURCE_TYPES.ASSUMPTIONS]: normalizeAssumption,
};

function applyDuplicateRules(sourceType, records) {
  const seen = new Map();
  const getKey = (record) => {
    if (sourceType === SOURCE_TYPES.AUTHORIZED) {
      return buildLookupKey([record.fy, record.category, record.budget_line_item, record.oe, record.bonus_type, Number(record.authorized_amount ?? 0).toFixed(2), record.effective_date]);
    }
    if (sourceType === SOURCE_TYPES.APPROVAL) {
      return buildLookupKey([record.member_record_key, record.approval_date, Number(record.approved_amount ?? 0).toFixed(2), record.bonus_identifier]);
    }
    if (sourceType === SOURCE_TYPES.BUDGET) {
      return buildLookupKey([record.fy, record.category, record.budget_line_item, record.oe, record.bonus_type]);
    }
    return null;
  };

  records.forEach((record) => {
    const key = getKey(record);
    if (!key) return;
    if (seen.has(key)) {
      record.validation_errors.push('Potential duplicate key detected.');
      record.is_valid = false;
      const existing = seen.get(key);
      if (!existing.validation_errors.includes('Potential duplicate key detected.')) {
        existing.validation_errors.push('Potential duplicate key detected.');
        existing.is_valid = false;
      }
      return;
    }
    seen.set(key, record);
  });
}

function validateAndNormalizeSourceFile(sourceFile) {
  const schema = SOURCE_SCHEMAS[sourceFile.source_type];
  if (!schema) {
    return {
      file: {
        ...sourceFile,
        validation_status: MODEL_READINESS.WARNING,
        file_errors: [...sourceFile.file_errors, 'Unsupported or non-modeled source type.'],
      },
      records: [],
      issues: ['Unsupported source type.'],
    };
  }

  const headers = sourceFile.rows.length ? Object.keys(sourceFile.rows[0]) : [];
  const columnResolution = resolveColumns(headers, schema.logicalFields);
  const issues = [...sourceFile.file_errors, ...columnResolution.issues];
  const records = sourceFile.rows.map((row, rowIndex) => NORMALIZERS[sourceFile.source_type](sourceFile, row, rowIndex, columnResolution.resolved));
  applyDuplicateRules(sourceFile.source_type, records);

  const fileValidationStatus = issues.length
    ? MODEL_READINESS.NOT_READY
    : records.some((record) => !record.is_valid)
      ? MODEL_READINESS.WARNING
      : MODEL_READINESS.READY;

  return {
    file: {
      ...sourceFile,
      valid_row_count: records.filter((record) => record.is_valid).length,
      validation_status: fileValidationStatus,
      file_errors: issues,
      resolved_columns: columnResolution.resolved,
    },
    records,
    issues,
  };
}

function buildValidationSummary(validatedState) {
  const issues = [];
  Object.values(validatedState.datasets).forEach((dataset) => {
    dataset.files.forEach((file) => {
      file.file_errors.forEach((error) => issues.push({ level: 'File', file_name: file.file_name, issue: error, source_type: file.source_type }));
    });
    dataset.records.forEach((record) => {
      record.validation_errors.forEach((error) => issues.push({ level: 'Record', source_type: dataset.sourceType, row: record.raw_row_number, issue: error, record_id: Object.values(record).find((value) => typeof value === 'string' && value.includes('-')) }));
    });
  });
  return issues;
}

function determineModelReadiness({ datasets, validationIssues, mappingIssues }) {
  const requiredSources = [SOURCE_TYPES.AUTHORIZED, SOURCE_TYPES.BUDGET, SOURCE_TYPES.APPROVAL, SOURCE_TYPES.REFERENCE];
  const missingRequired = requiredSources.filter((sourceType) => !(datasets[sourceType]?.records ?? []).some((record) => record.is_valid));
  if (missingRequired.length) {
    return {
      status: MODEL_READINESS.NOT_READY,
      reasons: [`Missing valid required sources: ${missingRequired.join(', ')}`],
    };
  }
  const criticalValidationFailures = validationIssues.filter((issue) => /missing required column|invalid file extension|unsupported|must be numeric|must be an integer|required/i.test(issue.issue || issue));
  if (criticalValidationFailures.length) {
    return {
      status: MODEL_READINESS.NOT_READY,
      reasons: criticalValidationFailures.slice(0, 10).map((issue) => issue.issue || issue),
    };
  }
  if (mappingIssues.length || validationIssues.length) {
    return {
      status: MODEL_READINESS.WARNING,
      reasons: [...mappingIssues.slice(0, 5), ...validationIssues.slice(0, 5).map((issue) => issue.issue)],
    };
  }
  return {
    status: MODEL_READINESS.READY,
    reasons: [],
  };
}

function createEmptyValidatedState() {
  return {
    datasets: {
      [SOURCE_TYPES.AUTHORIZED]: { sourceType: SOURCE_TYPES.AUTHORIZED, files: [], records: [] },
      [SOURCE_TYPES.APPROVAL]: { sourceType: SOURCE_TYPES.APPROVAL, files: [], records: [] },
      [SOURCE_TYPES.BUDGET]: { sourceType: SOURCE_TYPES.BUDGET, files: [], records: [] },
      [SOURCE_TYPES.REFERENCE]: { sourceType: SOURCE_TYPES.REFERENCE, files: [], records: [] },
      [SOURCE_TYPES.ASSUMPTIONS]: { sourceType: SOURCE_TYPES.ASSUMPTIONS, files: [], records: [] },
    },
    validationIssues: [],
    modelReadiness: { status: MODEL_READINESS.NOT_READY, reasons: [] },
  };
}

/* modules/reference-manager.js */

function buildReferenceManager(referenceRecords = [], customInstallmentRules = []) {
  const activeRecords = referenceRecords.filter((record) => record.is_valid && record.is_active);
  const mergedReferenceRecords = [
    ...DEFAULT_REFERENCE_MAPPINGS.map((record, index) => ({
      reference_record_id: `seed-reference-${index + 1}`,
      source_file_id: 'seed',
      raw_row_number: index + 1,
      validation_errors: [],
      is_valid: true,
      effective_date: null,
      expiration_date: null,
      notes: 'Seed default mapping',
      ...record,
    })),
    ...activeRecords,
  ];

  const mappingIndex = mergedReferenceRecords.reduce((acc, record) => {
    const refType = normalizeKey(record.reference_type);
    const rawValue = normalizeKey(record.raw_value);
    acc[refType] ||= new Map();
    acc[refType].set(rawValue, record.standard_value);
    return acc;
  }, {});

  const allInstallmentRules = [...deepClone(DEFAULT_INSTALLMENT_RULES), ...deepClone(customInstallmentRules || [])];
  const installmentRuleMap = new Map();
  allInstallmentRules.forEach((rule) => {
    installmentRuleMap.set(normalizeKey(rule.installment_structure), rule);
  });

  return {
    referenceRecords: mergedReferenceRecords,
    mappingIndex,
    installmentRuleMap,
    mapValue(referenceType, rawValue) {
      const refType = normalizeKey(referenceType);
      const raw = sanitizeString(rawValue);
      if (!raw && refType === 'status') return 'Unknown';
      return mappingIndex[refType]?.get(normalizeKey(raw)) ?? null;
    },
    hasMapping(referenceType, rawValue) {
      return !!this.mapValue(referenceType, rawValue);
    },
    getInstallmentRule(structure) {
      return installmentRuleMap.get(normalizeKey(structure)) || installmentRuleMap.get('unknown') || DEFAULT_INSTALLMENT_RULES.at(-1);
    },
    getReferenceTableRows(tableName) {
      const normalized = normalizeKey(tableName);
      if (normalized === 'installment rules' || normalized === 'installment_rules') {
        return Array.from(installmentRuleMap.values());
      }
      return mergedReferenceRecords.filter((record) => normalizeKey(record.reference_type) === normalized);
    },
  };
}

function seedDefaultAssumptions(validAuthorizedRows = []) {
  const categories = [...new Set(validAuthorizedRows.map((row) => row.category).filter(Boolean))];
  return categories.map((category, index) => ({
    assumption_record_id: `seed-assumption-${index + 1}`,
    source_file_id: 'seed',
    raw_row_number: index + 1,
    fy: validAuthorizedRows[0]?.fy ?? new Date().getUTCFullYear(),
    category,
    category_raw: category,
    target_avg_initial_bonus: null,
    planned_need: 0,
    take_rate: null,
    priority_rank: index + 1,
    distribution_rule: 'balanced',
    notes: 'Seed assumption generated because no assumptions file was loaded.',
    validation_errors: [],
    is_valid: true,
  }));
}

/* modules/mapping-engine.js */

function mapField(record, fieldName, rawFieldName, referenceType, referenceManager, issues) {
  const rawValue = record[rawFieldName] ?? record[fieldName] ?? null;
  if (!rawValue) {
    record[fieldName] = null;
    issues.push(`${fieldName} blank.`);
    return;
  }
  const mapped = referenceManager.mapValue(referenceType, rawValue);
  if (mapped === null || mapped === undefined || mapped === '') {
    record[fieldName] = null;
    issues.push(`Unmapped ${fieldName}: ${rawValue}`);
    return;
  }
  record[fieldName] = mapped;
}

function addIssues(record, issues) {
  const unique = [...new Set(issues.filter(Boolean))];
  if (unique.length) {
    record.validation_errors.push(...unique);
    record.exception_flag = true;
  }
}

function applyMappings(validatedState, referenceManager) {
  const mappingIssues = [];
  const authorized = validatedState.datasets[SOURCE_TYPES.AUTHORIZED].records.map((record) => {
    const clone = structuredClone(record);
    const issues = [];
    mapField(clone, 'category', 'category_raw', 'category', referenceManager, issues);
    mapField(clone, 'budget_line_item', 'budget_line_item_raw', 'budget_line_item', referenceManager, issues);
    mapField(clone, 'oe', 'oe_raw', 'oe', referenceManager, issues);
    mapField(clone, 'bonus_type', 'bonus_type_raw', 'bonus_type', referenceManager, issues);
    mapField(clone, 'installment_structure', 'installment_structure_raw', 'installment_structure', referenceManager, issues);
    clone.installment_count = referenceManager.getInstallmentRule(clone.installment_structure).installment_count;
    clone.mapping_status = issues.length ? 'Partial' : 'Mapped';
    addIssues(clone, issues);
    mappingIssues.push(...issues.map((issue) => `Authorized ${clone.raw_row_number}: ${issue}`));
    return clone;
  });

  const budgets = validatedState.datasets[SOURCE_TYPES.BUDGET].records.map((record) => {
    const clone = structuredClone(record);
    const issues = [];
    mapField(clone, 'category', 'category_raw', 'category', referenceManager, issues);
    mapField(clone, 'budget_line_item', 'budget_line_item_raw', 'budget_line_item', referenceManager, issues);
    mapField(clone, 'oe', 'oe_raw', 'oe', referenceManager, issues);
    mapField(clone, 'bonus_type', 'bonus_type_raw', 'bonus_type', referenceManager, issues);
    addIssues(clone, issues);
    mappingIssues.push(...issues.map((issue) => `Budget ${clone.raw_row_number}: ${issue}`));
    return clone;
  });

  const assumptions = validatedState.datasets[SOURCE_TYPES.ASSUMPTIONS].records.map((record) => {
    const clone = structuredClone(record);
    const issues = [];
    mapField(clone, 'category', 'category_raw', 'category', referenceManager, issues);
    addIssues(clone, issues);
    mappingIssues.push(...issues.map((issue) => `Assumption ${clone.raw_row_number}: ${issue}`));
    return clone;
  });

  const approvals = validatedState.datasets[SOURCE_TYPES.APPROVAL].records.map((record) => {
    const clone = structuredClone(record);
    const issues = [];
    const mappedStatus = referenceManager.mapValue('status', clone.status_raw);
    clone.status = mappedStatus || 'Unknown';
    if (!mappedStatus) issues.push(`Unmapped status: ${clone.status_raw || '(blank)'}`);
    if (clone.category_raw) mapField(clone, 'category', 'category_raw', 'category', referenceManager, issues);
    if (clone.budget_line_item_raw) mapField(clone, 'budget_line_item', 'budget_line_item_raw', 'budget_line_item', referenceManager, issues);
    if (clone.oe_raw) mapField(clone, 'oe', 'oe_raw', 'oe', referenceManager, issues);
    if (clone.bonus_type_raw) mapField(clone, 'bonus_type', 'bonus_type_raw', 'bonus_type', referenceManager, issues);
    clone.exception_flag = issues.length > 0;
    addIssues(clone, issues);
    mappingIssues.push(...issues.map((issue) => `Approval ${clone.raw_row_number}: ${issue}`));
    return clone;
  });

  return {
    ...validatedState,
    datasets: {
      ...validatedState.datasets,
      [SOURCE_TYPES.AUTHORIZED]: { ...validatedState.datasets[SOURCE_TYPES.AUTHORIZED], records: authorized },
      [SOURCE_TYPES.BUDGET]: { ...validatedState.datasets[SOURCE_TYPES.BUDGET], records: budgets },
      [SOURCE_TYPES.APPROVAL]: { ...validatedState.datasets[SOURCE_TYPES.APPROVAL], records: approvals },
      [SOURCE_TYPES.ASSUMPTIONS]: { ...validatedState.datasets[SOURCE_TYPES.ASSUMPTIONS], records: assumptions },
    },
    mappingIssues: [...new Set(mappingIssues)],
  };
}

/* modules/allocation-engine.js */

function calculateInitialPaymentAmount(authorizedRow, referenceManager) {
  const rule = referenceManager.getInstallmentRule(authorizedRow.installment_structure);
  const total = Number(authorizedRow.authorized_amount || 0);
  if (rule.initial_payment_type === 'full_amount') return roundCurrency(total);
  if (rule.initial_payment_type === 'fixed_amount') return roundCurrency(Math.min(total, Number(rule.initial_payment_value || 0)));
  return roundCurrency(total * Number(rule.initial_payment_value || 0));
}

function performPass1Allocation(rows, takerTarget, categoryBudget) {
  const eligible = rows.filter((row) => row.is_valid && Number(row.authorized_amount || 0) > 0);
  const allocations = new Map(eligible.map((row) => [row.authorized_bonus_id, 0]));
  if (!eligible.length || takerTarget <= 0 || categoryBudget <= 0) {
    return { allocations, supportableTakers: 0 };
  }

  let assigned = 0;
  let budgetUsed = 0;
  while (assigned < takerTarget) {
    let progress = false;
    for (const row of eligible) {
      if (assigned >= takerTarget) break;
      const nextBudget = budgetUsed + Number(row.authorized_amount || 0);
      if (nextBudget > categoryBudget + 0.01) continue;
      allocations.set(row.authorized_bonus_id, (allocations.get(row.authorized_bonus_id) || 0) + 1);
      assigned += 1;
      budgetUsed = nextBudget;
      progress = true;
      if (assigned >= takerTarget) break;
    }
    if (!progress) break;
  }

  return { allocations, supportableTakers: assigned };
}

function performPass2Shift(rows, allocations, targetAvgInitialBonus, categoryBudget, referenceManager) {
  if (!targetAvgInitialBonus) {
    return { allocations, shiftCount: 0, achievedAvgInitialBonus: calculateAchievedAverage(rows, allocations, referenceManager) };
  }
  const working = new Map(allocations);
  let shiftCount = 0;
  let improved = true;
  const maxIterations = 200;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    iterations += 1;
    improved = false;
    const currentAvg = calculateAchievedAverage(rows, working, referenceManager);
    const currentDelta = Math.abs(currentAvg - targetAvgInitialBonus);

    for (const fromRow of rows) {
      const fromCount = working.get(fromRow.authorized_bonus_id) || 0;
      if (fromCount <= 0) continue;
      for (const toRow of rows) {
        if (fromRow.authorized_bonus_id === toRow.authorized_bonus_id) continue;
        const nextBudget = calculateProjectedBudgetUsed(rows, working) - Number(fromRow.authorized_amount || 0) + Number(toRow.authorized_amount || 0);
        if (nextBudget > categoryBudget + 0.01) continue;
        const test = new Map(working);
        test.set(fromRow.authorized_bonus_id, fromCount - 1);
        test.set(toRow.authorized_bonus_id, (test.get(toRow.authorized_bonus_id) || 0) + 1);
        const nextAvg = calculateAchievedAverage(rows, test, referenceManager);
        const nextDelta = Math.abs(nextAvg - targetAvgInitialBonus);
        if (nextDelta + 0.01 < currentDelta) {
          working.clear();
          test.forEach((value, key) => working.set(key, value));
          shiftCount += 1;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return { allocations: working, shiftCount, achievedAvgInitialBonus: calculateAchievedAverage(rows, working, referenceManager) };
}

function calculateProjectedBudgetUsed(rows, allocations) {
  return rows.reduce((sum, row) => sum + (allocations.get(row.authorized_bonus_id) || 0) * Number(row.authorized_amount || 0), 0);
}

function calculateAchievedAverage(rows, allocations, referenceManager) {
  const weightedInitial = rows.reduce((sum, row) => sum + calculateInitialPaymentAmount(row, referenceManager) * (allocations.get(row.authorized_bonus_id) || 0), 0);
  const totalTakers = rows.reduce((sum, row) => sum + (allocations.get(row.authorized_bonus_id) || 0), 0);
  return totalTakers ? roundCurrency(weightedInitial / totalTakers) : 0;
}

/* modules/planning-engine.js */

function buildPlanningModel({ authorizedRecords, budgetRecords, assumptionRecords, referenceManager, selectedFy }) {
  const validAuthorized = authorizedRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const validBudget = budgetRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const validAssumptions = assumptionRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const authorizedByCategory = groupBy(validAuthorized, (row) => row.category || 'Unmapped');
  const budgetByCategory = groupBy(validBudget, (row) => row.category || 'Unmapped');
  const assumptionsByCategory = groupBy(validAssumptions, (row) => row.category || 'Unmapped');

  const categoryRows = [];
  const allocationRows = [];

  Object.entries(authorizedByCategory).forEach(([category, rows]) => {
    const assumption = assumptionsByCategory[category]?.[0] || null;
    const categoryBudget = (budgetByCategory[category] || []).reduce((sum, row) => sum + Number(row.budget_amount || 0), 0);
    const plannedNeed = Number(assumption?.planned_need || 0);
    const takeRate = assumption?.take_rate ?? null;
    const projectedTakerTarget = takeRate !== null && takeRate !== undefined ? Math.round(plannedNeed * takeRate) : plannedNeed;

    const pass1 = performPass1Allocation(rows, projectedTakerTarget, categoryBudget);
    const pass2 = performPass2Shift(rows, pass1.allocations, assumption?.target_avg_initial_bonus, categoryBudget, referenceManager);
    const supportableTakers = pass1.supportableTakers;
    const projectedBudgetUsed = calculateProjectedBudgetUsed(rows, pass2.allocations);
    const achievedAvgInitialBonus = calculateAchievedAverage(rows, pass2.allocations, referenceManager);

    categoryRows.push({
      fy: selectedFy,
      category,
      projected_taker_target: projectedTakerTarget,
      supportable_takers: supportableTakers,
      unfunded_need: Math.max(projectedTakerTarget - supportableTakers, 0),
      category_budget: roundCurrency(categoryBudget),
      projected_obligations: roundCurrency(projectedBudgetUsed),
      target_avg_initial_bonus: assumption?.target_avg_initial_bonus ?? null,
      achieved_avg_initial_bonus: achievedAvgInitialBonus,
      shift_count: pass2.shiftCount,
      execution_rate_vs_budget: safeDivide(projectedBudgetUsed, categoryBudget),
    });

    rows.forEach((row) => {
      const finalTakers = pass2.allocations.get(row.authorized_bonus_id) || 0;
      const pass1Takers = pass1.allocations.get(row.authorized_bonus_id) || 0;
      allocationRows.push({
        fy: row.fy,
        category: row.category,
        budget_line_item: row.budget_line_item,
        oe: row.oe,
        bonus_type: row.bonus_type,
        authorized_amount: roundCurrency(row.authorized_amount),
        initial_payment_amount: calculateInitialPaymentAmount(row, referenceManager),
        pass1_takers: pass1Takers,
        final_takers: finalTakers,
        projected_obligation: roundCurrency(finalTakers * Number(row.authorized_amount || 0)),
        target_avg_initial_bonus: assumption?.target_avg_initial_bonus ?? null,
        achieved_avg_initial_bonus: achievedAvgInitialBonus,
        shift_count: pass2.shiftCount,
        authorized_bonus_id: row.authorized_bonus_id,
        installment_structure: row.installment_structure,
        effective_date: row.effective_date,
      });
    });
  });

  return {
    categoryRows,
    allocationRows,
    totals: {
      projected_taker_target: categoryRows.reduce((sum, row) => sum + row.projected_taker_target, 0),
      supportable_takers: categoryRows.reduce((sum, row) => sum + row.supportable_takers, 0),
      projected_obligations: roundCurrency(categoryRows.reduce((sum, row) => sum + row.projected_obligations, 0)),
      unfunded_need: categoryRows.reduce((sum, row) => sum + row.unfunded_need, 0),
    },
  };
}

/* modules/authorization-engine.js */

function amountMatches(left, right) {
  return Math.abs(roundCurrency(left || 0) - roundCurrency(right || 0)) <= 0.01;
}

function chooseBestCandidate(candidates, approval) {
  if (!candidates.length) return null;
  const scored = candidates.map((candidate) => {
    const sameFy = candidate.fy === approval.obligation_fy || candidate.fy === approval.approval_fy;
    const effectiveDate = candidate.effective_date ? new Date(candidate.effective_date).getTime() : 0;
    const approvalDate = approval.approval_date ? new Date(approval.approval_date).getTime() : Number.MAX_SAFE_INTEGER;
    const datePenalty = effectiveDate > approvalDate ? 1 : 0;
    return {
      candidate,
      sameFy,
      effectiveDate,
      datePenalty,
    };
  }).sort((a, b) => {
    if (a.sameFy !== b.sameFy) return a.sameFy ? -1 : 1;
    if (a.datePenalty !== b.datePenalty) return a.datePenalty - b.datePenalty;
    return b.effectiveDate - a.effectiveDate;
  });

  const first = scored[0];
  const second = scored[1];
  if (second && first.sameFy === second.sameFy && first.datePenalty === second.datePenalty && first.effectiveDate === second.effectiveDate) {
    return { ambiguous: true, candidate: first.candidate };
  }
  return { ambiguous: false, candidate: first.candidate };
}

function matchApprovalsToAuthorized(approvals = [], authorized = []) {
  const validAuthorized = authorized.filter((record) => record.is_valid);
  const byBonusIdentifier = new Map();
  const byLineIdentifier = new Map();
  const byHierarchy3 = new Map();
  const byHierarchy4 = new Map();
  const byHierarchy5 = new Map();

  validAuthorized.forEach((record) => {
    if (record.bonus_identifier) {
      const key = buildLookupKey([record.bonus_identifier]);
      byBonusIdentifier.set(key, [...(byBonusIdentifier.get(key) || []), record]);
    }
    if (record.line_identifier) {
      const key = buildLookupKey([record.line_identifier]);
      byLineIdentifier.set(key, [...(byLineIdentifier.get(key) || []), record]);
    }
    const key3 = buildLookupKey([record.fy, record.category, record.bonus_type, record.oe, roundCurrency(record.authorized_amount)]);
    byHierarchy3.set(key3, [...(byHierarchy3.get(key3) || []), record]);
    const key4 = buildLookupKey([record.fy, record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    byHierarchy4.set(key4, [...(byHierarchy4.get(key4) || []), record]);
    const key5 = buildLookupKey([record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    byHierarchy5.set(key5, [...(byHierarchy5.get(key5) || []), record]);
  });

  return approvals.map((approval) => {
    const clone = structuredClone(approval);
    clone.approval_fy = clone.approval_date ? new Date(clone.approval_date).getUTCFullYear() + (new Date(clone.approval_date).getUTCMonth() >= 9 ? 1 : 0) : null;

    const searchSteps = [
      { type: 'identifier', key: clone.bonus_identifier ? buildLookupKey([clone.bonus_identifier]) : null, index: byBonusIdentifier, confidence: MATCH_CONFIDENCE.HIGH },
      { type: 'line', key: clone.line_identifier ? buildLookupKey([clone.line_identifier]) : null, index: byLineIdentifier, confidence: MATCH_CONFIDENCE.HIGH },
      { type: 'fy-category-bonus-oe-amount', key: buildLookupKey([clone.obligation_fy || clone.approval_fy, clone.category, clone.bonus_type, clone.oe, roundCurrency(clone.approved_amount)]), index: byHierarchy3, confidence: MATCH_CONFIDENCE.MEDIUM },
      { type: 'fy-category-bonus-amount', key: buildLookupKey([clone.obligation_fy || clone.approval_fy, clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)]), index: byHierarchy4, confidence: MATCH_CONFIDENCE.MEDIUM },
      { type: 'category-bonus-amount', key: buildLookupKey([clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)]), index: byHierarchy5, confidence: MATCH_CONFIDENCE.LOW },
    ];

    let matched = null;
    for (const step of searchSteps) {
      if (!step.key) continue;
      const candidates = (step.index.get(step.key) || []).filter((candidate) => amountMatches(candidate.authorized_amount, clone.approved_amount));
      if (!candidates.length) continue;
      const choice = chooseBestCandidate(candidates, clone);
      if (choice.ambiguous) {
        clone.match_status = MATCH_STATUS.PARTIAL;
        clone.match_confidence = MATCH_CONFIDENCE.LOW;
        clone.exception_flag = true;
        matched = choice.candidate;
        break;
      }
      clone.match_status = MATCH_STATUS.MATCHED;
      clone.match_confidence = step.confidence;
      matched = choice.candidate;
      break;
    }

    if (!matched) {
      clone.match_status = MATCH_STATUS.UNMATCHED;
      clone.match_confidence = MATCH_CONFIDENCE.NONE;
      clone.exception_flag = true;
      return clone;
    }

    clone.match_authorized_bonus_id = matched.authorized_bonus_id;
    if (!clone.category && matched.category) clone.category = matched.category;
    if (!clone.budget_line_item && matched.budget_line_item) clone.budget_line_item = matched.budget_line_item;
    if (!clone.oe && matched.oe) clone.oe = matched.oe;
    if (!clone.bonus_type && matched.bonus_type) clone.bonus_type = matched.bonus_type;
    return clone;
  });
}

function summarizeAuthorized(authorizedRecords = []) {
  const validRows = authorizedRecords.filter((record) => record.is_valid);
  const totalAuthorized = validRows.reduce((sum, row) => sum + Number(row.authorized_amount || 0), 0);
  const averageAuthorizedAmount = validRows.length ? totalAuthorized / validRows.length : 0;
  return {
    validRows,
    totalAuthorized,
    averageAuthorizedAmount,
    lineItemCount: new Set(validRows.map((row) => row.line_identifier || `${row.category}|${row.budget_line_item}|${row.bonus_type}`)).size,
    unmappedRowsCount: authorizedRecords.filter((row) => row.mapping_status !== 'Mapped' || row.exception_flag).length,
  };
}

/* modules/obligation-engine.js */

function buildObligationModel({ approvals, planningAllocations, authorizedRecords, selectedFy }) {
  const authorizedIndex = new Map(authorizedRecords.map((row) => [row.authorized_bonus_id, row]));
  const actualObligations = approvals
    .filter((record) => record.status === 'Approved' && record.is_valid)
    .map((record) => ({
      obligation_record_id: uid('obligation-actual'),
      source_mode: 'Actual',
      source_record_id: record.approved_bonus_record_id,
      approved_bonus_record_id: record.approved_bonus_record_id,
      authorized_bonus_id: record.match_authorized_bonus_id,
      category: record.category,
      budget_line_item: record.budget_line_item,
      oe: record.oe,
      bonus_type: record.bonus_type,
      obligation_date: formatDate(record.obligation_date || record.approval_date),
      obligation_fy: record.obligation_fy,
      obligation_amount: roundCurrency(record.approved_amount),
      installment_structure: record.match_authorized_bonus_id ? authorizedIndex.get(record.match_authorized_bonus_id)?.installment_structure : null,
      exception_flag: record.exception_flag || record.match_status !== 'Matched',
      match_status: record.match_status,
    }))
    .filter((record) => !selectedFy || record.obligation_fy === selectedFy);

  const planningFy = selectedFy || (new Date().getUTCFullYear() + 1);
  const projectedDate = `${planningFy - 1}-10-01`;
  const projectedObligations = planningAllocations
    .filter((row) => row.final_takers > 0)
    .map((row) => ({
      obligation_record_id: uid('obligation-projected'),
      source_mode: 'Projected',
      source_record_id: row.authorized_bonus_id,
      approved_bonus_record_id: null,
      authorized_bonus_id: row.authorized_bonus_id,
      category: row.category,
      budget_line_item: row.budget_line_item,
      oe: row.oe,
      bonus_type: row.bonus_type,
      obligation_date: projectedDate,
      obligation_fy: selectedFy,
      obligation_amount: roundCurrency(row.projected_obligation),
      taker_count: row.final_takers,
      authorized_amount: row.authorized_amount,
      installment_structure: row.installment_structure,
      exception_flag: false,
      match_status: 'Projected',
    }));

  return {
    actualObligations,
    projectedObligations,
    totals: {
      totalActualObligations: roundCurrency(actualObligations.reduce((sum, row) => sum + row.obligation_amount, 0)),
      totalProjectedObligations: roundCurrency(projectedObligations.reduce((sum, row) => sum + row.obligation_amount, 0)),
    },
  };
}

/* modules/payout-engine.js */

function resolveInstallmentStructure(record, authorizedIndex, referenceManager) {
  const explicit = record.installment_structure;
  if (explicit && referenceManager.getInstallmentRule(explicit)) return explicit;
  if (record.authorized_bonus_id && authorizedIndex.get(record.authorized_bonus_id)?.installment_structure) {
    return authorizedIndex.get(record.authorized_bonus_id).installment_structure;
  }
  return 'Unknown';
}

function addMonths(dateString, months) {
  const date = parseDate(dateString);
  if (!date) return null;
  const clone = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  return formatDate(clone);
}

/** Builds payout schedules with exact final true-up reconciliation. */
function generateSchedule({ sourceMode, sourceRecordId, category, budgetLineItem, authorizedBonusId, totalAmount, obligationDate, installmentStructure, referenceManager }) {
  const rule = referenceManager.getInstallmentRule(installmentStructure);
  const installmentCount = Number(rule.installment_count || 1);
  const internalAmounts = [];
  let initialAmount = totalAmount;
  if (rule.initial_payment_type === 'percent_of_total') initialAmount = totalAmount * Number(rule.initial_payment_value || 0);
  if (rule.initial_payment_type === 'fixed_amount') initialAmount = Math.min(totalAmount, Number(rule.initial_payment_value || 0));
  internalAmounts.push(initialAmount);

  const remaining = totalAmount - initialAmount;
  const remainingInstallments = installmentCount - 1;
  if (remainingInstallments > 0) {
    const perInstallment = rule.anniversary_amount_method === 'equal_remaining' ? remaining / remainingInstallments : 0;
    for (let index = 0; index < remainingInstallments; index += 1) {
      internalAmounts.push(perInstallment);
    }
  }

  let displayedRunningTotal = 0;
  return internalAmounts.map((amount, index) => {
    const isFinal = index === internalAmounts.length - 1;
    const displayedAmount = isFinal ? roundCurrency(totalAmount - displayedRunningTotal) : roundCurrency(amount);
    displayedRunningTotal = roundCurrency(displayedRunningTotal + displayedAmount);
    const payoutDate = index === 0 ? obligationDate : addMonths(obligationDate, Number(rule.anniversary_interval_months || 12) * index);
    const payoutFy = deriveFiscalYear(payoutDate);
    return {
      installment_record_id: uid('installment'),
      payout_record_id: uid('payout'),
      source_mode: sourceMode,
      source_record_id: sourceRecordId,
      authorized_bonus_id: authorizedBonusId,
      category,
      budget_line_item: budgetLineItem,
      installment_number: index + 1,
      total_installments: installmentCount,
      installment_type: index === 0 ? 'Initial' : 'Anniversary',
      payout_date: payoutDate,
      payout_fy: payoutFy,
      payout_amount: displayedAmount,
      remaining_balance_after_installment: roundCurrency(totalAmount - displayedRunningTotal),
      installment_structure: installmentStructure,
    };
  });
}

function buildPayoutModel({ actualObligations, projectedObligations, authorizedRecords, referenceManager, selectedFy }) {
  const authorizedIndex = new Map(authorizedRecords.map((row) => [row.authorized_bonus_id, row]));
  const actualPayouts = actualObligations.flatMap((obligation) => generateSchedule({
    sourceMode: 'Actual',
    sourceRecordId: obligation.source_record_id,
    category: obligation.category,
    budgetLineItem: obligation.budget_line_item,
    authorizedBonusId: obligation.authorized_bonus_id,
    totalAmount: obligation.obligation_amount,
    obligationDate: obligation.obligation_date,
    installmentStructure: resolveInstallmentStructure(obligation, authorizedIndex, referenceManager),
    referenceManager,
  }));

  const projectedPayouts = projectedObligations.flatMap((obligation) => generateSchedule({
    sourceMode: 'Projected',
    sourceRecordId: obligation.source_record_id,
    category: obligation.category,
    budgetLineItem: obligation.budget_line_item,
    authorizedBonusId: obligation.authorized_bonus_id,
    totalAmount: obligation.obligation_amount,
    obligationDate: obligation.obligation_date,
    installmentStructure: resolveInstallmentStructure(obligation, authorizedIndex, referenceManager),
    referenceManager,
  }));

  const reconciliationExceptions = [...actualObligations, ...projectedObligations].filter((obligation) => {
    const relevant = [...actualPayouts, ...projectedPayouts].filter((payout) => payout.source_record_id === obligation.source_record_id && payout.source_mode === obligation.source_mode);
    const diff = Math.abs(roundCurrency(relevant.reduce((sum, payout) => sum + payout.payout_amount, 0)) - roundCurrency(obligation.obligation_amount));
    return diff > WARNING_THRESHOLDS.payoutReconciliationTolerance;
  });

  const actualSelectedFy = actualPayouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy);
  const projectedSelectedFy = projectedPayouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy);
  const futureLiability = [...actualPayouts, ...projectedPayouts]
    .filter((payout) => selectedFy && payout.payout_fy > selectedFy)
    .reduce((sum, payout) => sum + payout.payout_amount, 0);

  const liabilityByRecord = [...actualObligations, ...projectedObligations].map((obligation) => {
    const payouts = [...actualPayouts, ...projectedPayouts].filter((payout) => payout.source_mode === obligation.source_mode && payout.source_record_id === obligation.source_record_id);
    return {
      source_mode: obligation.source_mode,
      source_record_id: obligation.source_record_id,
      category: obligation.category,
      budget_line_item: obligation.budget_line_item,
      obligation_amount: obligation.obligation_amount,
      payout_count: payouts.length,
      current_fy_payouts: payouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy).reduce((sum, payout) => sum + payout.payout_amount, 0),
      future_liability: payouts.filter((payout) => selectedFy && payout.payout_fy > selectedFy).reduce((sum, payout) => sum + payout.payout_amount, 0),
    };
  });

  return {
    actualPayouts,
    projectedPayouts,
    selectedFyTotals: {
      actualPayouts: roundCurrency(actualSelectedFy.reduce((sum, payout) => sum + payout.payout_amount, 0)),
      projectedPayouts: roundCurrency(projectedSelectedFy.reduce((sum, payout) => sum + payout.payout_amount, 0)),
      futureLiability: roundCurrency(futureLiability),
    },
    reconciliationExceptions,
    liabilityByRecord,
  };
}

/* modules/execution-engine.js */

function buildExecutionModel({ authorizedSummary, approvals, planningModel, obligationModel, payoutModel, budgetRecords, selectedFy }) {
  const approvedRows = approvals.filter((record) => record.status === 'Approved');
  const cancelledRows = approvals.filter((record) => record.status === 'Cancelled');
  const totalRelevantApprovalRows = approvals.length || 1;
  const actualApprovedDollars = approvedRows.reduce((sum, row) => sum + Number(row.approved_amount || 0), 0);
  const actualCancelledDollars = cancelledRows.reduce((sum, row) => sum + Math.max(Number(row.approved_amount || 0), 0), 0);
  const projectedObligations = planningModel.totals.projected_obligations;
  const actualObligations = obligationModel.totals.totalActualObligations;
  const budgetTotal = budgetRecords
    .filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy))
    .reduce((sum, record) => sum + Number(record.budget_amount || 0), 0);

  const kpis = {
    totalAuthorizedDollars: roundCurrency(authorizedSummary.totalAuthorized),
    totalProjectedObligations: roundCurrency(projectedObligations),
    totalActualObligations: roundCurrency(actualObligations),
    totalProjectedPayouts: roundCurrency(payoutModel.selectedFyTotals.projectedPayouts),
    totalActualPayouts: roundCurrency(payoutModel.selectedFyTotals.actualPayouts),
    remainingHeadroom: roundCurrency(budgetTotal - actualObligations),
    approvedTakers: approvedRows.length,
    futureLiability: roundCurrency(payoutModel.selectedFyTotals.futureLiability),
  };

  const variances = {
    takerVariance: approvedRows.length - planningModel.totals.supportable_takers,
    obligationVariance: roundCurrency(actualObligations - projectedObligations),
    payoutVariance: roundCurrency(payoutModel.selectedFyTotals.actualPayouts - payoutModel.selectedFyTotals.projectedPayouts),
    executionRate: safeDivide(actualObligations, authorizedSummary.totalAuthorized),
    cancellationRate: safeDivide(cancelledRows.length, approvedRows.length + cancelledRows.length),
    unmappedRecordRate: safeDivide(approvals.filter((record) => record.exception_flag || !record.is_valid).length, totalRelevantApprovalRows),
  };

  const categoryPlans = groupBy(planningModel.categoryRows, (row) => row.category);
  const categoryActuals = groupBy(approvedRows, (row) => row.category || 'Unmapped');
  const varianceTable = Object.keys({ ...categoryPlans, ...categoryActuals }).map((category) => {
    const planRow = categoryPlans[category]?.[0] || { projected_taker_target: 0, supportable_takers: 0, projected_obligations: 0 };
    const actualRows = categoryActuals[category] || [];
    const actualCategoryObligations = actualRows.reduce((sum, row) => sum + Number(row.approved_amount || 0), 0);
    const actualCategoryPayouts = payoutModel.actualPayouts.filter((row) => row.category === category && (!selectedFy || row.payout_fy === selectedFy)).reduce((sum, row) => sum + row.payout_amount, 0);
    const projectedCategoryPayouts = payoutModel.projectedPayouts.filter((row) => row.category === category && (!selectedFy || row.payout_fy === selectedFy)).reduce((sum, row) => sum + row.payout_amount, 0);
    return {
      category,
      projected_takers: planRow.supportable_takers,
      actual_approved_takers: actualRows.length,
      taker_variance: actualRows.length - planRow.supportable_takers,
      projected_obligations: planRow.projected_obligations,
      actual_obligations: roundCurrency(actualCategoryObligations),
      obligation_variance: roundCurrency(actualCategoryObligations - planRow.projected_obligations),
      projected_payouts: roundCurrency(projectedCategoryPayouts),
      actual_payouts: roundCurrency(actualCategoryPayouts),
      payout_variance: roundCurrency(actualCategoryPayouts - projectedCategoryPayouts),
    };
  });

  const alerts = [];
  if (Math.abs(variances.obligationVariance) > Math.abs(projectedObligations) * WARNING_THRESHOLDS.varianceWarningThresholdPercent) {
    alerts.push('Obligation variance exceeds configured threshold.');
  }
  if (variances.cancellationRate > WARNING_THRESHOLDS.cancellationRateWarningThreshold) {
    alerts.push('Cancellation rate exceeds configured threshold.');
  }
  if (variances.unmappedRecordRate > WARNING_THRESHOLDS.unmappedRecordWarningThreshold) {
    alerts.push('Unmapped / exception rate exceeds configured threshold.');
  }
  if (kpis.remainingHeadroom < -WARNING_THRESHOLDS.budgetOverrunThreshold) {
    alerts.push('Actual obligations exceed budget headroom.');
  }
  const futureLiabilityBase = payoutModel.actualPayouts.concat(payoutModel.projectedPayouts).reduce((sum, row) => sum + row.payout_amount, 0) || 1;
  if ((kpis.futureLiability / futureLiabilityBase) > WARNING_THRESHOLDS.futureLiabilityConcentrationThreshold) {
    alerts.push('Future liability concentration exceeds configured threshold.');
  }

  return {
    kpis,
    variances,
    alerts,
    varianceTable,
    statusCounts: STANDARD_STATUSES.map((status) => ({ status, count: approvals.filter((record) => record.status === status).length })),
  };
}

/* modules/storage-manager.js */

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_KEYS.DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_KEYS.DB_STORE)) {
        db.createObjectStore(STORAGE_KEYS.DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed.'));
  });
}

async function saveAppState(state) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readwrite');
    transaction.objectStore(STORAGE_KEYS.DB_STORE).put(state, STORAGE_KEYS.DB_KEY);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB save failed.'));
  });
}

async function loadAppState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readonly');
    const request = transaction.objectStore(STORAGE_KEYS.DB_STORE).get(STORAGE_KEYS.DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('IndexedDB load failed.'));
  });
}

async function clearAppState() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORAGE_KEYS.DB_STORE, 'readwrite');
    transaction.objectStore(STORAGE_KEYS.DB_STORE).clear();
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB clear failed.'));
  });
}

function saveUiPrefs(prefs) {
  localStorage.setItem(STORAGE_KEYS.UI_PREFS, JSON.stringify(prefs));
}

function loadUiPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UI_PREFS) || '{}');
  } catch {
    return {};
  }
}

function clearUiPrefs() {
  localStorage.removeItem(STORAGE_KEYS.UI_PREFS);
}

/* modules/export-manager.js */

function exportVisibleTable(tableInstance, pageId) {
  if (!tableInstance) return false;
  tableInstance.download('csv', `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-table.csv`);
  return true;
}

function exportCurrentChart(chartInstance, pageId) {
  if (!chartInstance) return false;
  const dataUrl = chartInstance.toBase64Image('image/png', 1);
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-chart.png`;
  anchor.click();
  return true;
}

function exportKpiSummary(kpis, pageId) {
  if (!kpis) return false;
  downloadCsv([{ exported_at: nowIso(), ...kpis }], `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-kpis.csv`);
  return true;
}

function renderKeyValueTable(data = {}) {
  const rows = Object.entries(data);
  if (!rows.length) return '<p>No KPI summary available.</p>';
  return `
    <table>
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>
        ${rows.map(([key, value]) => `<tr><td>${key}</td><td>${value ?? ''}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderRecordTable(rows = []) {
  if (!rows.length) return '<p>No visible table rows were available in the current view.</p>';
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return `
    <table>
      <thead><tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

function exportHtmlSnapshot({ appTitle, pageTitle, pageId, readiness, lastRebuildAt, filters, kpis, tableRows, chartDataUrl }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appTitle} - ${pageTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f3f6fb; color: #18324d; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .hero, .panel { background: #fff; border: 1px solid #d8e1ef; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
    .hero h1 { margin: 0 0 8px; }
    .meta { color: #6d8098; display: flex; gap: 16px; flex-wrap: wrap; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-weight: 700; background: #fff1d6; color: #b9770e; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .metric { background: #fff; border: 1px solid #d8e1ef; border-left: 5px solid #2255aa; border-radius: 14px; padding: 14px; }
    .metric .label { color: #6d8098; font-size: 0.85rem; }
    .metric .value { font-size: 1.3rem; font-weight: 700; margin-top: 8px; word-break: break-word; }
    table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    th, td { border: 1px solid #d8e1ef; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #eef4ff; }
    img { max-width: 100%; border: 1px solid #d8e1ef; border-radius: 12px; background: #fff; }
    code { background: #eef4ff; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>${appTitle}</h1>
      <p>Portable exported snapshot of the current dashboard view.</p>
      <div class="meta">
        <span><strong>Page:</strong> ${pageTitle}</span>
        <span><strong>Exported:</strong> ${nowIso()}</span>
        <span><strong>Latest rebuild:</strong> ${lastRebuildAt || 'N/A'}</span>
        <span class="badge">${readiness || 'Unknown'}</span>
      </div>
    </section>

    <section class="panel">
      <h2>Filters</h2>
      <pre>${JSON.stringify(filters || {}, null, 2)}</pre>
    </section>

    <section class="panel">
      <h2>KPI Summary</h2>
      ${renderKeyValueTable(kpis)}
    </section>

    <section class="panel">
      <h2>Chart Snapshot</h2>
      ${chartDataUrl ? `<img src="${chartDataUrl}" alt="${pageTitle} chart snapshot" />` : '<p>No chart was active in the current view.</p>'}
    </section>

    <section class="panel">
      <h2>Visible Table Rows</h2>
      ${renderRecordTable(tableRows)}
    </section>

    <section class="panel">
      <p>This exported file was generated from <code>${pageId}</code> in Bonus Ecosystem Platform.</p>
    </section>
  </div>
</body>
</html>`;

  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8;' }), 'index.html');
  return true;
}

function exportRows(rows, fileName) {
  if (!rows?.length) return false;
  downloadCsv(rows, fileName);
  return true;
}

function exportText(text, fileName) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8;' }), fileName);
}

/* modules/dashboard-renderer.js */

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

function createDashboardRenderer({ onNavigate, onRebuild, onClearState, onUpload, onLoadSamples, onUpdateReferenceTable, onExportCurrentView }) {
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

/* app-bootstrap */

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
