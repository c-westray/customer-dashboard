
const dotenv = require('dotenv');
dotenv.config({path: '/Users/cellawestray/Desktop/customer-dashboard-git/.env'}); // need to specify {path: '' if I'm not always running my script from the parent directory.
const fs = require('fs');
const { json } = require('express/lib/response');
//const { UNABLE_TO_FIND_POSTINSTALL_TRIGGER_JSON_SCHEMA_ERROR } = require('@prisma/client/scripts/postinstall.js');

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

//global variable
const JSESSIONCOOKIE = '30e1201d-ddd8-461c-92f8-94cb0c9f9cff';
console.log(`Working with global variable JSESSIONCOOKIE ${JSESSIONCOOKIE}.`)



//companion processor for PartialGetPoEnrichedDistricts
async function batchProcessor(enrichedDistrictArray) {
    const arrayLength = enrichedDistrictArray.length;
    let batchNumber = 1; // //start at 1 but for batchMinIndex subtrack 1 to make sure the index of my actual for loop starts at 0 (in the other function)
    const numberPerBatch = 10;
   // const maxNumBatches = arrayLength / numberPerBatch;
   const maxNumBatches = 2;

    while (batchNumber <= maxNumBatches) {
    const result = await batchMyBatch(batchNumber, numberPerBatch, enrichedDistrictArray);
            batchNumber++
    };
    //testPartialGetPoEnrichedDistricts(batchNumber)
}


//equivalent of enrich pos
async function batchMyBatch(batchNumber, numberPerBatch, districtArray) {
    try {
        const batchMinIndex = (batchNumber - 1) * numberPerBatch; // subtract 1 since the batch number starts at 1 but the index of my for loop should start at zero.
        const batchMaxIndex = (batchNumber * numberPerBatch) - 1;  // 
        console.log(`Processing batchNumber: ${batchNumber}, indices ${batchMinIndex} through ${batchMaxIndex}`);
        //batch 1: 0 through 9; batch 2: 10 through 19; batch 3: 20 through 29;
        //general formulas: batchMinIndex through batchMaxIndex
        
        //batchNumber --> batchMin Index
        //1 --> 0
        //2 --> 10
        //3 --> 20
        //4 --> 30
        //general formula: batchMinIndex = (batchNumber - 1) * 10;
        //or in other words: batchMinIndex = (batchNumber - 1) * numberPerBatch;
        
        //batchNumber --> batchMax Index
        //1 --> 9
        //2 --> 19
        //3 --> 29
        //4 --> 39
        //general formula: batchMaxIndex = (batchNumber * 10) - 1;
        //or in other words: batchMaxIndex = (batchNumber * numberPerBatch) - 1;

        for (let i = batchMinIndex; i <= batchMaxIndex; i++) {
            console.log(`I\'m batching the batch! Batch number ${batchNumber}, index ${i}`);
            console.log(`I'm also doing other stuff with districtArray.`);
      
            const currentValueOfArray = districtArray[i]?.districtName;
           console.log(`For example, current index ${i} of this array is: ${currentValueOfArray}`);
          //  } else {
            //    continue;
           // };
        };
    } catch(error) {
        console.log(error);
    }
}


//main();
poTestSuite();


