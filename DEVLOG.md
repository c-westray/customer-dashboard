# Apr 26 2025

## File(s) worked on:
### fetch-POs.js
- Reference files needed: 
- fetch-license-consumption-data.js
- districtList.json (acutally probably don't need this, I need Grouped_District_List.json I think)
- Grouped_District_List.json

## Goal and Steps
### Goal
- Validate license data pulled from platform (currently only have data on districts), by pulling a complete list of POs on the platform, then cross-referencing with the PO data pulled from Netsuite

### Needed steps
1. Finish fetch-POs.js script to fetch all POs for each district and school and save to json and .csv.
2. Open .csv in google sheets file and write regex lookup formula to find PO in netsuite data export spreadsheet. (May want to first validate using KN / netsuite customer ID for that school/district)



