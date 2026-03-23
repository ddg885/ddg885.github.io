import { SOURCE_TYPES } from './constants.js';

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

export function applyMappings(validatedState, referenceManager) {
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