async function main() {
    const districtArray = require('/Users/cellawestray/Desktop/customer-dashboard-git/data-examples/Grouped_District_List.json'); // returns array of district objects (each district also has an array data: [] of nested schools)
    //console.log(districtArray.length);

    //Step 1, get POenriched districts array
   // const poEnrichedDistricts = await getPoEnrichedDistricts(); //array of district objects enriched w/all POs in each district
    const poEnrichedDistricts = await testPartialGetPoEnrichedDistricts();  //REPLACE WITH REAL FUNCTION WHEN READY TO DO FOR FULL DISTRICT LIST IN API
    
    //await batchProcessor(poEnrichedDistricts);

    //STEP 1.5, MAKE SURE TO ADD THE EXPIRED POs to this district:
    await addExpiredPOInfo(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.
    const formattedDate = makeFormattedTodayDate();
    saveToFile(poEnrichedDistricts, `After adding expiration ${formattedDate}`); // save file with all districts and nested under each district are POs and schools
/*
    //Step 2, mutate and further enrich with PO assignment and expiration data:
    await addPoAssignmentAndExpiration(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.
    
    
    await addPoContentsAndRedeemedCount(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.
    console.log(poEnrichedDistricts);
    
    //Step 3, save to file
    let formattedDate = makeFormattedTodayDate();
    saveToFile(poEnrichedDistricts, `ALL DISTRICTS poEnrichedDistricts ${formattedDate}`); // save file with all districts and nested under each district are POs and schools
 */
    }
  
//Returns array of districts also containing schools and POs
//TO DO: include EXPIRED POs
//TO DO: write to .csv
    async function getPoEnrichedDistricts() {

    const districtArray = require('/Users/cellawestray/Desktop/customer-dashboard-git/data-examples/Grouped_District_List.json'); // returns array of district objects (each district also has an array data: [] of nested schools)
    // console.log(districtArray);
    const enrichedDistrictArray = []; // actually need to change this to an object b/c I'm going to send this json later to the other api dall to get info about each po name.

    for (const district of districtArray) { 
        //STEP 1 READ IN DISTRICT DATA
        const districtId = district.districtId;
        const districtName = district.districtName;
        console.log(`Working on district: ${districtId} ${districtName}`);

/* SKIP STEP 2 SINCE WE DON'T NEED SCHOOLS RN
        //STEP 2 READ IN SCHOOL DATA AND CREATE SCHOOLARRAY
        //Important--add check if schools.data even exists! this is why it was crashing earlier, b/c it was undefined for some districts
      
        const schoolArray = district.schools.data; //b/c the array is wrapped in one object, so annoying: {[]}

      
        if (district.schools.data) {
            //console.log('There are schools here!')
          //  console.log(schoolArray);
            for (const school of schoolArray) {
                schoolId = school.schoolId;
                schoolName = school.schoolName;
               // const index = schoolArray.indexOf(school); //indexOf is array method
                //console.log(`School #${index + 1}: schoolId = ${schoolId} schoolName = ${schoolName}`);
            };

        } else {
         //   console.log('NO SCHOOLS HERE');
            continue; // skip this district and keep going in the district for-loop.
        };

*/

        ///STEP 3 READ IN DISTRICT PO DATA AND CREATE activePoArray (keep in mind these would still be expected to be district-level POs)
        const objectContainingPoList = await fetchactivePoArray(districtId);
        const rawPoList = objectContainingPoList?.poList;
        
        // Normalize to array: guaranteedArray--
        const activePoArray = Array.isArray(rawPoList) ? rawPoList : rawPoList ? [rawPoList] : [];
        
        const cleanedActivePoArray = [];
        

       //If there is no poList associated with the school, activePoArray with return undefined--so check if it's even there:
       if (activePoArray) {
        //console.log('There are POs here.');
       // console.log(activePoArray);
       for (const po of activePoArray) {
        const purchaseOrderDetails = {
            "purchaseOrderNumber": po.purchaseOrderNumber,
            "purchaseOrderId": po.purchaseOrderId,
            "expiryDate": po.expiryDate, // unfortunately no start date is included with this api call...
            //no need to push id here as we already have the district Id. clean it up.
            //"iD": po.schoolId, //the magicbox api calls this "schoolId" regardless of whether the license is associated with a district or school.
            "licenseType": po.licenseType
           };
        cleanedActivePoArray.push(purchaseOrderDetails);
            };
       } else {
      //  console.log('No POs here');
        continue; //continue to next district in the for loop
       }
    
      // console.log(cleanedActivePoArray);

        const enrichedDistrict = {
            "districtName": districtName,
            "districtId": districtId,
            //If the activePoArray does not exist for the district, activePoArray will be added as an empty array.
            "activePoArray": cleanedActivePoArray, //array of po objects with purchaseOrderNumber, purchaseOrderId, expiryDate, schoolId, and licenseType
         //   "schools": schoolArray COMMENT OUT SINCE NOT USING SCHOOLS CURRENTLY
        };
    
       enrichedDistrictArray.push(enrichedDistrict);
    
    }; // END OF LARGE DISTRICT-LEVEL FOR-LOOP

   // console.log(enrichedDistrictArray);
    return(enrichedDistrictArray);
};


//Test function to not abuse the API. Only gets the first few districts in districtArray instead of the whole array.
async function testPartialGetPoEnrichedDistricts(batchNumber) {

    const districtArray = require('/Users/cellawestray/Desktop/customer-dashboard-git/data-examples/Grouped_District_List.json'); // returns array of district objects (each district also has an array data: [] of nested schools)
    // console.log(districtArray);
    const enrichedDistrictArray = []; // actually need to change this to an object b/c I'm going to send this json later to the other api dall to get info about each po name.

    //for (const district of districtArray) { 
    for (let i = 0; i < 20; i++) {   //test only a few districts

        //STEP 1 READ IN DISTRICT DATA
        const districtId = district.districtId;
        const districtName = district.districtName;
        console.log(`Working on district: ${districtId} ${districtName}`);
        
        
        /* SKIP STEP 2 SINCE WE DON'T NEED SCHOOLS RN
         //STEP 2 READ IN SCHOOL DATA AND CREATE SCHOOLARRAY
        //Important--add check if schools.data even exists! this is why it was crashing earlier, b/c it was undefined for some districts
              
        const schoolArray = district.schools.data; //b/c the array is wrapped in one object, so annoying: {[]}
        
              
        if (district.schools.data) {
        //console.log('There are schools here!')
        //  console.log(schoolArray);
        for (const school of schoolArray) {
        schoolId = school.schoolId;
        schoolName = school.schoolName;
        // const index = schoolArray.indexOf(school); //indexOf is array method
         //console.log(`School #${index + 1}: schoolId = ${schoolId} schoolName = ${schoolName}`);
        };
        
         } else {
        //   console.log('NO SCHOOLS HERE');
        continue; // skip this district and keep going in the district for-loop.
         };
        
        */
        
                ///STEP 3 READ IN DISTRICT PO DATA AND CREATE activePoArray (keep in mind these would still be expected to be district-level POs)
                const objectContainingPoList = await fetchactivePoArray(districtId);
                const rawPoList = objectContainingPoList?.poList;
                
                // Normalize to array: guaranteedArray--
                const activePoArray = Array.isArray(rawPoList) ? rawPoList : rawPoList ? [rawPoList] : [];
                
                const cleanedActivePoArray = [];
                
        
               //If there is no poList associated with the school, activePoArray with return undefined--so check if it's even there:
               if (activePoArray) {
                //console.log('There are POs here.');
               // console.log(activePoArray);
               for (const po of activePoArray) {
                const purchaseOrderDetails = {
                    "purchaseOrderNumber": po.purchaseOrderNumber,
                    "purchaseOrderId": po.purchaseOrderId,
                    "expiryDate": po.expiryDate, // unfortunately no start date is included with this api call...
                    //no need to push id here as we already have the district Id. clean it up.
                    //"iD": po.schoolId, //the magicbox api calls this "schoolId" regardless of whether the license is associated with a district or school.
                    "licenseType": po.licenseType
                   };
                cleanedActivePoArray.push(purchaseOrderDetails);
                    };
               } else {
              //  console.log('No POs here');
                continue; //continue to next district in the for loop
               }
            
              // console.log(cleanedActivePoArray);
        
        
                const enrichedDistrict = {
                    "districtName": districtName,
                    "districtId": districtId,
                    //If the activePoArray does not exist for the district, activePoArray will be added as an empty array.
                    "activePoArray": cleanedActivePoArray, //array of po objects with purchaseOrderNumber, purchaseOrderId, expiryDate, schoolId, and licenseType
                 //   "schools": schoolArray COMMENT OUT SINCE NOT USING SCHOOLS CURRENTLY
                };
            
               enrichedDistrictArray.push(enrichedDistrict);
            
        
            }; // END OF LARGE DISTRICT-LEVEL FOR-LOOP
        
           // console.log(enrichedDistrictArray);
            return(enrichedDistrictArray);
        };
        

//Don't include in main--just used to test Json structure
function testJsonStructure() {
    const districtArray = require('/Users/cellawestray/Desktop/customer-dashboard-git/data-examples/Grouped_District_List.json'); // returns array of district objects (each district also has an array data: [] of nested schools)
    // console.log(districtArray);
 
     const districtOne = districtArray[0];
     const districtId = districtOne.districtId;
     console.log(districtId);
     const schoolArray = districtOne.schools.data; // returns array of schools
    // console.log(schoolsInDistrictOne);
 
     for (school of schoolArray) {
         schoolId = school.schoolId;
         schoolName = school.schoolName;
         const index = schoolArray.indexOf(school); //indexOf is array method
         console.log(`School #${index}: schoolId = ${schoolId} schoolName = ${schoolName}`);
     };
}

//////////////////////////////////////
async function getDistrictLevelPOs(districts) {
//Get POs (only at the district level)
//.forEach does NOT work with asynchronous functions, will not wait properly
//Instead, use for _ of array

}

//////////////////////////////////////
async function getSchoolLevelPOs() {
//Get POs (only at the school level)
}

//////////////////////////////////////

async function fetchactivePoArray(districtOrSchoolId) {
    //get /license/v1.0/poListBySchoolId/{schoolId}
    //Note this also works with a district Id.
    //https://api.getmagicbox.com:443/services//license/v1.0/poListBySchoolId/69729?token=826aba1a4c9e11e98d210a2dfa68e30a
   const url = `${MagicBoxBaseUrl}/license/v1.0/poListBySchoolId/${districtOrSchoolId}?token=${MagicBoxApiKey}`;

   try{
        console.log("Fetching activePoArray (aka poList)...")
        const response = await fetch(url);
        const jsonParsedResponse = await response.json();
     // console.log(jsonParsedResponse);
        return jsonParsedResponse;
    } catch (error) {
        console.log("No POs available, or other error when fetching activePoArray", error);
    };
 };


/*

fetch("https://api.getmagicbox.com/services//license/v1.0/poListBySchoolId/58277?token=826aba1a4c9e11e98d210a2dfa68e30a", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "JSESSIONID=04F7C7E34DE06E23153A649B9AD924FA",
      "Referer": "https://api.getmagicbox.com/apiexplorer/index.jsp",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });

  */


//Would be nice even if more work to also have a counter for how many licenses have been consumed by admin, teacher, and students


//licenseConsumeCount IS HOW MANY ARE CURRENTLY ASSIGNED--POTENTIALLY DIFFERENT FROM "ACTIVATED"
async function getPOUserAssignmentAndExpirationData(purchaseOrderNumber) {
//Uses the magicbox api call: GET /license/v1.0/consumedata/{poNumber}

const urlEncodedPoNumber = encodeURIComponent(purchaseOrderNumber);

const url = `${MagicBoxBaseUrl}/license/v1.0/consumedata/${urlEncodedPoNumber}?token=${MagicBoxApiKey}`;

const response = await fetch(url);

//if the response is not ok, log the error (console.error) and also throw new Error to tell the program to stop 
//everything for this PO conly (the outer function will continue to run b/c of the try/catch blocks)
if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching PO ${purchaseOrderNumber}: ${response.status} - ${errorText}`);
    throw new Error(`Bad PO ${purchaseOrderNumber}: ${response.status}`);
}

const parsedResponse = await response.json();
console.log(parsedResponse);
const data = parsedResponse.data;
//console.log(data);

const cleanedPoData = {
    "purchaseOrderNumber": data?.purchaseOrderNumber,
    "startDate": data?.startDate,
    "expiryDate": data?.expiryDate,
   // schoolOrDistrictAccountId: 72360,
   // accountName: 'Greater Albany Public Schools',
   // accountType: 'DISTRICT',
   // licenseType: 'User',
    "totalLicenseCount": data?.licenseCount,
    "autoAssignPO": false,
    "autoAssignStudentPO": false,
    "licensesCurrentlyAssignedToUsers": data?.licenseConsumeCount, //mb api calls this ConsumeCount but it really refers to the number of licenses currently assigned to users. (not necessarily 'activated' by users)
    "usersCurrentlyAssignedLicense": data?.consumeUsers //array of users
};

//console.log(cleanedPoData);
return cleanedPoData;
}


//Uses MB API call: get /license/v1.0/ind/licensedata/{poNumber}
async function getPoContentsAndRedeemedCount(purchaseOrderNumber) {

const urlEncodedPoNumber = encodeURIComponent(purchaseOrderNumber);
const url = `${MagicBoxBaseUrl}/license/v1.0/ind/licensedata/${urlEncodedPoNumber}?token=${MagicBoxApiKey}`;
const response = await fetch(url) //don't need options b/c default method is get
//console.log(response);

//if the response is not ok, log the error (console.error) and also throw new Error to tell the program to stop 
//everything for this PO conly (the outer function will continue to run b/c of the try/catch blocks)
if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching PO ${purchaseOrderNumber}: ${response.status} - ${errorText}`);
    throw new Error(`Bad PO ${purchaseOrderNumber}: ${response.status}`);
}

