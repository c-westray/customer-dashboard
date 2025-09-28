const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

function flattenDistrictDataFlexible(nestedData) {
  const flatRows = [];

  for (const districtEntry of nestedData) {
    const { district, schools, activePurchaseOrders: districtPOs } = districtEntry;
    const districtId = district?.districtId;
    const districtName = district?.districtName;

    const pushRow = (school, po) => {
      flatRows.push({
        districtId,
        districtName,
        schoolId: school?.schoolId || null,
        schoolName: school?.schoolName || null,
        studentcount: school?.studentcount || null,
        teachercount: school?.teachercount || null,
        purchaseOrderNumber: po?.purchaseOrderNumber || null,
        startDate: po?.startDate || null,
        expiryDate: po?.expiryDate || null,
        totalLicenseCount: po?.totalLicenseCount || null,
        licenseConsumeCount: po?.licenseConsumeCount || null,
        productTitles: po?.productTitles?.join(", ") || null,
        rawConsumeUserCount: po?.rawConsumeUserCount ?? null,
        duplicateUserCount: po?.duplicateUserCount ?? null,
        userCounts: po?.userCounts ? JSON.stringify(po.userCounts) : null,
      });
    };

    for (const school of schools) {
      const schoolPOs = school.activePurchaseOrders || [];
      if (schoolPOs.length === 0) {
        pushRow(school, null);
      } else {
        for (const po of schoolPOs) {
          pushRow(school, po);
        }
      }
    }

    if (Array.isArray(districtPOs)) {
      for (const po of districtPOs) {
        pushRow(null, po);
      }
    }
  }

  return flatRows;
}

// === Main ===
(async () => {
  try {
    const fileName = 'LicenseData_2025-9-14_08-50';
    const inputFile = path.join(__dirname, `${fileName}`); 
    const outputFile = path.join(__dirname, `flattened_output_${fileName}.csv`);

    // Read JSON file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Flatten data
    const flattenedData = flattenDistrictDataFlexible(jsonData);

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(flattenedData);

    // Write CSV to file
    fs.writeFileSync(outputFile, csv);

    console.log(`Flattened CSV written to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
