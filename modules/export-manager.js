import { TABLE_EXPORT_FILENAME_PREFIX } from './constants.js';
import { downloadBlob, downloadCsv, nowIso } from './utils.js';

export function exportVisibleTable(tableInstance, pageId) {
  if (!tableInstance) return false;
  tableInstance.download('csv', `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-table.csv`);
  return true;
}

export function exportCurrentChart(chartInstance, pageId) {
  if (!chartInstance) return false;
  const dataUrl = chartInstance.toBase64Image('image/png', 1);
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-chart.png`;
  anchor.click();
  return true;
}

export function exportKpiSummary(kpis, pageId) {
  if (!kpis) return false;
  downloadCsv([{ exported_at: nowIso(), ...kpis }], `${TABLE_EXPORT_FILENAME_PREFIX}-${pageId}-kpis.csv`);
  return true;
}

export function exportRows(rows, fileName) {
  if (!rows?.length) return false;
  downloadCsv(rows, fileName);
  return true;
}

export function exportText(text, fileName) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8;' }), fileName);
}
