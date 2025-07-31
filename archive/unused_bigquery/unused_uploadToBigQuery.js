const { BigQuery } = require('@google-cloud/bigquery'); // import BigQuery class
const fs = require('fs');

const projectId = 'klett-cx-analytics';
const datasetId = 'license_data';
const tableId = 'kwlhub_purchaseorder_data';
const jsonFilePath = './ExampleData/PurchaseOrderData/LicenseData2025-7-24_09-53';

// Flatten function for  nested JSON structure
function flattenData(data) {
  const flattenedRows = [];

  data.forEach(({ district, schools, activePurchaseOrders }) => {
    if (!Array.isArray(schools)) return; // skip if schools is not an array
    schools.forEach((school) => {
      if (!Array.isArray(activePurchaseOrders)) return; // skip if activePurchaseOrders not an array
      activePurchaseOrders.forEach((po) => {
        const productTitlesStr = Array.isArray(po.productTitles) ? po.productTitles.join('; ') : '';

        flattenedRows.push({
          districtId: district.districtId,
          districtName: district.districtName,
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          purchaseOrderNumber: po.purchaseOrderNumber,
          startDate: po.startDate,
          expiryDate: po.expiryDate,
          totalLicenseCount: po.totalLicenseCount,
          licenseConsumeCount: po.licenseConsumeCount,
          productTitles: productTitlesStr,
        });
      });
    });
  });

  return flattenedRows;
}


async function uploadJSONToBigQuery() {
  const bigquery = new BigQuery({ projectId });

  // Read file and parse JSON
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  // Flatten the nested JSON before upload
  const flatData = flattenData(jsonData);

  try {
    const [firstElementofResponse] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert(flatData);

    console.log('response received: ', firstElementofResponse);

  } catch (error) {
    if (error.name === 'PartialFailureError') {
      console.error('Partial error: ', error.errors);
      error.errors.forEach((e, i) => {
        console.error(`Error in row ${i}:`, e.errors);
        console.error('Row data:', e.row);
      });
    } else {
      console.error('Upload failed: ', error);
    }
  }
}

// Run the upload function
uploadJSONToBigQuery();
