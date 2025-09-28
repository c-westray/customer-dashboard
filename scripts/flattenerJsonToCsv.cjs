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
    const dataDir = path.join(__dirname, '../data');

    // --- Find the latest LicenseData JSON file ---
    const files = fs.readdirSync(dataDir)
      .filter(f => f.startsWith('LicenseData_') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(dataDir, f)).mtime.getTime()
      }))
      .sort((a, b) => a.time - b.time)  // chronological
      .map(f => f.name);

    if (files.length === 0) {
      throw new Error('No LicenseData JSON files found in data directory.');
    }

    const latestFile = files[files.length - 1];
    console.log(`Latest file detected: ${latestFile}`);

    const inputFile = path.join(dataDir, latestFile);
    const outputFile = path.join(dataDir, `flattened_output_${latestFile.replace('.json', '.csv')}`);

    // Read JSON
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Flatten data
    const flattenedData = flattenDistrictDataFlexible(jsonData);

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(flattenedData);

    // Write CSV
    fs.writeFileSync(outputFile, csv);

    console.log(`Flattened CSV written to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err);
  }
})();
