
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const { json } = require('express/lib/response');

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


async function main() {
    const districts = require('../Grouped_District_List.json');
    await getDistrictLevelPOs(districts);
}
main();


//////////////////////////////////////
async function getDistrictLevelPOs(districts) {
//Get POs (only at the district level)
//.forEach does NOT work with asynchronous functions, will not wait properly
//Instead, use for _ of array

for district of districts(
    let districtId 
)

    districts.forEach(district => {
        let districtId = district.districtId;
        poList = await fetchPOList(districtId);
    });
}
//////////////////////////////////////


//////////////////////////////////////
async function getSchoolLevelPOs() {
//Get POs (only at the school level)

}
//////////////////////////////////////



async function fetchPOList(districtOrSchoolId) {
    //get /license/v1.0/poListBySchoolId/{schoolId}
    //Note this also works with a district Id.
    //https://api.getmagicbox.com:443/services//license/v1.0/poListBySchoolId/69729?token=826aba1a4c9e11e98d210a2dfa68e30a
   const url = `${MagicBoxBaseUrl}/license/v1.0/poListBySchoolId/69729?token=${MagicBoxApiKey}`;

   try{
        console.log("Fetching PO List...")
        const response = await fetch(url);
        const jsonParsedResponse = await response.json();
        return jsonParsedResponse;
    } catch (error) {
        console.log("Error when fetching PO list", error);
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