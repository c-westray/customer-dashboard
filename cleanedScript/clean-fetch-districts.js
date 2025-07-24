//----------------------------------------------------------------------------
//TO DO:
//----------------------------------------------------------------------------
// do postman at very end
// AT VERY END DRY WITH fetchJson(url). Do at very end
//get /school/v1.1/getSchools ADD NOTE THAT THERE IS NO DISTRICT INFO HERE, IT ALWAYS SAYS 0 FOR DISTRICTID (MISSING INFORMATION)
//add note about:   // Step 3.0: Fetch complete list of all schools (ENDPOINT: get /school/v1.1/getSchools)
    //Realized that studentcount and teachercount are always null at this endpoint...missing that data. still useful to keep in district school data
// add note about: ENDPOINT: GET /license/v1.0/poListBySchoolId/{schoolId} NOTE!!! {schoolId} can also be a district ID.
// add note about keeping old IDs for deleted districts...
// add note about urli / slash incoding for consumeUsers endpoint. /*
//Error in getPoData for PO KSO4355000002106716 All PD Neu 1,2,3/4 all user: Error: Failed to fetch: 400 Bad Request

//----------------------------------------------------------------------------
//NOTES
//----------------------------------------------------------------------------
// -- in cleanup separated fetching and processing distict list for modularity/testing (could combine later for performance)
//
//
//
//
//----------------------------------------------------------------------------
//SETUP
//----------------------------------------------------------------------------
//SETUP ENVIRONMENT
//----------------------------------------------------------------------------
const dotenv = require('dotenv');
dotenv.config();

const MagicBoxApiKey = process.env.MAGICBOX_API_KEY;
const MagicBoxBaseUrl = process.env.MAGICBOX_BASE_URL;

//jsession cookie only necessary for function addExpiredPOInfo(poEnrichedDistricts)
//necessary b/c there's no endpoint for expired POs but sometimes we need this historical data
const JSESSIONCOOKIE = '30e1201d-ddd8-461c-92f8-94cb0c9f9cff'; //replace w/my current session jsession cookie before running script
//console.log(`Working with global variable JSESSIONCOOKIE ${JSESSIONCOOKIE}.`)

//----------------------------------------------------------------------------
//SETUP FILE SAVING / NAMING
//---------------------------------------------------------------------------- 
const fs = require('fs').promises; //promise-based fs
async function saveToFile(data, filename) {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Data successfully saved to ${filename}`);
    } catch (err) {
        console.error("Error writing file:", err);
    }
}

function makeFormattedTodayDate() {
    const now = new Date();
    const day = now.getDate();
    const month = (now.getMonth() + 1);
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}`;
    // console.log(formattedDate);
    return formattedDate;
}

//----------------------------------------------------------------------------
//SETUP REUSABLE FETCH PATTERNS
//----------------------------------------------------------------------------
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    const jsonParsedResponse = await response.json();
    return jsonParsedResponse;
  } catch (error) {
    console.error('Error in fetchJson:', error);
    throw error; // re-throw if the caller needs to react
  }
}

//----------------------------------------------------------------------------
//SETUP BATCHER
//batch function and companion processor companion processor to batch large vols of calls (otherwise MB api returns "You are not authorized" message)
//not sure if this is rate limit or why
//----------------------------------------------------------------------------
async function batchProcessor(enrichedDistrictArray) {
    const arrayLength = enrichedDistrictArray.length;
    let batchNumber = 1; // //start at 1 but for batchMinIndex subtract 1 to make sure the index of my actual for loop starts at 0 (in the other function)
    const numberPerBatch = 10;
   // const maxNumBatches = arrayLength / numberPerBatch;
   const maxNumBatches = 2;

    while (batchNumber <= maxNumBatches) {
    try {
    const result = await batchMyBatch(batchNumber, numberPerBatch, enrichedDistrictArray);
            batchNumber++
            //optionally do something w/result, not in this case
    } catch (error) {
      console.error(`Error processing batch ${batchNumber}:`, error);
      throw error;
    }}
}

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
            console.log(`I\'m batching the batch. Batch number ${batchNumber}, index ${i}`);
            console.log(`I'm also doing other things with districtArray.`);
      
            const currentValueOfArray = districtArray[i]?.districtName;
           console.log(`For example, current index ${i} of this array is: ${currentValueOfArray}`);
          //  } else {
            //    continue;
           // };
        };
    } catch (error) {
      console.error(`Error processing batch ${batchNumber}:`, error);
      throw error;
    }
}
//----------------------------------------------------------------------------
//// MAIN()
// only use for final script when ready to make high vol of api calls

