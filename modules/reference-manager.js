import { DEFAULT_INSTALLMENT_RULES, DEFAULT_REFERENCE_MAPPINGS } from './constants.js';
import { buildLookupKey, deepClone, normalizeKey, sanitizeString } from './utils.js';

export function buildReferenceManager(referenceRecords = [], customInstallmentRules = []) {
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

export function seedDefaultAssumptions(validAuthorizedRows = []) {
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
