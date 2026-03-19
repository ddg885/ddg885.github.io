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

export function exportHtmlSnapshot({ appTitle, pageTitle, pageId, readiness, lastRebuildAt, filters, kpis, tableRows, chartDataUrl }) {
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

export function exportRows(rows, fileName) {
  if (!rows?.length) return false;
  downloadCsv(rows, fileName);
  return true;
}

export function exportText(text, fileName) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8;' }), fileName);
}