// separated fetching and processing for clarity (could combine later to improve performance)
//----------------------------------------------------------------------------
// MAIN flow -- 
// STEP 1.0: Fetch all districts 
//           (ENDPOINT: GET /v2.0/getDistricts)
// STEP 1.1: trim/process to get DATA FIELDS: districtId, districtName

// FIRST FOR-LOOP: Enrich each district w/ nested schools
//      STEP 2.0: For each district, fetch schools in district (ENDPOINT: GET /districts/v1.0/district/{id}/schools)
//      STEP 2.1: trim/process each school to get DATA FIELDS: schoolId, schoolName, studentcount, teachercount
//      Step 2.3: Enrich district list with school array. {districtId, districtName, schools: [schoolArray]}
// END OF FIRST FOR-LOOP

// STEP 3.0: Fetch all schools (ENDPOINT: GET /school/v1.1/getSchools)
// STEP 3.1: trim/process orphaned schools to get DATA FIELDS: schoolId, schoolName, studentcount, teachercount
// STEP 3.2: Identify orphaned schools w/out a parent district (not found in step 2) (by filtering district-nested school list against complete school list)// STEP 3.3: Add orphaned schools to district list but under title "No Parent District" (maybe also add a "No Parent District" field to mark them)

// SECOND FOR-LOOP: Enrich all schools w/ Purchase Order (PO) data
//      STEP 4.0: Enrich schools with active PO data 
//      Call // function retrieveProcessedPoList() combines two MB API calls: getActivePoList() and getPoData() 
//      getActivePoList() function ENDPOINT is GET /license/v1.0/poListBySchoolId/{schoolId} 
//          --> ***Note this also works with a district Id, even though it's called school ID, see notes. Used to get poList with all purchaseOrderNumber (aka {poNumber})
//      getPoData() function ENDPOINT is GET /license/v1.0/consumedata/{poNumber}.
//          --> Used for DATA FIELDS: startDate, expiryDate, totalLicenseCount, licenseConsumeCount, and synthetic field userCounts of admin, teacher, learner (optional but nice to have)
//      STEP 5.0: Enrich schools with expired PO data (requires my superpub login credentials, technically webscraping...no official endpoint, ask MB to build one for me?)
// END OF SECOND FOR-LOOP

// END

