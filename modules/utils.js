export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function sanitizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/[$,%\s,]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseInteger(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : null;
}

/** Centralized date parsing for all source data. */
export function parseDate(value) {
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
export function deriveFiscalYear(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return null;
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return month >= 9 ? year + 1 : year;
}

export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toISOString().slice(0, 10);
}

export function toCurrency(value) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numeric);
}

export function toPercent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.0%';
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

export function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function safeDivide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

export function chunkArray(items = [], size = 50) {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

export function getNestedValue(object, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
}

export function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function sumBy(items, selector) {
  return items.reduce((sum, item) => sum + Number(selector(item) ?? 0), 0);
}

export function averageBy(items, selector) {
  if (!items.length) return 0;
  return sumBy(items, selector) / items.length;
}

export function uniqueValues(items, selector) {
  return [...new Set(items.map(selector).filter((value) => value !== null && value !== undefined && value !== ''))];
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function hashContent(content = '') {
  let hash = 0;
  const text = String(content);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}

export function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadCsv(rows, fileName) {
  if (!rows.length) return;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => csvEscape(row[column])).join(','));
  });
  downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), fileName);
}

export function resolveColumns(headers = [], logicalFieldConfig = {}) {
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

export function isValidExtension(fileName = '') {
  return /\.(csv|xlsx|xls)$/i.test(fileName);
}

export function coerceBooleanFlag(value) {
  return ['y', 'yes', 'true', '1'].includes(normalizeKey(value));
}

export function optionize(values) {
  return uniqueValues(values, (item) => item).sort((a, b) => String(a).localeCompare(String(b)));
}

export function buildLookupKey(parts = []) {
  return parts.map((part) => normalizeKey(part)).join('|');
}

export function nowIso() {
  return new Date().toISOString();
}
