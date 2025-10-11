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
      if (schoolPOs.length === 0) pushRow(school, null);
      else schoolPOs.forEach(po => pushRow(school, po));
    }

    if (Array.isArray(districtPOs)) {
      districtPOs.forEach(po => pushRow(null, po));
    }
  }

  return flatRows;
}

// === Main ===
(async () => {
  try {
    const dataDir = path.join(__dirname, '../data');

    // --- Use the CURRENT JSON file ---
    const currentFile = path.join(dataDir, 'LicenseData_CURRENT.json');
    if (!fs.existsSync(currentFile)) {
      throw new Error('LicenseData_CURRENT.json not found in data directory.');
    }

    const rawData = fs.readFileSync(currentFile, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Flatten data
    const flattenedData = flattenDistrictDataFlexible(jsonData);

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(flattenedData);

    // --- Write CURRENT flattened CSV ---
    const currentCsvFile = path.join(dataDir, 'flattened_CURRENT.csv');
    fs.writeFileSync(currentCsvFile, csv);
    console.log(`Flattened CSV written to ${currentCsvFile}`);

    // --- Optional: Write historical CSV with timestamp ---
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // e.g. 2025-10-11T12-30-00-000Z
    const historicalCsvFile = path.join(dataDir, `flattened_${timestamp}.csv`);
    fs.writeFileSync(historicalCsvFile, csv);
    console.log(`Historical flattened CSV written to ${historicalCsvFile}`);

  } catch (err) {
    console.error('Error:', err);
  }
})();