async function main() {

    //Step 1.0: Fetch complete list of all districts (ENDPOINT: GET /v2.0/getDistricts)
    const rawDistricts = await getCompleteDistrictList(); //array of district objects
   // console.log(rawDistricts);

    // Step 1.1: Process/trim to only include DATA FIELDS: districtId, districtName
    const processedDistricts = processDistricts(rawDistricts); //simplified array of district objects
  //  console.log(processedDistricts);

    const schoolEnrichedDistricts = [];

    // FIRST FOR-LOOP: Enrich each district w/ nested schools
    for (const district of processedDistricts) {
       // console.log(district);

        //Step 2.0: For each district, fetch all schools in that district (ENDPOINT: GET /districts/v1.0/district/{id}/schools)
        const rawDistrictSchools = await getSchoolsInDistrict(district.districtId);
      //  console.log(rawSchoolSchools);

        //STEP 2.1: trim/process each school to get DATA FIELDS: schoolId, schoolName, studentcount, teachercount
        const processedDistrictSchools = processSchools(rawDistrictSchools); // process to only include DATA FIELDS: schoolId, schoolName, studentcount, teachercount
       // console.log(processedDistrictSchools);

        // Step 2.3: Enrich district list with school array. {districtId, districtName, schools: [schoolArray]}
        const schoolEnrichedDistrict = {
            district: district, // district: { districtName, districtId }
            schools: processedDistrictSchools, // schools: [ {schoolName, schoolId, studentcount, teachercount} ]
        };
        //console.log(enrichedDistrict);
        schoolEnrichedDistricts.push(schoolEnrichedDistrict);
     } // END OF FIRST FOR-LOOP
    //  console.log(schoolEnrichedDistricts);

    // Step 3.0: Fetch complete list of all schools (ENDPOINT: get /school/v1.1/getSchools)
    //Realized that studentcount and teachercount are always null at this endpoint...missing that data from API I guess. still useful to keep in district school data
    const rawCompleteSchools = await getCompleteSchoolList()
    //console.log(rawCompleteSchoolArray);

    // STEP 3.1: trim/process orphaned schools to get DATA FIELDS: schoolId, schoolName, studentcount, teachercount
    const processedCompleteSchools = processSchools(rawCompleteSchools);
    //console.log(processedCompleteSchools);

    // STEP 3.2: Identify orphaned schools w/out a parent district (not found in step 2) (by filtering district-nested school list against complete school list)
    const districtSchools = schoolEnrichedDistricts.flatMap(district => district.schools); // could consider building school list while I'm looping over the first time to be more efficient 
    const orphanSchools = filterOrphanSchools(processedCompleteSchools, districtSchools);
    //console.log(orphanSchools);
    console.log(`Orphan school count: ${orphanSchools.length} \n District-nested school count: ${districtSchools.length}`);

    // STEP 3.3: Add orphaned schools to district array but under title "No Parent District" 
    const orphanEnrichedDistricts = addOrphanSchoolsEntry(schoolEnrichedDistricts, orphanSchools);

    //TO DO: Move logic to orphan function:
    //console.log(orphanEnrichedDistricts);
    const updatedDistrictSchools = orphanEnrichedDistricts.flatMap(district => district.schools);
    console.log(`Updated total school count: ${updatedDistrictSchools.length}`);
     if (orphanSchools.length + districtSchools.length !== updatedDistrictSchools.length) {
      throw new Error('Error adding orphan schools, check count')
     }
     //

    // SECOND FOR-LOOP: Enrich all schools w/ Purchase Order (PO) data
    
    //STEP 4.0: Enrich schools with active PO data

    /* Partial districts for testing
    const partialDistricts = orphanEnrichedDistricts.slice(0, 5);
    console.log(`Partial districts: ${partialDistricts}`);
    console.log(partialDistricts[0])
  */

    const poEnrichedDistricts = []
try {
  for (let district of orphanEnrichedDistricts) {
    const districtId = district.district.districtId;

    if (districtId === "__NO_DISTRICT__") {
      console.log('Orphan school entry found. Retrieving POs at the SCHOOL LEVEL.');
      //if they're individual schools we need to iterate through the individual schools and attach their PO lists at school-level, not district-level
      
      const poEnrichedSchools = [];

    for (let school of district.schools) {
      const schoolId = school.schoolId;
      const processedPoList = await retrieveProcessedPoList(schoolId) // function retrieveProcessedPoList() combines two MB API calls: getActivePoList() and getPoData() 
      poEnrichedSchools.push({...school, ...processedPoList})
    }
    //push all orphan schools to poEnrichedDistricts under same __NO_DISTRICT__ entry
      poEnrichedDistricts.push({...district, schools: poEnrichedSchools});
    } else {
      console.log('Retrieving POs at the DISTRICT LEVEL.')
      const processedPoList = await retrieveProcessedPoList(districtId); // function retrieveProcessedPoList() combines two MB API calls: getActivePoList() and getPoData() 
      poEnrichedDistricts.push({...district, ...processedPoList});
    }
  }
}  catch (error) {
  // console.error('Error processing PO list:', error);
  //***Swallow error */  for now-- fix uri encoding problem later, for now there will be missing data for ~10 schools that have / in the purchaseOrderNumber
  console.log(`Error processing PO list, check uri encoding of / characters or other troubleshooting`);
}

//SAVE TO FILE
let formattedDate = makeFormattedTodayDate();
saveToFile(poEnrichedDistricts, `cleanedScript ${formattedDate}`); // save file with all districts and nested under each district are POs and schools
}







