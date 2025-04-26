//require('dotenv').config(); import would be changing to ES module approach
const dotenv = require('dotenv');
const { json } = require('express/lib/response');
dotenv.config();
const fs = require('fs');

const MagicBoxApiKey = process.env.MAGICBOX_API_KEY;
const MagicBoxBaseUrl = process.env.MAGICBOX_BASE_URL;

async function saveToFile(data, filename) {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log(`Data successfully saved to ${filename}`);
        }
    });
}


/*
import { createClient } from '@supabase/supabase-js'; //use the js SDK for supabase API, rather than a direct connection via postgress (pg).
//Using the js SDK fto call the Supabase API is easier than creating a direct connection
//b/c authentication and hosting is handled automatically.
//If later I want to build a backend server or app, I could consider switching to directly connecting 
//to the database with PostgresSQL instead.

//@supabase/supabase-js is the official JavaScript package (SDK) for interacting with Supabase.
console.log("Supabase js SDK installed. Using Supabase api.")
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase client created.")

//const supabaseUrl = ""
*/

/*
const url = new URL("/v2.0/getDistricts", baseURL);

const params = new URLSearchParams({
    status: "ALL",
    token: apiKey 
})
    */




async function demoFetchDistrictList() {
    try {
        const response = require('./districtList.json'); // here, require is synchronous and doesn't work with await. If you want asynchronous, use ES modules
        //also, no need to pase the JSON in this case b/c require('/.districtList.json') automatically parses the json for you
        return response;
    } catch(error) {
        console.log("Error fetching district list: ", error);
    };
}

/* KEEP but not needed currently. Calls MB api to fetch the entire schools list. 
async function demoFetchSchoolsList() {
    try{
        const response = require('./schoolList.json'); //no need to parse json b/c already parsed.
        return response;
    } catch(error) {
        console.log("Error fetching school list: ", error);
    };
}
*/


// Invoking will use MB's API. fetchDistrictList();
const fetchDistrictList = async() => {
    try{
        const url = `${MagicBoxBaseUrl}/v2.0/getDistricts?status=ALL&token=${MagicBoxApiKey}`;
        const response = await fetch(url);
        const jsonParsedResponse = await response.json(); // can also combine this
       // console.log(jsonParsedResponse);
       return jsonParsedResponse;

    } catch(error) {
        console.log("Error fetching district list: ", error);
    };
}

//Processes the initial json of the district list into an array of schools
//Then adds schools to district lists
async function processDistrictList() {
    const districtListObject = await demoFetchDistrictList(); // returns total count and data. We only need the data
    if (!districtListObject) {
        console.log("No district List Object retrieved, returning");
        return;
    }
    //console.log("Total district count: ", districtListObject.X_Total_Count);
    //console.log("District list: ", districtListObject.data);
    const districtListArray = districtListObject.data;
    return districtListArray;
}


async function main() {
    //await FetchDistrictList(); UNCOMMENT FOR REAL CODE
    await demoFetchDistrictList();
    const districtListArray = await processDistrictList(); //const is block-scoped, so it's ok to use this same name in main() as in processDistrictList
   
    // await appendSchoolsToEachDistrict(districtListArray); // Appends schools to each district, then saves to a file called transformedDistricts.json.     //Overwrites the existing transformedDistricts.json file.
    await demoAppendSchoolsToEachDistrict(districtListArray);

    //upload the new district list with the schools added (still need to change the districtId in each school to not say 0...)
    //const transformedDistrictList = require('./transformedDistricts.json');

    const transformedDistrictList = JSON.parse(fs.readFileSync('./transformedDistricts.json', 'utf-8'));
    /*
    const districtId = transformedDistrictList[0].districtId;
    console.log(`your chosen district is: ${transformedDistrictList[0].districtName}, with ID ${districtId}`);
    const districtHealth = await fetchDistrictHealth(districtId);
    console.log("District health for your district is: ", districtHealth);
    */

   // await appendHealthMetricsToEachDistrict(transformedDistrictList);

    /*
   const portland = await fetchPoListforSchool(76015);
   console.log(portland);

   const licenseData = await fetchPoConsumeData('ShawneeMission_SO-49069_SpanishReaders');
   console.log(licenseData);
   */

   // Fetch all PO consumption data
   const allData = await fetchPoListforAllSchools(transformedDistrictList);

   // Now you can work with allData (which contains the full PO consumption data)
   //console.log(allData);

   // Optionally write the data to a file
   //saveToFile(allData, 'Backup_poConsumptionData.json')

}
 
