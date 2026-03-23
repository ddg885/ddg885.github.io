import { BUNDLED_SAMPLE_FILES, SAMPLE_FILE_CONTENTS, SOURCE_TYPES } from './constants.js';
import { hashContent, isValidExtension, nowIso, uid } from './utils.js';

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

export async function parseContentByExtension({ fileName, content }) {
  if (/\.csv$/i.test(fileName)) {
    return parseCsv(content);
  }
  if (/\.(xlsx|xls)$/i.test(fileName)) {
    return parseWorkbook(content, fileName);
  }
  throw new Error(`Unsupported file type for ${fileName}`);
}

export async function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error(`Unable to read ${file.name}`));
    if (/\.csv$/i.test(file.name)) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  });
}

export async function createSourceFileRecord({ fileName, sourceType, content, origin = 'uploaded' }) {
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

export async function loadBundledSampleSourceFiles() {
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

export function detectDuplicateUpload(existingFiles, candidateFile) {
  const match = existingFiles.find(
    (file) => file.file_name === candidateFile.file_name && (file.row_count === candidateFile.row_count || file.file_hash === candidateFile.file_hash),
  );
  return match || null;
}

export function getRequiredSourceTypes() {
  return [SOURCE_TYPES.AUTHORIZED, SOURCE_TYPES.APPROVAL, SOURCE_TYPES.BUDGET, SOURCE_TYPES.REFERENCE];
}