//Enriches either a School or District by attaching its purchase order information.
//Takes a schoolId or districtId 
//--> fetches poList for that school or district by calling getActivePoList(),
//--> then fetches individual PO details and processes them by calling getPoData(), 
// --> attaches the resulting processed po list to the district (if called using districtId) or school (if called using schoolId);
//Currently only for active POs! nothing expired
async function retrieveProcessedPoList(schoolOrDistrictId) {
try{
    const poList = await getActivePoList(schoolOrDistrictId);
    console.log(poList);

    if (!Array.isArray(poList) || poList.length === 0) {
    console.log(`No valid PO list for schoolOrDistrictId ${schoolOrDistrictId}, skipping.`);
    continue; 
  }
    const processedPoList = [];

    for (const po of poList) {
      const poData = await getPoData(po?.purchaseOrderNumber);
      if (!poData) {
        console.log(`Skipping PO ${po?.purchaseOrderNumber} due to invalid data or fetch error.`); 
        // still need to fix forward slash / URI encoding issue, may retrieve some bad POs ~10
        // Push a placeholder to keep the entry visible
        processedPoList.push({
          purchaseOrderNumber: po?.purchaseOrderNumber,
          error: 'Failed to fetch PO data'
        });
      } else {
        // else keep going as normal
        const processedPo = poData;
        processedPoList.push(processedPo);
      }
    }
    return processedPoList;
  } catch (error) {
    // console.error('Error processing PO list:', error);
    //***Swallow error */  for now-- fix uri encoding problem later, for now there will be missing data for ~10 schools that have / in the purchaseOrderNumber
    console.log(`Error processing PO list with po ${po?.purchaseOrderNumber}, check uri encoding of / characters or other troubleshooting`);
  }
}

//----------------------------------------------------------------------------
//invoking main function

(async () => {
  try {
    await main();
    console.log('Process completed successfully.');
  } catch (error) {
    console.error('Error during main execution:', error);
    // Optionally handle or alert user here
  }
})();


//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
//FUNCTIONS USED BY MAIN()
//----------------------------------------------------------------------------

//----------------------------------------------------------------------------
//ENDPOINT: GET /v2.0/getDistricts
//Get complete district list with pagination
//----------------------------------------------------------------------------
async function getCompleteDistrictList() {
    const limit = 100;
    let offset = 0;
    const districtArray = [];

    try {
    while (true) {
        //url includes extra backslash / 
        const url = `${MagicBoxBaseUrl}/v2.0/getDistricts?status=ALL&offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const jsonParsedResponse = await response.json();
        const results = jsonParsedResponse; // raw results are {X_Total_Count: 225, data: [] }
        const arrayResults = results.data; // array of district objects
        districtArray.push(...arrayResults); // flatten results w/spread operator and push to [districtArray]
        if (arrayResults.length < limit) break; // no more pages
        offset ++; // offset is a 0-indexed page number, not a true offset
    }
    //console.log(districtArray);
    return districtArray;
  } catch (error) {
    console.error('Error fetching complete district list:', error);
   throw error; // re-throw 
  }
}



function processDistricts(rawDistrictArray) {
// data fields we want: districtId, districtName
 // maybe later: add in noDistrictAdmins since admins consume licenses (to monitor unnecessary admin license consumption). I think this info is in already in the PO license consumeUsers though
    const processedDistrictArray = rawDistrictArray.map(district => {
        return {
        districtId: district?.districtId ?? null,
        districtName: district?.districtName ?? null,
        }
    });
    return processedDistrictArray;
} 

//----------------------------------------------------------------------------
//ENDPOINT: GET /districts/v1.0/district/{id}/schools
//Get list of schools in a particular district

//there is also another endpoint get /districts/v1.0/district/{id}/schools which returns just the school name and ID, 
//however there's some other info e.g. number of teachers and students in each school we could use to monitor the current
//student population shared, this is useful so saving to our data
//----------------------------------------------------------------------------
async function getSchoolsInDistrict(districtId) {
        const limit = 100;
        let offset = 0;
        let schoolArray = [];

    try {
    while (true) {
        const url = `${MagicBoxBaseUrl}/districts/v1.0/${districtId}/schools?offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const jsonParsedResponse = await response.json();
       // console.log(jsonParsedResponse);
        const arrayResults = jsonParsedResponse.data || []; //array of all schools in district. If no schools in district, return empty array to prevent error, normalize results
        schoolArray.push(...arrayResults); // flatten array results and push current page of results to schoolArray
        if (arrayResults.length < limit) break;
        offset ++; // offset is a 0-indexed page number, not a true offset
    }
       // console.log(schoolArray);
        //console.log(`Fetched ${schoolArray.length} schools for district ${districtId}`);
        return(schoolArray);
    } catch (error) {
    console.error(`Error in getSchoolsInDistrict for district ${districtId}:`, error);
    throw error; // re-throw so caller can handle it
  }
}


