const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs').promises; // <-- use promise-based fs

const MagicBoxApiKey = process.env.MAGICBOX_API_KEY;
const MagicBoxBaseUrl = process.env.MAGICBOX_BASE_URL;

async function saveToFile(data, filename) {
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Data successfully saved to ${filename}`);
    } catch (err) {
        console.error("Error writing file:", err);
    }
}


async function getSchoolsInDistrict(districtId) {
    try {
        const url = `${MagicBoxBaseUrl}/districts/v1.0/${districtId}/schools?token=${MagicBoxApiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return(data);
       // await saveToFile(data, `district_${districtId}_schools.json`);
        //console.log(data);
    } catch (error) {
        console.error("Error fetching schools in district:", error);
    }
}


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
*/

async function readDistrictList() {
    try {
        const data = await fs.readFile("districtList.json", "utf8");
        //console.log("District list:", data);
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading districtList.json:", err);
    }
}



async function main() {
    const districtList = await readDistrictList();
    //const schoolList = await readSchoolList(); I guess I don't actually need this.

    //For every district, I want to get the schools in the district.
    //Step 1: Get the district ID from the districtList
    //Step 2: Call the function: await getSchoolsInDistrict(districtId) to get the list of schools in that district
    //Step 3: Append it to the json
    //Step 4: Save the results to a file (a new json list)

  //console.log(districtList["data"]); either syntax works, either accesing the key, or the part of the objet
  districtArray = districtList.data;
 // console.log(districtArray);


 //for district in districtArray -> iterates over the keys/indices
 //for district of districtArray -> iterates over the values themselves


 //NOTE: GENERIC FOR LOOP WITH ASYNC IS NOT INHERENTLY PROBLEMATIC, BUT
 // IT **IS** SLOW. LATER REPLACE WITH .map function wrapped in Promise.all.
for (district of districtArray) {
    console.log(district["districtId"]);

      /////////STEP 1////////
    let districtId = district["districtId"] // district.districtId would also work

    /////////STEP 2////////
    const schoolData = await getSchoolsInDistrict(districtId);

    /////////STEP 3////////
    //ADD A NEW PROPERTY CALLED SCHOOLS TO THE JSON: SIMPLY!!
    district.schools = schoolData; // adds a new property schools to the district
    //however, you're only modifying the in-memory copy, not the file. So--need to save it to the file
    //return schoolData; // returning from within a for loop will return and exit the outer function, BUT only works inside a function definition (otherwise will throw an error)
}
    //wait for the for loop to finish and update the in-memory copy of the district list.
    //then, save the in-memory copy to a file
    
/////////STEP 4////////
    await saveToFile(districtArray, 'Grouped_District_List.json')

/*
    districtArray.forEach(district => {
        console.log(district.districtId);
        let districtId = district.districtId;
        let schools = getSchoolsInDistrict(districtId);
        console.log(schools);
    });
    */
    
   // await getSchoolsInDistrict(68589);
}

main();