main();




async function fetchDistrictHealth(districtId) {

    //get /school/v1/account/health
    //https://api.getmagicbox.com:443/services//school/v1/account/health?accountId=69729&token=826aba1a4c9e11e98d210a2dfa68e30a
   const url = `${MagicBoxBaseUrl}/school/v1/account/health?accountId=69729&token=${MagicBoxApiKey}`;

   try{
        console.log("Fetching District Health data...")
        const response = await fetch(url);
        const jsonParsedResponse = await response.json();
        return jsonParsedResponse;
    } catch (error) {
        console.log("Error when fetching district health data", error);
    };
 };


 async function appendHealthMetricsToEachDistrict(districtListArray) {
    try{

        if (!Array.isArray(districtListArray) || districtListArray.length === 0) {
            throw new Error("Invalid or empty district list provided.");
        }
        //.map is a better choice than .forEach here, because you're trying to actually transform and return a new array.
        //.map returns a copy of the array or transformed array, whereas .forEach doesn't inherently return anything
        //(making .forEach better for side effects, having side effects on other variables, logging things, etc.)
    
        //Since the interior function fetchSchoolsInDistrict(district.districtId) is an async function that returns a 
        //promise, using that with .map will return an array of promises. You then need to wait for all those promises
        //to resolve. Basically I have to wrap this in Promise.all

        const districtHealthArray = await Promise.all(districtListArray.map(async (district) => {
            const health = await fetchDistrictHealth(district.districtId);
            return {...district, health} //even though .map normally returns an array, we want to make sure it returns the original object literal ...district, plus these new schools
    }));

        //console.log(transformedDistrictListArray);
        await saveToFile(districtHealthArray, 'districtHealth.json');
        console.log("District health for each district fetched successfully. Data saved to file districtHealth.json.")
    } catch(error) {
        console.log("Error fetching health for each district: ", error);
    };
}





async function fetchPoListforSchool(schoolId) {
const url = `${MagicBoxBaseUrl}/license/v1.0/poListBySchoolId/${schoolId}?&token=${MagicBoxApiKey}`

try{
    console.log(`Fetching po list for school with ID ${schoolId}...`)
     const response = await fetch(url);
     const jsonParsedResponse = await response.json();
     return jsonParsedResponse;
 } catch (error) {
     console.log("Error when fetching school Po data", error);
 };
};

async function fetchPoConsumeData(poNumber) {
    //https://api.getmagicbox.com:443/services//license/v1.0/consumedata/ShawneeMission_SO-49069_SpanishReaders?token=826aba1a4c9e11e98d210a2dfa68e30a

    const url = `${MagicBoxBaseUrl}/license/v1.0/consumedata/${poNumber}?token=${MagicBoxApiKey}`;
    
    try{
        console.log(`Fetching Consume data for Po: ${poNumber}...`)
         const response = await fetch(url);
         const jsonParsedResponse = await response.json();
         return jsonParsedResponse;
     } catch (error) {
         console.log("Error when fetching school Po data", error);
     };
    };
    


    async function fetchPoListforAllSchools(districtArray) {
        let allPoConsumptionData = [];
    
        // Process each district and its schools
        for (const district of districtArray) {
            if (district.schools && district.schools.data) {
                // Loop through the schools in the district
                for (const school of district.schools.data) {
                    try {
                        console.log(`Fetching PO list for school with ID ${school.schoolId}...`);
                        const schoolPO = await fetchPoListforSchool(school.schoolId);
    
                        // Log the response to inspect its structure
                        console.log('Response from fetchPoListforSchool:', schoolPO);
    
                        // Check if the data property exists and is an object
                        if (schoolPO && schoolPO.data) {
                            const PO = schoolPO.data; // Access the purchase order data
    
                            // Fetch PO consumption data based on purchaseOrderNumber
                            console.log(`Fetching Consume data for Po: ${PO.purchaseOrderNumber}...`);
                            const poConsumptionData = await fetchPoConsumeData(PO.purchaseOrderNumber);
    
                            // Check if consumeUsers exists and has data
                            const consumeUsers = poConsumptionData && poConsumptionData.data && poConsumptionData.data.consumeUsers;
                            if (consumeUsers && consumeUsers.length > 0) {
                                // Append PO consumption data to the allPoConsumptionData array, including school and district details
                                allPoConsumptionData.push({
                                    districtName: district.districtName,
                                    districtId: district.districtId,
                                    schoolName: school.schoolName,
                                    schoolId: school.schoolId,
                                    poData: poConsumptionData.data
                                });
                            } else {
                                console.log("No consume users data found for PO:", PO.purchaseOrderNumber);
                            }
                        } else {
                            console.log("No purchase order data found for school:", school.schoolId);
                        }
                    } catch (error) {
                        console.log("Error processing data for school:", school.schoolId, error);
                    }
                }
            } else {
                console.log("No iterable data found for district:", district.districtName);
            }
        }
    
          // Writing the accumulated data to a JSON file
          try {
            fs.writeFileSync('poConsumptionData.json', JSON.stringify(allPoConsumptionData, null, 2));
            console.log('Data successfully saved to poConsumptionData.json');
        } catch (error) {
            console.error('Error saving data to file:', error);
        }
    
        // Return the accumulated data
        return allPoConsumptionData;
    }



    
        
        /*
        try{
            //.map is a better choice than .forEach here, because you're trying to actually transform and return a new array.
            //.map returns a copy of the array or transformed array, whereas .forEach doesn't inherently return anything
            //(making .forEach better for side effects, having side effects on other variables, logging things, etc.)
        
            //Since the interior function fetchSchoolsInDistrict(district.districtId) is an async function that returns a 
            //promise, using that with .map will return an array of promises. You then need to wait for all those promises
            //to resolve. Basically I have to wrap this in Promise.all

            districtListArray.forEach((district) => {
                district.data.forEach((school) => {
                    const schoolPOs = fetchPoListforSchool(school.schoolId);
                    schoolPOs.forEach((PO) => {
                        const pOConsumption = fetchPoConsumeData(PO.data.purchaseOrderNumber);
                    })
                });
            });
            */


            