//----------------------------------------------------------------------------
//ENDPOINT: GET /school/v1.1/getSchools
//Get complete school list with pagination
//note studentcount and teachercount are returned null here, missing data in api for this endpoint
//----------------------------------------------------------------------------
async function getCompleteSchoolList() {
    const limit = 100; //limit defaults to 100 even if no limit in param
    let offset = 0;
    const schoolArray = [];
try {
    while (true) {
        const url = `${MagicBoxBaseUrl}/school/v1.1/getSchools?status=ALL&offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        //processing response:
       const jsonParsedResponse = await response.json();
       //console.log(jsonParsedResponse);  // {data: [{schoolObject, schoolObject...}]}
       //Need to access .data for array of school objects:
        const arrayResults = jsonParsedResponse.data;
       // console.log(arrayResults);
        schoolArray.push(...arrayResults); // flatten and push current page of results to schoolArray
        if (arrayResults.length < limit) break; // aka last page
        offset ++;
    }
  //  console.log(schoolArray);
     return schoolArray;
  } catch (error) {
    console.error('Error in getCompleteSchoolList:', error);
    throw error;  // re-throw for caller
  }
}

function processSchools(rawSchoolArray) {
//Data fields we want: schoolcount (number of schools in district), schoolName, schoolId
//maybe useful but not totally necessary: studentcount, teachercount
    const processedSchoolArray = rawSchoolArray.map(school => {
        return {
        schoolId: school?.schoolId ?? null,
        schoolName: school?.schoolName ?? null,
        studentcount: school?.studentcount ?? null,
        teachercount: school?.teachercount ?? null
        }
    });
    return processedSchoolArray;
}

//----------------------------------------------------------------------------
//orphan school filtering and adding orphan school entries to district list
//----------------------------------------------------------------------------

function filterOrphanSchools(completeSchools, districtSchools) {
 // Identify orphaned schools w/out a parent district (not found in step 2) (by filtering district-nested school list against complete school list)
/*
    const orphanSchools = [];
    for (const school of completeSchools) {
        let comparisonId = school.schoolId;
        //check if there is already a school in districtSchools with that same id
        const exists = districtSchools.some(districtSchool => {
            console.log(`comparing ${comparisonId} to ${districtSchool.schoolId}`)
            return districtSchool.schoolId === comparisonId //
        });
        console.log(exists);
        //if no school ixists in districtSchools, push to that array...oh but we also want to add new district entry
        if (!exists) {
            console.log('Orphaned school found! pushing it to array');
            orphanSchools.push(school)
        }
    }
    return orphanSchools;
/* rewrite w filter
    const orphanSchools = completeSchools.filter(school => { 
    const exists = districtSchools.some(districtSchool => {
        return districtSchool.schoolId === school.schoolId}); 
        return !exists; // if it doesn't exist it's an orphan
    });
*/
    //rewrite w/ Set (more efficient)
    const districtSchoolIds = new Set (districtSchools.map(school => school.schoolId));
    const orphanSchools = completeSchools.filter(school => !districtSchoolIds.has(school.schoolId));
    return orphanSchools;
  }


function addOrphanSchoolsEntry(districtArray, orphanSchools) {
/*
Old version adding one entry per school

  const updatedDistrictArray = [];
  const orphanSchoolEntry = orphanSchools.map(school => {
    district: {districtName: "No Parent District", districtId: null},
    schools: [{schoolName, schoolId, studentcount, teachercount}]  //even though studentcount and teachercount are null for orphanschools due to missing data in that api endpoint
  });
  districtArray.push(orphanSchoolEntry);
  return updatedDistrictArray;
*/
//Revised version adding single entry for all orphans
  const orphanSchoolEntry = {
    district: {districtName: "No Parent District", districtId: '__NO_DISTRICT__'}, // flag id with '__NO_DISTRICT__' to signal it contains orphans
    schools: [...orphanSchools]
  }
  return [...districtArray, orphanSchoolEntry];
}

//----------------------------------------------------------------------------
// PURCHASE ORDER (PO) ENDPOINTS
//----------------------------------------------------------------------------
//ENDPOINT: GET /license/v1.0/poListBySchoolId/{schoolId}
// 
// Returns poList for that district or school, array of pos with:
// DATA FIELDS: 
// purchaseOrderNumber (string, e.g. 'PO#24008193_LafayetteParish_FrenchReadersSeries'),
// purchaseOrderId (Number, e.g. 547276)

// Only returns active POs. Any expired POs are not accessible directly through the Magicbox api at least currently 
// --> If a PO expires and we need the info for calculating consumption, I use superpub login + html scraping method due to lack of official endpoint
// --> If a PO is completely deleted, it can never be recovered

//NOTE {schoolId} can also be a {districtId}. If it is a district ID, this endpoint will actually return the POs for the entire district  (more accurately this SHOULD be called /poListByDistrictId{districtId} )

//On the Hub there are two types of Purchase Orders (POs):
//    District-level (applies to all districts). The PO is associated with the entire district.  
//        *note (For District-level POs, each PO ---may or may not--- also be associated with individual schools under that district, depending on whether the district admin has assigned it to that school. Therefore ignore the PO information for the individual schools nested under the district as this is not reliable)
//    School-level (applies to any school WITHOUT a parent district, aka orphan schools)

// If parent district exists:
//    --> call GET /license/v1.0/poListBySchoolId/{districtId}  (more accurately this SHOULD be called /poListByDistrictId{districtId} )
//    --> returns list of district-level POs (po for that whole district).
//    (IGNORE the individual nested schoolIDs under that district, since we already called the method on the entire district, we already have all the district's POs.)

//If a parent district does NOT exist (aka orphan school):
//    --> call GET /license/v1.0/poListBySchoolId/{schoolId}
//    --> returns list of POs in that school
//----------------------------------------------------------------------------
async function getActivePoList(districtOrSchoolId) {
  try {
    const url = `${MagicBoxBaseUrl}/license/v1.0/poListBySchoolId/${districtOrSchoolId}?token=${MagicBoxApiKey}`;
      const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }
          const jsonParsedResponse = await response.json(); //returns { poList: [ {object}, {object}, ... ] }, where poList is array of purchase order objects
          const poList = jsonParsedResponse?.poList || []; // if district or school does not have any active pos, return empty array
          return (poList);
    } catch (error) {
      console.log(`Error in getActivePoList for ID ${districtOrSchoolId}:`, error);
     // throw error; // rethrow so caller can handle it
       //CHANGE TO SWALLOW ERROR HERE (HAPPENED WITH SALES DEMO DISTRICT)
  }
}
//----------------------------------------------------------------------------
//ENDPOINT: GET /license/v1.0/consumedata/{poNumber}
// For each purchase order, get details (expiration date and consumption details)

// 
// Used for DATA FIELDS: 
// startDate // Date as string
// expiryDate // Date as string 
// licenseCount // total license count
// licenseConsumeCount // We now know this IS the real number of consumed licenses. (Licenses assigned where the user has logged in WITH the book) 
// consumeUsers (don't necessarily need this but could be useful to see which user TYPES have consumed the licenses: how many ADMINS, TEACHERS, LEARNERS
//  --> esp since admin and teacher licenses are provided complimentary, we want to assess actual student consumption metrics
//  --> consumeUsers result overspills / is paginated so to get total count we need to page through. this might not be worth it....

// Discarded info about autoassign b/c we don't currently need this, however can re-add in future if needed
/*
Example cleaned data after processing:
    {
  purchaseOrderNumber: 'PO_60427_PD_Neu_1',
  startDate: '2024-08-20',
  expiryDate: '2025-09-23',
  totalLicenseCount: 10598,
  licenseConsumeCount: 95,
  userCounts: {
    'District Admin': 1,
    'School Administrator': 31, // important b/c this is a large district using Clever, district admin automatically consume licenses...compare vs. actual student consumption data
    'School Teacher': 32,
    'School Student': 41 // student licenses (what we bill for) make up less than half of the consumption! problem w/large districts
  }
}
*/

//----------------------------------------------------------------------------
async function getPoData(purchaseOrderNumber) {
  let offset = 0;
  const limit = 1000; // max limit per API docs
  const showTitles = true;

  const consumeUserArray = []; // accumulates unique users
  const seenUserGuids = new Set(); // deduplication set
  let rawConsumeUserCount = 0; // count total before deduplication
  let duplicateUserCount = 0; // count of duplicate userGuids
  let lastData = null;

  try {
    while (true) {
      const urlEncodedPoNumber = encodeURIComponent(purchaseOrderNumber);
      const url = `${MagicBoxBaseUrl}/license/v1.0/consumedata/${urlEncodedPoNumber}?isTitleRequired=${showTitles}&offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
       throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const jsonParsedResponse = await response.json();
      const data = jsonParsedResponse.data;
      lastData = data;

      if (data?.consumeUsers?.length) {
        console.log(`Number of consumeUsers on page ${offset}: ${data.consumeUsers.length}`);
        rawConsumeUserCount += data.consumeUsers.length;

        for (const user of data.consumeUsers) {
          const guid = user.userGuid;
          if (!seenUserGuids.has(guid)) {
            seenUserGuids.add(guid);
            consumeUserArray.push(user);
          } else {
            duplicateUserCount++;
          }
        }
      }

      // break if last page reached
      if (!data?.consumeUsers || data.consumeUsers.length < limit) {
        break;
      }
      offset++;
    }

    // After exiting the while loop, accumulate user counts from all consume users collected
    // make sure to deduplicate users by reducing
    const userCounts = consumeUserArray.reduce((acc, user) => {
      acc[user.userType] = (acc[user.userType] || 0) + 1;
      return acc;
    }, {});

    // Build and return the cleaned PO data object (all the info will use last page of data but this is fine since doesn't change on each page)
    // we use the last page of consumeUsers to get accumulated consumeUsers and userCounts.
    const cleanedPoData = {
      purchaseOrderNumber: lastData?.purchaseOrderNumber,
      startDate: lastData?.startDate,
      expiryDate: lastData?.expiryDate,
      totalLicenseCount: lastData?.licenseCount,
      licenseConsumeCount: lastData?.licenseConsumeCount,
      productTitles: lastData?.productTitles || [],
      // consumeUsers: consumeUserArray // don't include real user data in cleaned object
      userCounts,
      rawConsumeUserCount, // total before deduplication
      duplicateUserCount    // how many users were filtered out as duplicates
    };

    console.log(cleanedPoData);
    return cleanedPoData;

  } catch (error) {
    //Only LOG and swallow error for now, do not re-throw, fix / uri encoding issue later
    console.log(`Error in getPoData for PO ${purchaseOrderNumber}. Only LOG and swallow error for now, do not re-throw, fix / uri encoding issue later`, error);
    //throw error;
  }
}

