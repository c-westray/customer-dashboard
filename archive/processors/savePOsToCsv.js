const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { exec } = require('child_process'); // <- Add this to run a system command

// Read your big JSON file
const jsonData = fs.readFileSync('/Users/cellawestray/Desktop/customer-dashboard-git/backend/fetchers/FINALLY_ALL DISTRICTS poEnrichedDistricts 2025-4-30_07-34', 'utf8');
const districtsArray = JSON.parse(jsonData);

//  Quick debug log + district counter
console.log(`Loaded ${districtsArray.length} districts`);

let districtsWithAtLeastOnePO = 0;

for (const district of districtsArray) {
  const activeCount = district.activePoArray ? district.activePoArray.length : 0;
  const expiredCount = district.expiredPoArray ? district.expiredPoArray.length : 0;
  
  if (activeCount > 0 || expiredCount > 0) {
    districtsWithAtLeastOnePO++;
  }

  console.log(`${district.districtName} (ID: ${district.districtId}) — ActivePOs: ${activeCount} | ExpiredPOs: ${expiredCount}`);
}

console.log('--- End of district summary ---');
console.log(`Districts with at least 1 Active or Expired PO: ${districtsWithAtLeastOnePO}`);


// Output file setup
const today = format(new Date(), 'yyyy-MM-dd');
const outputCSVPath = path.join(__dirname, `All_Districts_PO_Summary_${today}.csv`);

const rows = [];

// Header
rows.push([
  'District Name',
  'District ID',
  'PO Group', // Active or Expired
  'Purchase Order Number',
  'PO Start Date',
  'PO Expiry Date',
  'License Type',
  'Total License Count',
  'Redeemed Count',
  'Product Titles',
  'Number of Users Assigned'
].join(','));

// Helper to process each PO
function processPOArray(poArray, groupLabel, districtData) {
  for (const po of poArray) {
    rows.push([
      `"${districtData.districtName}"`,
      districtData.districtId || '',
      groupLabel,
      `"${po.purchaseOrderNumber || ''}"`,
      po.startDate || '',
      po.expiryDate || '',
      po.licenseType || '',
      po.totalLicenseCount || '',
      po.redeemedCount !== undefined ? po.redeemedCount : '',
      po.productTitles ? `"${po.productTitles.join('; ')}"` : '',
      po.usersCurrentlyAssignedLicense ? po.usersCurrentlyAssignedLicense.length : 0
    ].join(','));
  }
}

// Loop over each district
for (const district of districtsArray) {
  if (district.activePoArray && district.activePoArray.length > 0) {
    processPOArray(district.activePoArray, 'Active PO', district);
  }
  if (district.expiredPoArray && district.expiredPoArray.length > 0) {
    processPOArray(district.expiredPoArray, 'Expired PO', district);
  }
}

// Save final CSV
fs.writeFileSync(outputCSVPath, rows.join('\n'), 'utf8');
console.log(`All districts CSV saved to: ${outputCSVPath}`);

// 🚀 Automatically open the CSV file
exec(`open "${outputCSVPath}"`, (err) => {
  if (err) {
    console.error('Error opening the file automatically:', err);
  } else {
    console.log('CSV opened successfully!');
  }
});