const jsonParsedResponse = await response.json();
console.log(jsonParsedResponse);
return jsonParsedResponse;

// SAMPLE RESPONSE 
/*
{
  data: {
    purchaseOrderNumber: 'PO_60427_PD_Neu_2',
    purchaseOrderId: 553758,
    userType: 'SCHOOL',
    accessCodeCount: 0, 
    redeemedCount: 33, //NEEDED
    licenseType: 'User',
    licenseCount: 12562,
    expiryDate: '2025-09-23',
    startDate: '2024-08-20',
    duration: 0,
    trialPO: false, //NEEDED
    poType: 'STANDARD', 
    productTitles: [ 'Portfolio Deutsch Neu, Level 2 - Textbook' ], //NEEDED
    autoAssignPO: false,
    autoAssignStudentPO: false
  },

*/
}

//fullAdminProgram('King School', 60006);

async function fullAdminProgram(districtName, districtId, poId) {



  const districtAdminList = await getDistrictAdminList(districtName);


    //STEP 0 Read in the PO of interest (from main program)
    //We actually need the shorter POID for this
    //const poId = ;

    //STEP 1 Get all school Ids for the district
    const schoolArray = await getAllSchoolsInDistrict(districtId); // returns cleaned array of school objects with just school name and school ID
    console.log(`Cleaned schoolArray for district ${districtId}: \n`, schoolArray);


    //STEP 2 For the given poId, iterate through all schools and use internal admin  function "getAdminIndividualPoDetails" to get Licenses Used per school.
    //This gives how many licenses were Used per school. (Then need to add +1 for the district Admin, and we should arrive at the final Admin Licenses Used).
    for (school of schoolArray) {
      const schoolId = school.schoolId;
      const schoolPoDetails = await getAdminIndividualPoDetails(schoolId, poId);
      //schoolLicensesUsed = schoolPoDetails.
    };
    const districtLicensesUsed = null;


    //const response = await getAdminIndividualPoDetails(encodedSchoolId, encodedPoId);
   // console.log(response);
    

    //Optional STEP 3 while you're at it, get teachers assigned licenses currently 
   // const teacherLicenses = await getAdminPortalTeacherAssignedLicense(schoolId, poId)
 

}

//impersonate all District Admins and check if they have the PO.
//then return the district admin's session ID
async function getDistrictAdminList(districtName) {

  const superpublisherJsessionCookie = JSESSIONCOOKIE;
  const url = 'https://klettlp.com/services/userprofile/searchschooladmin.json';


  const bodyPayload = {
    userSearchSrvArgs:
    {
    userType: 'district_admin',
      firstName:'',
      lastName:'',
      userName: districtName, //it's dumb but you actually pass it here
    schoolDistrictName: '',
    city:'',
    sEcho:1,
    userGuid:'',
    iPageNumber:1,
    maxRecordCount:100,
    rowField: 'FIRST_NAME',
    sortOrder: 'desc',
    iTotalRecords:'',
    iTotalDisplayRecords:'',
    }};

 // use JSON.stringify since double quotes are required
  const response = await fetch(url, {
    "headers": {
      "content-type": "application/json",
      "cookie": `JSESSIONID=${superpublisherJsessionCookie}`
    },
    "body": JSON.stringify(bodyPayload), // the JSON.stringify method converts js objects into strings.
    "method": "POST"
  });

  console.log(response);
  //console.log(jsonParsedResponse);
  const jsonParsedResponse = await response.json();
  console.log(jsonParsedResponse);

  const districtAdminArray = jsonParsedResponse.userSearchServiceResponse.userProfileList;
  console.log(districtAdminArray);
  const adminCount = districtAdminArray.length;
  console.log('Admin Count: ', adminCount);


  cleanedAdminArray = [];

  for (admin of districtAdminArray) {
    console.log
    adminObject = {
      guid: admin?.guid,
      email: admin?.email,
      primaryAdmin: admin?.primaryAdmin, // boolean, true = 1 false = 0
      firstName: admin?.firstName,
      lastName: admin?.lastName
    };
    cleanedAdminArray.push(adminObject);
  };

  console.log(cleanedAdminArray);

  cleanedAdminArray.sort((a, b) => b.primaryAdmin - a.primaryAdmin); //sort descendin aka biggest to smallest, so that primary admin comes first (boolean, 1 is bigger than 0)
  console.log('After sorting: ', cleanedAdminArray);


  //purpose of sorting is b/c the primary admin is more likely to have the PO, so when I loop through to check which admin has the PO,
  // my program will hopefully be faster
  /* example 
  After sorting:  [
  {
    guid: '6bd32787-7921-49d4-ac59-c2197c1aa459',
    email: 'mgrbic@kingschoolct.org',
    primaryAdmin: true,
    firstName: 'Monica',
    lastName: 'Grbic'
  },
  {
    guid: '1b980065-8b22-4581-bca1-bbaaef21c588',
    email: 'kingschool.admin@kingschoolct.org',
    primaryAdmin: false,
    firstName: 'King School Admin',
    lastName: 'Classlink'
  }
]
  */
return cleanedAdminArray;

};