//Example output: 
/*
  purchaseOrderNumber: 'WhittierUHSD_pilot_Reporteros1-3',
  startDate: '2024-10-21',
  expiryDate: '2025-11-30',
  totalLicenseCount: 2620,
  licenseConsumeCount: 1470,
  productTitles: [ 'Reporteros 1', 'Reporteros 2 ', 'Reporteros 3' ],
  userCounts: {
    'District Admin': 2,
    'School Administrator': 5,
    'School Student': 1443,
    'School Teacher': 20
  },
  rawConsumeUserCount: 524999,
  duplicateUserCount: 523529 // how many were filtered out to get userCounts aka licenseConsume count. 
}
{
*/

///TO DO -- GET RID OF THIS FUNCTION async function getProductTitles(purchaseOrderNumber) { AS IT'S NO LONGER ENEDED.

//----------------------------------------------------------------------------
//wow I don't need this after all....

//ENDPOINT: GET /license/v1.0/ind/licensedata/{poNumber}
// Used for DATA FIELD: productTitles

// I am only using this to pull product titles (since product titles are not provided by the GET /license/v1.0/consumedata/{poNumber} endpoint
// other data here is mostly overlapping with the consumedata endpoint, discard
// note this endpoint provides a "redeemedCount", I don't actually know what this represents but doesn't correspond to actual license consumption
  //----------------------------------------------------------------------------