async function demoAppendSchoolsToEachDistrict(districtListArray) {
    console.log("Schools appended to district list successfully. Data saved to file transformedDistricts.json")
}

//Calls the MB API and fetches schools to append to each district, then saves it to a file.
async function appendSchoolsToEachDistrict(districtListArray) {

    try{
        //.map is a better choice than .forEach here, because you're trying to actually transform and return a new array.
        //.map returns a copy of the array or transformed array, whereas .forEach doesn't inherently return anything
        //(making .forEach better for side effects, having side effects on other variables, logging things, etc.)
    
        //Since the interior function fetchSchoolsInDistrict(district.districtId) is an async function that returns a 
        //promise, using that with .map will return an array of promises. You then need to wait for all those promises
        //to resolve. Basically I have to wrap this in Promise.all

        const transformedDistrictListArray = await Promise.all(districtListArray.map(async (district) => {
            const schools = await fetchSchoolsInDistrict(district.districtId);
            return {...district, schools} //even though .map normally returns an array, we want to make sure it returns the original object literal ...district, plus these new schools
    }));

        //console.log(transformedDistrictListArray);
        await saveToFile(transformedDistrictListArray, 'transformedDistricts.json');
        console.log("Schools appended to district list successfully. Data saved to file transformedDistricts.json")
    } catch(error) {
        console.log("Error appending schools to each district: ", error);
    };
}








async function fetchSchoolsInDistrict(districtId) {
    const url = `${MagicBoxBaseUrl}/districts/v1.0/${districtId}/schools?token=${MagicBoxApiKey}`;

    try{
        console.log("Fetching list of Schools for each district...")
        const response = await fetch(url);
        const jsonParsedResponse = await response.json();
        console.log(`Fetching school list for district ${districtId}: "`, jsonParsedResponse);
        return jsonParsedResponse;
    } catch (error) {
        console.log("Error when fetching school list", error);
    };
};


/*
//invoking will send to MB's API:
//use let because i is block-scoped. i < schoolList.length because i is zero-based. Therefore it starts at 0. If it started at 1, it would be i <= schoolList.length
for (let i = 0; i < districtList.length; i++ ) {
    fetchSchoolsInDistrict(districtID);
}
    */




/*
districtListArray.forEach(  (value) => {
    schoolList.push(value);
});
console.log(schoolList);
//got it, so .forEach takes a function as an argument. And the .forEach meathod then performs that function on each value of the array 

/*
const getSchoolsInDistrict = async () => {
    
}
*/
/*
array.forEach( (value, index, array) => {
    console.log(value);
});
*/
//Value is the value at each position
//Index is the current index
//Array is the entire original array

/*
value: Always needed for operations with the element itself.
index: Useful when you need to know the position of an element in the array (e.g., for conditional logic).
array: Rarely used, but it can be helpful when you need to reference the original array during the iteration.
*/