//fullAdminProgram();

//uses API explorer
async function getAllSchoolsInDistrict (districtId) {
  const encodedDistrictId = encodeURIComponent(districtId);
  //https://api.getmagicbox.com:443/services//districts/v1.0/60006/schools?token=826aba1a4c9e11e98d210a2dfa68e30a
  const url = `${MagicBoxBaseUrl}/districts/v1.0/${encodedDistrictId}/schools?token=${MagicBoxApiKey}`;

  const response = await fetch(url);
  const jsonParsedResponse = await response.json();
  const rawSchoolArray = jsonParsedResponse.data;
  //console.log(rawSchoolArray);

  const cleanedSchoolArray = [];
 // console.log('cleanedSchoolArray: ', cleanedSchoolArray);

  for (school of rawSchoolArray) {
    const cleanedSchool = {
      schoolName: school.schoolName,
      schoolId: school.schoolId
    };
    //console.log(cleanedSchool);
    cleanedSchoolArray.push(cleanedSchool);
    //console.log(cleanedSchoolArray);
  };
  // cleanedSchoolArray looks like:
 //  [
//   { schoolName: 'Entir', schoolId: 61205 },
//  { schoolName: 'King School', schoolId: 60927 },
 // { schoolName: 'MS', schoolId: 72262 },
//  { schoolName: 'US', schoolId: 61237 }
 // ]

 // console.log(`Cleaned School Array for district ${districtId}:`, cleanedSchoolArray);
  return cleanedSchoolArray;

  /* Sample response:
  {
  schoolcount: 4,
  districtName: 'King School',
  data: [
    {
      schoolId: 61205,
      creator: 'mgrbic@kingschoolct.org',
      schoolName: 'Entir',
      schoolCode: null,
      status: 'ACT',
      createdOnDate: null,
      address: 'NA',
      province: null,
      city: null,
      zipCode: 'NA',
      country: null,
      districtAdmincount: null,
      schoolAdmincount: null,
      studentcount: 98,
      teachercount: 3,
      type: null,
      schoolDomain: null,
      tagCategory: null,
      districtId: 0,
      otherSystemId: null,
      isStudentBundleRequired: false,
      schooladminlist: [Array],
      districtInfo: null,
      classList: null,
      studentBundleRequired: false
    },
    {
      schoolId: 60927,
      creator: 'mgrbic@kingschoolct.org',
      schoolName: 'King School',
      schoolCode: null,
      status: 'ACT',
      createdOnDate: null,
      address: '1450 Newfield Ave',
      province: 'CT',
      city: 'Stamford',
      zipCode: '06905',
      country: 'United States',
      districtAdmincount: null,
      schoolAdmincount: null,
      studentcount: null,
      teachercount: null,
      type: null,
      schoolDomain: null,
      tagCategory: null,
      districtId: 0,
      otherSystemId: null,
      isStudentBundleRequired: false,
      schooladminlist: [Array],
      districtInfo: null,
      classList: null,
      studentBundleRequired: false
    },
    {
      schoolId: 72262,
      creator: 'mgrbic@kingschoolct.org',
      schoolName: 'MS',
      schoolCode: null,
      status: 'ACT',
      createdOnDate: null,
      address: 'NA',
      province: null,
      city: null,
      zipCode: 'NA',
      country: null,
      districtAdmincount: null,
      schoolAdmincount: null,
      studentcount: 1,
      teachercount: null,
      type: null,
      schoolDomain: null,
      tagCategory: null,
      districtId: 0,
      otherSystemId: null,
      isStudentBundleRequired: false,
      schooladminlist: [],
      districtInfo: null,
      classList: null,
      studentBundleRequired: false
    },
    {
      schoolId: 61237,
      creator: 'mgrbic@kingschoolct.org',
      schoolName: 'US',
      schoolCode: null,
      status: 'ACT',
      createdOnDate: null,
      address: 'NA',
      province: null,
      city: null,
      zipCode: 'NA',
      country: null,
      districtAdmincount: null,
      schoolAdmincount: null,
      studentcount: 96,
      teachercount: 3,
      type: null,
      schoolDomain: null,
      tagCategory: null,
      districtId: 0,
      otherSystemId: null,
      isStudentBundleRequired: false,
      schooladminlist: [],
      districtInfo: null,
      classList: null,
      studentBundleRequired: false
    }
  ],
  response: {
    responseCode: 200,
    message: 'Success.',
    detailexists: null,
    providerusername: null,
    provideruserpassword: null
  },
  count: 4
}
*/
}


//school ID is Entir 61205
//po ID is 560410 (purchaseOrderName is POZQ002481_Reporteros3_all)
//getAdminIndividualPoDetails(61205, 560410);
//fullAdminProgram();
//getAdminIndividualPoDetails();


//This one requires my JSESSION cookie since not on the api
async function getAdminIndividualPoDetails(schoolId = 61205, poId = 560410) {
//mb internal platform call is "getAssignedSubPODetailForSchool"


//cookies shouold always be raw strings, not URI-encoded.

//Note, need to eventually do this for each school in the district
const params = new URLSearchParams({
    schoolId: schoolId,
    poId: poId
});

const url = `https://klettlp.com/services/purchaseorders/getAssignedSubPODetailForSchool.json?schoolId=${schoolId}&poId=${poId}`;


const response = await fetch(url, {
    "headers": {
      "cookie": `JSESSIONID=${JSESSIONCOOKIE}`,
    },
      "body": null,
       "method": "GET"
  });

  const jsonParsedResponse = await response.json();

  console.log(response);
  console.log(jsonParsedResponse);

  //const poResponse = jsonParsedResponse?.poListResponse;
  //console.log(poResponse);

  


/*
  console.log(schoolLicensesUsed);
  return schoolLicensesUsed;
  

/*
Example response:

  poListResponse: {
    code: 200,
    accessCodeVO: {
      code: 0,
      id: 0,
      accessCategoryVO: '',
      accessCodeId: 38458137,
      categoryId: 0,
      duration: 0,
      licenseCount: 35, // could potentially use.... this is the total # currently assigned to this school - can subtract all schools from total, however...this is a subky way to do it since my school list would have to be 100% up to date at all times
      licenseRemaining: 0,
      licenseTypeVO: [Object],
      preferentialUsers: false,
      productId: 0,
      restrictedLogin: 0,
      restrictionLoginConsumed: 0,
      restrictionRemaining: 0,
      schoolId: 0,
      tenantId: 0,
      trialPO: false,
      userGuid: '6f73cfac-415f-441b-a80f-9ad431a513a0' // maybe could use this to impersonate the admin...
    },
    LPD: false,
    LPIPA: false,
    LPULID: false,
    poFlag: false,
    studentCount: 98,
    teacherCount: 3,
    userVOList: {
      belowCoppaAgeGroup: false,
      belowGdprAgeGroup: false,
      checked: false,
      classId: 0,
      doubleBlindReviewer: false,
      firstName: 'King School',
      guid: '6f73cfac-415f-441b-a80f-9ad431a513a0',
      id: 0,
      lastName: 'Admin',
      migrationFlag: false,
      otherSystemMaster: 'PLACE_HOLDER',
      primaryAdminUserVO: true,
      school: 0,
      schoolId: 0,
      tenant: 0,
      userName: 'admin@kingschoolct.org'
    },
    iTotalDisplayRecords: 0,
    iTotalRecords: 0,
    sEcho: 0
  }
}


*/

}








