import { MODEL_READINESS, SOURCE_SCHEMAS, SOURCE_TYPES } from './constants.js';
import { coerceBooleanFlag, deriveFiscalYear, formatDate, parseDate, parseInteger, parseNumber, resolveColumns, sanitizeString, uid, buildLookupKey } from './utils.js';

function baseOutput(sourceFile, rowIndex) {
  return {
    source_file_id: sourceFile.source_file_id,
    raw_row_number: rowIndex + 2,
    validation_errors: [],
    validation_warnings: [],
    is_valid: true,
  };
}

function classifyIssue(issueText) {
  return /duplicate/i.test(issueText) || /unmapped/i.test(issueText)
    ? 'Warning'
    : 'Error';
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
      record.validation_warnings.push('Potential duplicate key detected.');
      const existing = seen.get(key);
      if (!existing.validation_warnings.includes('Potential duplicate key detected.')) {
        existing.validation_warnings.push('Potential duplicate key detected.');
      }
      return;
    }
    seen.set(key, record);
  });
}

export function validateAndNormalizeSourceFile(sourceFile) {
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

export function buildValidationSummary(validatedState) {
  const issues = [];
  Object.values(validatedState.datasets).forEach((dataset) => {
    dataset.files.forEach((file) => {
      file.file_errors.forEach((error) => issues.push({ level: 'File', severity: classifyIssue(error), file_name: file.file_name, issue: error, source_type: file.source_type }));
    });
    dataset.records.forEach((record) => {
      record.validation_errors.forEach((error) => issues.push({ level: 'Record', severity: 'Error', source_type: dataset.sourceType, row: record.raw_row_number, issue: error, record_id: Object.values(record).find((value) => typeof value === 'string' && value.includes('-')) }));
      (record.validation_warnings || []).forEach((warning) => issues.push({ level: 'Record', severity: 'Warning', source_type: dataset.sourceType, row: record.raw_row_number, issue: warning, record_id: Object.values(record).find((value) => typeof value === 'string' && value.includes('-')) }));
    });
  });
  return issues;
}

// Added for downstream readiness/reporting use: explicit error_count, warning_count, and exception_table.
export function summarizeValidationIssues(validationIssues = []) {
  return {
    error_count: validationIssues.filter((issue) => issue.severity === 'Error').length,
    warning_count: validationIssues.filter((issue) => issue.severity === 'Warning').length,
    exception_table: validationIssues,
  };
}

export function determineModelReadiness({ datasets, validationIssues, mappingIssues }) {
  const requiredSources = [SOURCE_TYPES.AUTHORIZED, SOURCE_TYPES.BUDGET, SOURCE_TYPES.APPROVAL, SOURCE_TYPES.REFERENCE];
  const missingRequired = requiredSources.filter((sourceType) => !(datasets[sourceType]?.records ?? []).some((record) => record.is_valid));
  if (missingRequired.length) {
    return {
      status: MODEL_READINESS.NOT_READY,
      reasons: [`Missing valid required sources: ${missingRequired.join(', ')}`],
    };
  }

  const criticalValidationFailures = validationIssues.filter((issue) => issue.severity === 'Error');
  if (criticalValidationFailures.length) {
    return {
      status: MODEL_READINESS.NOT_READY,
      reasons: criticalValidationFailures.slice(0, 10).map((issue) => issue.issue),
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

export function createEmptyValidatedState() {
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