async function getProductTitles(purchaseOrderNumber) {
try {
  const urlEncodedPoNumber = encodeURIComponent(purchaseOrderNumber);
  const url = `${MagicBoxBaseUrl}/license/v1.0/ind/licensedata/${urlEncodedPoNumber}?token=${MagicBoxApiKey}`;
  const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
    const jsonParsedResponse = await response.json(); //returns { poList: [ {object}, {object}, ... ] }, where poList is array of purchase order objects
    const data = jsonParsedResponse.data;
    const productTitles = data.productTitles
    return productTitles; //array
    } catch (error) {
    console.error(`Error in getProductTitles for PO ${purchaseOrderNumber}:`, error);
    throw error; // re-throw
  }
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// TEST FUNCTIONS
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
//poTester function (unused by main) for final processedPo output
  //----------------------------------------------------------------------------

///////////////////////////////////
async function poTester() {
try {
  const poData = await getPoData('ShawneeMission_SO-49069_SpanishReaders');
  const productTitles = await getProductTitles('ShawneeMission_SO-49069_SpanishReaders');
  const processedPo = {...poData, productTitles}
  console.log(processedPo);
  } catch (error) {
    console.error(`Error fetching po data`)
    throw error;
  }
}

//Final processed PO output example:
/*
{
  purchaseOrderNumber: 'ShawneeMission_SO-49069_SpanishReaders',
  startDate: '2024-11-13',
  expiryDate: '2025-12-17',
  totalLicenseCount: 861,
  licenseConsumeCount: 1,
  consumeUsers: [
    {
      firstName: 'Russ',
      lastName: 'Potter',
      userName: 'RussPotter@smsd.org',
      userGuid: 'd9b51c3e-145d-4c00-8c1c-1e5175314bb8',
      userType: 'District Admin'
    }
  ],
  userCounts: { 'District Admin': 1 },
  productTitles: [
    '24 horas en Bogotá',
    '24 horas en Ciudad de México',
    'En busca de la verdad',
    'Todo para todos',
    'Un gol fantástico'
  ]
}
*/

//----------------------------------------------------------------------------
//poTestSuite() -- reads from .json test data or partial data to avoid abusing api
//----------------------------------------------------------------------------

async function poTestSuite() {
//Step 1, get POenriched districts array
const poEnrichedDistricts = await getPoEnrichedDistricts(); //array of district objects enriched w/all POs in each district
//const poEnrichedDistricts = await testPartialGetPoEnrichedDistricts();  //REPLACE WITH REAL FUNCTION WHEN READY TO DO FOR FULL DISTRICT LIST IN API
//const districtList = await readDistrictList(); reads from file; use for testing


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


//Test function to not abuse the API. Only gets the first few districts in districtArray instead of the whole array.
async function testPartialGetPoEnrichedDistricts(batchNumber) {

    const districtArray = require('/Users/cellawestray/Desktop/customer-dashboard-git/data-examples/Grouped_District_List.json'); // returns array of district objects (each district also has an array data: [] of nested schools)
    // console.log(districtArray);
    const enrichedDistrictArray = []; // actually need to change this to an object b/c I'm going to send this json later to the other api call to get info about each po name.

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
                const objectContainingPoList = await getActivePoList(districtId);
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
        
//For testing: File-reading functions (mock data for test to avoid abusing api)
/*
Unused since didn't end up needing it:
async function readSchoolList() {
    try {
        const data = await fs.readFile("schoolList.json", "utf8");
        //console.log("School list:", data);
        return data;
    } catch (err) {
        console.error("Error reading schoolList.json:", err);
    }
}
async function readDistrictList() {
    try {
        const data = await fs.readFile("districtList.json", "utf8");
        //console.log("District list:", data);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading districtList.json:", err);
    }
}
*/




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
    //console.log(jsonParsedResponse);
    return jsonParsedResponse;
}


