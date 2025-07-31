const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync'); // npm install csv-parse

const projectId = 'klett-cx-analytics';
const datasetId = 'kwlhub_logins_all';
const sourceFolder = '/Users/cellawestray/Desktop/cx-analytics/logins-assignments-data/logins-csv-exports'; // folder with CSV or JSON files
const uploadMode = 'singleTable'; // 'singleTable' or 'multipleTables'
const singleTableId = 'combined_table'; // only used if uploadMode = 'singleTable'

const bigquery = new BigQuery({ projectId });

// Helper: Read and parse JSON or CSV file
function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');

  if (ext === '.json') {
    return JSON.parse(content);
  } else if (ext === '.csv') {
    return csvParse(content, {
      columns: true,
      skip_empty_lines: true,
    });
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

// Clean and convert date strings to ISO8601 timestamp strings for BigQuery
function cleanDateString(dateStr) {
  if (!dateStr) return null;
  try {
    const dt = new Date(dateStr);
    if (isNaN(dt)) return null;
    return dt.toISOString(); // BigQuery TIMESTAMP compatible
  } catch {
    return null;
  }
}

// Generate BigQuery schema from a sample row, force 'created_date' as TIMESTAMP
function generateSchema(sampleRow) {
  const schema = [];
  for (const [key, value] of Object.entries(sampleRow)) {
    let type = 'STRING'; // default
    if (key === 'created_date') {
      type = 'TIMESTAMP';  // force this column to TIMESTAMP
    } else if (typeof value === 'number') {
      type = Number.isInteger(value) ? 'INT64' : 'FLOAT64';
    } else if (typeof value === 'boolean') {
      type = 'BOOL';
    }
    schema.push({ name: key, type, mode: 'NULLABLE' });
  }
  return schema;
}

// Upload data array to BigQuery table (replace table if exists)
async function uploadToBigQuery(tableId, rows) {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);

  try {
    console.log(`Uploading ${rows.length} rows to table ${tableId}...`);
    await table.delete().catch(() => {}); // ignore if table does not exist
    await table.create({ schema: generateSchema(rows[0]) });
    await table.insert(rows);
    console.log(`Upload to ${tableId} completed.`);
  } catch (error) {
    console.error(`Error uploading to ${tableId}:`, error);
  }
}

async function main() {
  const files = fs.readdirSync(sourceFolder);
  const allData = [];

  for (const file of files) {
    const fullPath = path.join(sourceFolder, file);
    if (!fs.statSync(fullPath).isFile()) continue;

    try {
      const data = parseFile(fullPath);

      if (!Array.isArray(data)) {
        console.warn(`Skipping file ${file}: data is not an array`);
        continue;
      }

      // Clean date fields for every row
      data.forEach(row => {
        if ('created_date' in row) {
          row.created_date = cleanDateString(row.created_date);
        }
      });

      if (uploadMode === 'multipleTables') {
        // Table name safe from filename
        const tableName = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9_]/g, '_');
        await uploadToBigQuery(tableName, data);
      } else {
        allData.push(...data);
      }
    } catch (err) {
      console.error(`Failed to parse file ${file}:`, err.message);
    }
  }

  if (uploadMode === 'singleTable' && allData.length > 0) {
    await uploadToBigQuery(singleTableId, allData);
  }
}

main().catch(console.error);
