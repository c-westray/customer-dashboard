function flattenData(data) {
  const flattenedRows = [];

  data.forEach(({ district, schools, activePurchaseOrders }) => {
    // For each school and each purchase order, create a flat row
    schools.forEach((school) => {
      activePurchaseOrders.forEach((po) => {
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
          productTitles: po.productTitles.join('; '),  // join array as string with semicolon separator
          rawConsumeUserCount: po.rawConsumeUserCount,
          duplicateUserCount: po.duplicateUserCount,
        });
      });
    });

    // If you want to handle cases where schools or activePurchaseOrders might be empty, you can add checks here
  });

  return flattenedRows;
}
