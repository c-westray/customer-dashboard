
const dotenv = require('dotenv');

dotenv.config();

const MAGICBOX_API_KEY = dotenv.config.MAGICBOX_API_KEY;
const MAGICBOX_BASE_URL = dotenv.config.MAGICBOX_BASE_URL;

async function main() {
    console.log('Starting main routine');
    const response = await fetchLicenseConsumption();
// Step 1: Fetch all districts, store in array of json objects
// Step 2: For each district (object) in the array, fetch license consumption data
// Step 3: Fetch all schools, store in array of json objects
// Optional Step 3a: Group schools within district using school id, then append school json to district json
// Optional Step 3b: Make a new list of any schools that DON'T have a parent district
// Step 4: For each school (object) in the array, fetch license consumption data
}
    
main();

///////////LICENSE CONSUMPTION DATA///////////
async function fetchLicenseConsumption() {


try{
        const response = await fetch("https://klettlp.com/api/analytic/license-activation-by-district.json?tenantId=804&fromDate=March-01-2025&toDate=March-31-2025",
            
        );
        console.log(response);
} catch (error) {
    console.log("Error fetching license data", error);
};
}




///////////////////////// DISTRICTS //////////////////////////////
//Step 1a fetch all districts
function fetchDistrictList() {
    console.log("Fetching district list...");
}

//Step 2 
function fetchDistrictLicenseConsumption(districtArray) {
    console.log("Fetching District License Consumption for all districts in district array...");
}

///////////////////////// SCHOOLS //////////////////////////////
//Step 3:
function fetchSchoolList() {
    console.log("Fetching school list...");
}

//Step 4 Fetch School license consumption
function fetchSchoolLicenseConsumption(schoolArray) {
    console.log("Fetching School License Consumption for all schools in school array...");
}

///////////////////////// GROUPING SCHOOLS AND DISTRICTS //////////////////////////////