//THIS WOULD ACTUALLY BE USEFUL NOW FOR WHAT ANEESH NEEDS--PER-CLASS ASSIGNMENT BREAKDOWN. HOWEVER NEED TO DEVELOP THIS
async function getAdminPortalTeacherAssignedLicense(schoolId, poId) {

    const params = new URLSearchParams({
        schoolId: schoolId,
        poId: poId
    });

    const url = `https://klettlp.com/services/userprofile/getteacherlistassignlicense.json?sEcho=1&iColumns=6&sColumns=%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=10&mDataProp_0=0&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=false&mDataProp_1=1&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=true&mDataProp_2=2&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=true&mDataProp_3=3&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=true&mDataProp_4=4&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=false&mDataProp_5=5&sSearch_5=&bRegex_5=false&bSearchable_5=true&bSortable_5=false&sSearch=&bRegex=false&iSortingCols=0&pageNumber=1&maxRecordCount=10&rowField=&sortOrder=&searchText=&schoolId=${encodedSchoolId}&poId=${encodedPoId}`;


   const response = await fetch(url, {
  "headers": {
    "accept": "*/*",
    "accept-language": "en,de;q=0.9,de-DE;q=0.8",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "cookie": "_ga=GA1.1.1743205477.1744403623; ab.storage.deviceId.f9c2b69f-2136-44e0-a55a-dff72d99aa19=g%3AdzvDw8gNOBfskoMEiMErYTbKDLl2%7Ce%3Aundefined%7Cc%3A1744436066502%7Cl%3A1744436066502; ab.storage.sessionId.f9c2b69f-2136-44e0-a55a-dff72d99aa19=g%3A840ed23c-5f59-036d-80de-54b79664b093%7Ce%3A1744437866533%7Cc%3A1744436066529%7Cl%3A1744436066533; SESSIONID=73BF3BAD69A86A77BBD68D8A1B9A65FD; JSESSIONID=e30ad909-c4ff-4912-b37a-d3541d5b9860; jwt_token=Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJraW5nc2Nob29sLmFkbWluQGtpbmdzY2hvb2xjdC5vcmciLCJ1c2VyTmFtZSI6ImtpbmdzY2hvb2wuYWRtaW5Aa2luZ3NjaG9vbGN0Lm9yZyIsInVzZXJSb2xlIjoiRElTVFJJQ1RfQURNSU4iLCJ1c2VyR3VpZCI6IjFiOTgwMDY1LThiMjItNDU4MS1iY2ExLWJiYWFlZjIxYzU4OCIsInRlbmFudElkIjo4MDQsInRlbmFudE5hbWUiOiJrbGV0dGxwIiwiZmlyc3ROYW1lIjoiS2luZyBTY2hvb2wgQWRtaW4iLCJsYXN0TmFtZSI6IkNsYXNzbGluayIsImRvbWFpbiI6ImtsZXR0bHAuY29tIn0.ACqBoVblnlmtRHuksye62_tkSS4mvDgacQ7kbfqDR0hACFOXVpj5FvSXR54bpebNVm3TbqT1EE1cvL3yBKMBIOPjj5UyBT6AHB_QW0DpIRcxWPukoUrZmFtu9Ib_Y7-z19HrkauPCk3vhb9X0bRdftjwhaBy6eZYsM1Mtl0tNGk; CloudFront-Key=e30ad909-c4ff-4912-b37a-d3541d5b9860; CloudFront-Policy=e30ad909-c4ff-4912-b37a-d3541d5b9860; CloudFront-Signature=e30ad909-c4ff-4912-b37a-d3541d5b9860; Cloudfront-domain=https://klettlp-mbx-cloud.klettlp.com/content/secure/804/0/; CloudFront-Key-Pair-Id=e30ad909-c4ff-4912-b37a-d3541d5b9860; pdftronAppUrl=https://klettlp-mbx-cloud.klettlp.com/static/pdftron/26/index.html; pdftronWebLicense=; Cloudfront-parent-domain=klettlp.com; _ga_E6TQHW6LEH=GS1.1.1746146817.11.1.1746148094.0.0.0",
    "Referer": "https://klettlp.com/school/teacher/assignaccesscode.htm?selectedaccesscode=DRZN-XCFY-WHB7-YPM8&type=User&poId=560410",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
});

}






//THIS FUNCTION IS LIKELY NOT THE EFFICIENT WAY TO DO IT, AS THIS REQUIRES YOU TO IMPERSONATE THE ADMIN. INSTEAD USE DIRECT PO ACCESS ABOVE.
//MAY HAVE TO ADJUST NUMBER ON THE PAGE FOR LARGE DISTRICTS!!!!
//getAllAdminPortalLicenses();
async function getAllAdminPortalLicenses(schoolDistrictId) {
    
/*
const params = new URLSearchParams({
    schoolDistrictID: schoolDistrictId,
});
*/


const url = 'https://klettlp.com/services/licensing/accesscode/getLicenses.json?sEcho=1&iColumns=9&sColumns=%2C%2C%2C%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=10&mDataProp_0=0&bSortable_0=true&mDataProp_1=1&bSortable_1=true&mDataProp_2=2&bSortable_2=true&mDataProp_3=3&bSortable_3=true&mDataProp_4=4&bSortable_4=true&mDataProp_5=5&bSortable_5=true&mDataProp_6=6&bSortable_6=false&mDataProp_7=7&bSortable_7=false&mDataProp_8=8&bSortable_8=false&iSortCol_0=0&sSortDir_0=desc&iSortingCols=1&pageNumber=1&maxRecordCount=10&rowField=PO_NUMBER&sortOrder=desc&searchAccessCode=';

    const response = await fetch(url, {
        "headers": {
          "accept": "*/*",
          "accept-language": "en,de;q=0.9,de-DE;q=0.8",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": "\"Android\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          "cookie": "_ga=GA1.1.1743205477.1744403623; ab.storage.deviceId.f9c2b69f-2136-44e0-a55a-dff72d99aa19=g%3AdzvDw8gNOBfskoMEiMErYTbKDLl2%7Ce%3Aundefined%7Cc%3A1744436066502%7Cl%3A1744436066502; ab.storage.sessionId.f9c2b69f-2136-44e0-a55a-dff72d99aa19=g%3A840ed23c-5f59-036d-80de-54b79664b093%7Ce%3A1744437866533%7Cc%3A1744436066529%7Cl%3A1744436066533; SESSIONID=73BF3BAD69A86A77BBD68D8A1B9A65FD; JSESSIONID=e30ad909-c4ff-4912-b37a-d3541d5b9860; jwt_token=Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJraW5nc2Nob29sLmFkbWluQGtpbmdzY2hvb2xjdC5vcmciLCJ1c2VyTmFtZSI6ImtpbmdzY2hvb2wuYWRtaW5Aa2luZ3NjaG9vbGN0Lm9yZyIsInVzZXJSb2xlIjoiRElTVFJJQ1RfQURNSU4iLCJ1c2VyR3VpZCI6IjFiOTgwMDY1LThiMjItNDU4MS1iY2ExLWJiYWFlZjIxYzU4OCIsInRlbmFudElkIjo4MDQsInRlbmFudE5hbWUiOiJrbGV0dGxwIiwiZmlyc3ROYW1lIjoiS2luZyBTY2hvb2wgQWRtaW4iLCJsYXN0TmFtZSI6IkNsYXNzbGluayIsImRvbWFpbiI6ImtsZXR0bHAuY29tIn0.ACqBoVblnlmtRHuksye62_tkSS4mvDgacQ7kbfqDR0hACFOXVpj5FvSXR54bpebNVm3TbqT1EE1cvL3yBKMBIOPjj5UyBT6AHB_QW0DpIRcxWPukoUrZmFtu9Ib_Y7-z19HrkauPCk3vhb9X0bRdftjwhaBy6eZYsM1Mtl0tNGk; CloudFront-Key=e30ad909-c4ff-4912-b37a-d3541d5b9860; CloudFront-Policy=e30ad909-c4ff-4912-b37a-d3541d5b9860; CloudFront-Signature=e30ad909-c4ff-4912-b37a-d3541d5b9860; Cloudfront-domain=https://klettlp-mbx-cloud.klettlp.com/content/secure/804/0/; CloudFront-Key-Pair-Id=e30ad909-c4ff-4912-b37a-d3541d5b9860; pdftronAppUrl=https://klettlp-mbx-cloud.klettlp.com/static/pdftron/26/index.html; pdftronWebLicense=; Cloudfront-parent-domain=klettlp.com; _ga_E6TQHW6LEH=GS2.1.s1746146817$o11$g1$t1746147055$j0$l0$h0",
          "Referer": "https://klettlp.com/school/purchase/history.htm",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });

      const jsonParsedResponse = await response.json();
      console.log(jsonParsedResponse);
   

/* EXAMPLE RESPONSE:
{
  licensesSrvRes: {
    code: 200,
    diagMessage: 'License records found',
    accessCodeDetailList: { accessCodeDetailVOList: [Array], maxPageIndex: 2 },
    sEcho: 1
  }
}

*/

//Accessing specific licenses of RESPONSE:
      const licenseList = jsonParsedResponse.licensesSrvRes.accessCodeDetailList.accessCodeDetailVOList;
      console.log(licenseList); // array

      return licenseList;

//Example data: KEEP IN MIND THE LICENSES ASSIGNED AND LICENSES USED FIELDS ARE 0 HERE, NEED TO MAKE ONE MORE REQUEST
/*
[
  {
    accessCode: 'DRZN-XCFY-WHB7-YPM8',
    accessCodeActivationUserMap: '',
    accessCodeId: 38435111,
    accessCodeProductTitlesMap: '',
    daysRemaining: 155,
    expiryDate: '2025-10-03T00:00:00Z',
    licenseAssigned: 0,
    licenseType: 'User',
    licenseUsed: 0,
    poId: 560410,
    poNumber: 'POZQ002481_Reporteros3_all',
    startDate: '2024-08-30T00:00:00Z',
    tenantId: 0,
    titleCount: 0,
    totalLicense: 40,
    userCount: 0
  },
  {
    accessCode: 'P5SG-SKC2-LVIL-JQ4J',
    accessCodeActivationUserMap: '',
    accessCodeId: 38435214,
    accessCodeProductTitlesMap: '',
    daysRemaining: 155,
    expiryDate: '2025-10-03T00:00:00Z',
    licenseAssigned: 0,
    licenseType: 'User',
    licenseUsed: 0,
    poId: 560419,
    poNumber: 'POZQ002481_Reportersfrancophones1-3_all',
    startDate: '2024-08-30T00:00:00Z',
    tenantId: 0,
    titleCount: 0,
    totalLicense: 50,
    userCount: 0
  }

*/















async function poTestSuite() {
//Step 1, get POenriched districts array
const poEnrichedDistricts = await getPoEnrichedDistricts(); //array of district objects enriched w/all POs in each district
//const poEnrichedDistricts = await testPartialGetPoEnrichedDistricts();  //REPLACE WITH REAL FUNCTION WHEN READY TO DO FOR FULL DISTRICT LIST IN API

//STEP 1.5, MAKE SURE TO ADD THE EXPIRED POs to this district:
//***NOTE RELIES ON JSESSION COOKIE */
await addExpiredPOInfo(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.

//Step 2, mutate and further enrich with PO assignment and expiration data:
await addPoAssignmentAndExpiration(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.


await addPoContentsAndRedeemedCount(poEnrichedDistricts); // returns nothing, b/c mutates the current object poEnrichedDistricts in memory.
console.log(poEnrichedDistricts);

//Step 3, save to file
let formattedDate = makeFormattedTodayDate();
saveToFile(poEnrichedDistricts, `ALL DISTRICTS poEnrichedDistricts ${formattedDate}`); // save file with all districts and nested under each district are POs and schools
}


async function addExpiredPOInfo(poEnrichedDistricts) {
   
    const expiredPoArray = [];
   for (let i = 0; i < poEnrichedDistricts.length; i++) {
        const district = poEnrichedDistricts[i];

        if (!district?.districtName) {
            console.warn("Error fetching district, skipping.");
            continue;
        };

        const response = await getExpiredPOsForDistrict(district?.districtName);
        const rawData = response?.poListResponse?.data; //gets only the PO part of the response. only present for districts
        //with expired POs.

        if (!rawData) {
            console.warn('There are no expired POs here, skipping.');
            continue;
        }
         //if there adistrict without Pos, skip
        //got it...ugh, so if there are multiple expired POs, it returns an 
        //array. Otherwise, it returns a single object. I'll have to normalize it
        // all to an array to be ocnsistent.
       
        //Otherwise, keep running:

        console.log('There are expired POs here!');

        console.log('Raw data: ', rawData);
        console.log('Normalizing to array....');
        const dataGuaranteedArray = Array.isArray(rawData) ? rawData : [rawData];
        console.log('The guaranteed array is: ', dataGuaranteedArray);
     
        console.log('Now iterating through array and adding any expired Pos...');

        const cleanedArray = []; 

        for (const po of dataGuaranteedArray) {

            const expiredPo = {
                startDate: po?.subscriptionStartDate
                    ? new Date(po.subscriptionStartDate).toISOString().split('T')[0]
                    : undefined,
                expiryDate: po?.expiryDate
                    ? new Date(po.expiryDate).toISOString().split('T')[0]
                    : undefined,
            //  schoolDistrictName: po?.schoolName,
                licenseCount: po?.licenseCount,
                purchaseOrderId: po?.purchaseOrderId,
                purchaseOrderNumber: po?.purchaseOrderNumber,
                trialPO: po?.trialPO,
                licenseType: po?.licenseTitle
                };
            cleanedArray.push(expiredPo);
        };
        console.log('Creating new property district.expiredPoArray: ', cleanedArray);
        //After loooping through all pos, assign (simply a reference in memory) to cleanedPoArray
       //CREATE NEW PROPERTY ON THE DISTRICT
           //FINALLY assign this expiredPo aray as a new PROPERTY created on the 
    //whole object:
        district.expiredPoArray = cleanedArray;
    };

    console.log("After adding expired po arrays: ", poEnrichedDistricts);
//do not need to return anything, sinc emutating the overall json/array
};  

/*
If there ARE Pos, there will be a property called poListResponse.data

{
  poListResponse: {
    code: 200,
    diagMessage: 'Success',
    data: {
      accessCode: '0E54-DOT5-QHU1-W3CI',
      accessCodeId: 39079842,
      expiryDate: '2025-01-17T00:00:00Z',
      firstName: 'Russ',
      lastName: 'Potter',
      licenseCode: 'LPULID',
      licenseCount: 803,
      licenseTitle: 'User',
      otherSystemMaster: 'ONEROSTER',
      poPrice: '0.00',
      preferentialUsers: false,
      purchaseOrderId: 579625,
      purchaseOrderNumber: 'ShawneeMissionPilot_2024-2025_ReporterosSeries',
      schoolName: 'Shawnee Mission School District (KS)',
      status: 'ACT',
      subscriptionStartDate: '2024-10-30T00:00:00Z',
      trialPO: false,
      type: 1,
      userGuid: 'd9b51c3e-145d-4c00-8c1c-1e5175314bb8',
      userName: 'RussPotter@smsd.org',
      userType: 'DISTRICT_ADMIN'
    },


{
  poListResponse: {
    code: 200,
    diagMessage: 'Success',
    data: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object]
    ],
    LPD: false,
    LPIPA: false,
    LPULID: true,
    poFlag: false,
    studentCount: 0,
    teacherCount: 0,
    iTotalDisplayRecords: 22,
    iTotalRecords: 22,
    sEcho: 1
  }
}

    */



async function addPoContentsAndRedeemedCount(poEnrichedDistricts) {
    for (const district of poEnrichedDistricts) {
        const poArrays = [district.activePoArray, district.expiredPoArray].filter(Boolean); // Only process if exists
    
        for (const poArray of poArrays) {
            for (const po of poArray) {
                try{
                    const data = await getPoContentsAndRedeemedCount(po.purchaseOrderNumber);
                        // Enrich PO object with returned data regardless of a match
                    po.redeemedCount = data.data?.redeemedCount;
                    po.trialPO = data.data?.trialPO;
                    po.productTitles = data.data?.productTitles || []; // Default to empty array if not available

                    // If you still want to log mismatches as a warning:
                    if (po.purchaseOrderNumber !== data.data.purchaseOrderNumber) {
                        console.warn(`PO number mismatch: expected ${po.purchaseOrderNumber}, but got ${data.data.purchaseOrderNumber}`);
                    }
                } catch (error) {
                    console.log('Error, skipping this PO.', error);
                };
            };
        };
    };
};
            //Mutates the poEnrichedDistricts object array by adding the assignment and expiration data from the getPOUserAssignmentAndExpirationData function.
//Does not return anything, b/c the original object send to this function (poEnrichedDistricts) is mutated/transformed in memory.
async function addPoAssignmentAndExpiration(poEnrichedDistricts) {

    for (const district of poEnrichedDistricts) {
        const poArrays = [district.activePoArray, district.expiredPoArray].filter(Boolean); // only process if exists

        for (const poArray of poArrays) {
            for (const po of poArray) {
                try { // the try/catch block should only wrap each PO individually.
                        //That way if one PO fails, the outer loop will continue to run.
                    const poData = await getPOUserAssignmentAndExpirationData(po.purchaseOrderNumber);

                    // Assign new fields from API, even if there's a mismatch
                    po.startDate = poData?.startDate || ''; // Handle undefined case
                    po.totalLicenseCount = poData?.totalLicenseCount || 0; // Default to 0 if not available
                    po.autoAssignPO = poData?.autoAssignPO || false; // Default to false if not available
                    po.autoAssignStudentPO = poData?.autoAssignStudentPO || false; // Default to false if not available
                    po.licensesCurrentlyAssignedToUsers = poData?.licensesCurrentlyAssignedToUsers || 0; // Default to 0 if not available
                    po.usersCurrentlyAssignedLicense = poData?.usersCurrentlyAssignedLicense || []; // Default to empty array if not available

                    // Log mismatch as a warning, not an error
                    if (po.purchaseOrderNumber !== poData?.purchaseOrderNumber) {
                        console.warn(`PO number mismatch: expected ${po.purchaseOrderNumber}, but got ${poData.purchaseOrderNumber}`);
                    }
                } catch (error) {
                console.error('Error enriching POs. Skipping this PO', error);
                };
            // Introduce delay between each PO request to avoid hitting rate limits
            // await delay(10);
            }
        }
    }
}


//poEnrichedDistricts should look like this: 
/*
[
  {
    "districtName": "Portland Public Schools (OR)",
    "districtId": 69729,
    "activePoArray": [
      {
        "purchaseOrderNumber": "Portland_Public_Schools_Reporteros_1_2_migrated",
        "purchaseOrderId": 549863,
        "expiryDate": "2025-09-15",
        "licenseType": "User"
      }
    ],
    "schools": [
      {
        "schoolId": 69746,
        "creator": "elarsen@pps.net",
        "schoolName": "Access",
        "schoolCode": null,
        "status": "ACT",
        "createdOnDate": null,
        "address": "NA",
        "province": null,
        "city": null,
        "zipCode": "NA",
        "country": null,
        "districtAdmincount": null,
        "schoolAdmincount": null,
        "studentcount": 157,
        "teachercount": 1,
        "type": null,
        "schoolDomain": null,
        "tagCategory": null,
        "districtId": 0,
        "otherSystemId": null,
        "isStudentBundleRequired": false,
        "schooladminlist": [
          {
            "username": "access.admin@pps.net",
            "name": "Access Admin"
          }
        ],
        "districtInfo": null,
        "classList": null,
        "studentBundleRequired": false
      },
    etc. etc. etc. 
*/

//Mutates the poEnrichedDistricts object array by adding the assignment and expiration data from the getPOUserAssignmentAndExpirationData function.
//Does not return anything, b/c the original object send to this function (poEnrichedDistricts) is mutated/transformed in memory.
async function addPoAssignmentAndExpiration(poEnrichedDistricts) {
  
        for (const district of poEnrichedDistricts) {
            const poArrays = [district.activePoArray, district.expiredPoArray].filter(Boolean); // only process if exists

            for (const poArray of poArrays) {
              // console.log('What do we actually have???');
                //console.log(poArray);
                for (const po of poArray) {
                    try {
                    const poData = await getPOUserAssignmentAndExpirationData(po.purchaseOrderNumber);

                    // Assign new fields from API, even if there's a mismatch
                    po.startDate = poData.startDate || ''; // Handle undefined case
                    po.totalLicenseCount = poData.totalLicenseCount || 0; // Default to 0 if not available
                    po.autoAssignPO = poData.autoAssignPO || false; // Default to false if not available
                    po.autoAssignStudentPO = poData.autoAssignStudentPO || false; // Default to false if not available
                    po.licensesCurrentlyAssignedToUsers = poData.licensesCurrentlyAssignedToUsers || 0; // Default to 0 if not available
                    po.usersCurrentlyAssignedLicense = poData.usersCurrentlyAssignedLicense || []; // Default to empty array if not available

                    // Log mismatch as a warning, not an error
                    if (po.purchaseOrderNumber !== poData.purchaseOrderNumber) {
                        console.warn(`PO number mismatch: expected ${po.purchaseOrderNumber}, but got ${poData.purchaseOrderNumber}`);
                    }
                } catch (error) {
                    console.error("Error enriching POs:", error);
                };
            // Introduce delay between each PO request to avoid hitting rate limits
           //  await delay(3000);
            };
        };
    };
}


async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
/*
"activePoArray": [
    {
      "purchaseOrderNumber": "Portland_Public_Schools_Reporteros_1_2_migrated",
      "purchaseOrderId": 549863,
      "expiryDate": "2025-09-15",
      "licenseType": "User"
    }
  ],
  */

//Now need to access each PO of the district and send to

/*
const cleanedPoData = {
    "purchaseOrderNumber": data.purchaseOrderNumber, // not needed
    "startDate": data.startDate, ///NEEDED
    "expiryDate": data.expiryDate,
   // schoolOrDistrictAccountId: 72360,
   // accountName: 'Greater Albany Public Schools',
   // accountType: 'DISTRICT',
   // licenseType: 'User',
    "totalLicenseCount": data.licenseCount, //NEEDED
    "autoAssignPO": false, //NEEDED
    "autoAssignStudentPO": false, //NEEDED
    "licensesCurrentlyAssignedToUsers": data.licenseConsumeCount, //NEEDED //mb api calls this ConsumeCount but it really refers to the number of licenses currently assigned to users. (not necessarily 'activated' by users)
    "usersCurrentlyAssignedLicense": consumeUsers //array of users //NEEDED
}
*/










/* SKIP THIS FOR NOW SINCE IT REQUIRES COOKIES
for (district of poEnrichedDistricts) {
    getLicensesCurrentlyAssignedAcrossAllSchools(district.districtId); // this is the "Greater Albany 157 number shown --total number assigned to all schools in district"
};
*/






function makeFormattedTodayDate() {
    const now = new Date();
    const day = now.getDate();
    const month = (now.getMonth() + 1);
    const year = now.getFullYear();
   const hour = String(now.getHours()).padStart(2, '0');
   const minute = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}`;
   return formattedDate;
   // console.log(formattedDate);
}
//makeFormattedTodayDate()





//KEEP IN MIND WILL ONLY RETURN 100 ITEMS, GO BACK AND EDIT LATER TO IMPLEMENT PAGINATION
async function getExpiredPOsForDistrict(districtName) {

    const encodedDistrictName = encodeURIComponent(districtName);
    const base = 'https://klettlp.com/services/purchaseorders/getPurchaseOrderDetailList.json'
    const url = `${base}?sEcho=1&iColumns=13&sColumns=%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=1000&mDataProp_0=0&bSortable_0=false&mDataProp_1=1&bSortable_1=true&mDataProp_2=2&bSortable_2=true&mDataProp_3=3&bSortable_3=false&mDataProp_4=4&bSortable_4=true&mDataProp_5=5&bSortable_5=true&mDataProp_6=6&bSortable_6=false&mDataProp_7=7&bSortable_7=true&mDataProp_8=8&bSortable_8=true&mDataProp_9=9&bSortable_9=true&mDataProp_10=10&bSortable_10=false&mDataProp_11=11&bSortable_11=false&mDataProp_12=12&bSortable_12=true&iSortCol_0=2&sSortDir_0=desc&iSortingCols=1&tenantId=804&pageNumber=1&maxRecordCount=10&rowField=EMAIL_ID&sortOrder=desc&searchText=${encodedDistrictName}&expiryFilter=Expired&licenceTypeCode=All`;

    const response = await fetch(url, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "_ga=GA1.1.1042487296.1746109864; SESSIONID=66B60C729C3A3FC0CAF348E24170F622; JSESSIONID=c55e4cca-7c02-4d59-9043-bc6c2350065c; jwt_token=Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjd2VzdHJheUBrbGV0dHdsLmNvbSIsInVzZXJOYW1lIjoiY3dlc3RyYXlAa2xldHR3bC5jb20iLCJ1c2VyUm9sZSI6IlNVUF9QVUJMSVNIRVIiLCJ1c2VyR3VpZCI6IjY0MmM5OGEwLTY5NWQtNGRjMC1iN2IyLTBmMDM3NDZlMjM2YSIsInRlbmFudElkIjo4MDQsInRlbmFudE5hbWUiOiJrbGV0dGxwIiwiZmlyc3ROYW1lIjoiU3VwIiwibGFzdE5hbWUiOiJwdWJsaXNoZXIiLCJkb21haW4iOiJrbGV0dGxwLmNvbSJ9.HsIOqir3kx6vtkjUsZE2Qdww6DFO8Wk8aCDB9sqbNGTUER12dgYJWNtuoK7ERyjr78hRQQgbQ2Zj7C_iJrF0yPEuzZlKiQTTzJ1aoKFdLd8QHhwUffLNVW7O7Gf-xdlrKsSJZhFeRqLNti7TT3I-8Emay0EzGn4UqqAtZlW5bHE; CloudFront-Key=c55e4cca-7c02-4d59-9043-bc6c2350065c; CloudFront-Policy=c55e4cca-7c02-4d59-9043-bc6c2350065c; CloudFront-Signature=c55e4cca-7c02-4d59-9043-bc6c2350065c; Cloudfront-domain=https://klettlp-mbx-cloud.klettlp.com/content/secure/804/0/; CloudFront-Key-Pair-Id=c55e4cca-7c02-4d59-9043-bc6c2350065c; pdftronAppUrl=https://klettlp-mbx-cloud.klettlp.com/static/pdftron/26/index.html; pdftronWebLicense=; Cloudfront-parent-domain=klettlp.com; _ga_E6TQHW6LEH=GS1.1.1746121362.2.1.1746121372.0.0.0",
            "Referer": "https://klettlp.com/admin/purchaseorder/polist.htm",
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
  }); 

    const jsonParsedResponse = await response.json();
    //console.log('raw data for expired PO response: ', jsonParsedResponse);


    return jsonParsedResponse;
}
}
