const dotenv = require('dotenv');
dotenv.config();

const MagicBoxApiKey = process.env.MAGICBOX_API_KEY || '826aba1a4c9e11e98d210a2dfa68e30a';
const MagicBoxBaseUrl = process.env.MAGICBOX_BASE_URL || 'https://api.getmagicbox.com:443/services';

async function saveToFile(data, filename) {
    const fs = require('fs').promises;
    try {
        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`Data successfully saved to ${filename}`);
    } catch (err) {
        console.error("Error writing file:", err);
    }
}

// Function to add delay between API calls to avoid rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to fetch all schools with pagination
async function fetchAllSchoolsWithPagination() {
    const allSchools = [];
    let offset = 0; // Start with offset 0 (MagicBox uses 0-based offset)
    const limit = 100; // Number of records per page (actual API limit)
    let hasMoreData = true;
    let totalCount = 0;
    let pageCount = 0;

    console.log('Starting to fetch all schools with pagination...');
    console.log(`Using offset=0, limit=${limit} (MagicBox 0-based pagination)`);

    while (hasMoreData) {
        pageCount++;
        console.log(`\n--- Fetching page ${pageCount} (offset: ${offset}, limit: ${limit}) ---`);

        try {
            // Construct the URL with pagination parameters
            const url = `${MagicBoxBaseUrl}/school/v1.1/getSchools?status=ALL&offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`;
            
            console.log(`Making request to: ${url.replace(MagicBoxApiKey, '***TOKEN_HIDDEN***')}`);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if we got a valid response
            if (!data || !data.data) {
                console.log('No data received or invalid response structure');
                break;
            }

            // Get the schools from this page
            const schoolsOnThisPage = data.data;
            console.log(`Received ${schoolsOnThisPage.length} schools on this page`);

            // Add schools from this page to our collection
            allSchools.push(...schoolsOnThisPage);

            // Get total count from response (if available)
            if (data.X_TOTAL_COUNT && totalCount === 0) {
                totalCount = data.X_TOTAL_COUNT;
                console.log(`Total schools available: ${totalCount}`);
                console.log(`Expected pages needed: ${Math.ceil(totalCount / limit)}`);
            }

            // Check if we've reached the end
            if (schoolsOnThisPage.length < limit) {
                console.log(`Received fewer schools than limit (${schoolsOnThisPage.length} < ${limit}), this must be the last page`);
                hasMoreData = false;
            } else {
                // Move to next page (standard pagination: offset += limit)
                offset += limit;
                console.log(`Moving to next page, new offset will be: ${offset}`);
                
                // Add a small delay to be respectful to the API
                await delay(1000); // 1 second delay between requests
            }

        } catch (error) {
            console.error(`Error fetching page ${pageCount}:`, error);
            break;
        }
    }

    console.log(`\n=== PAGINATION COMPLETE ===`);
    console.log(`Total pages fetched: ${pageCount}`);
    console.log(`Total schools collected: ${allSchools.length}`);
    console.log(`Expected total from API: ${totalCount}`);
    console.log(`Success rate: ${((allSchools.length / totalCount) * 100).toFixed(2)}%`);

    // Save all schools to a file
    await saveToFile(allSchools, 'all_schools_with_pagination.json');
    
    return allSchools;
}

// Alternative function that also works for districts (if they support the same pagination)
async function fetchAllDistrictsWithPagination() {
    const allDistricts = [];
    let offset = 0; // Start with offset 0 (MagicBox uses 0-based offset)
    const limit = 100; // Number of records per page (actual API limit)
    let hasMoreData = true;
    let pageCount = 0;
    let totalCount = 0;

    console.log('Starting to fetch all districts with pagination...');
    console.log(`Using offset=0, limit=${limit} (MagicBox 0-based pagination)`);

    while (hasMoreData) {
        pageCount++;
        console.log(`\n--- Fetching district page ${pageCount} (offset: ${offset}, limit: ${limit}) ---`);

        try {
            // Construct the URL with pagination parameters for districts
            const url = `${MagicBoxBaseUrl}/v2.0/getDistricts?status=ALL&offset=${offset}&limit=${limit}&token=${MagicBoxApiKey}`;
            
            console.log(`Making request to: ${url.replace(MagicBoxApiKey, '***TOKEN_HIDDEN***')}`);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !data.data) {
                console.log('No data received or invalid response structure');
                break;
            }

            const districtsOnThisPage = data.data;
            console.log(`Received ${districtsOnThisPage.length} districts on this page`);

            allDistricts.push(...districtsOnThisPage);

            // Get total count from response (if available)
            if (data.X_Total_Count && totalCount === 0) {
                totalCount = data.X_Total_Count;
                console.log(`Total districts available: ${totalCount}`);
                console.log(`Expected pages needed: ${Math.ceil(totalCount / limit)}`);
            }

            if (districtsOnThisPage.length < limit) {
                console.log(`Received fewer districts than limit (${districtsOnThisPage.length} < ${limit}), this must be the last page`);
                hasMoreData = false;
            } else {
                offset += limit;
                console.log(`Moving to next page, new offset will be: ${offset}`);
                await delay(1000);
            }

        } catch (error) {
            console.error(`Error fetching district page ${pageCount}:`, error);
            break;
        }
    }

    console.log(`\n=== DISTRICT PAGINATION COMPLETE ===`);
    console.log(`Total pages fetched: ${pageCount}`);
    console.log(`Total districts collected: ${allDistricts.length}`);
    console.log(`Expected total from API: ${totalCount}`);
    console.log(`Success rate: ${((allDistricts.length / totalCount) * 100).toFixed(2)}%`);

    await saveToFile(allDistricts, 'all_districts_with_pagination.json');
    
    return allDistricts;
}

// Function to identify standalone schools (schools not associated with any district)
async function identifyStandaloneSchools() {
    console.log('\n=== IDENTIFYING STANDALONE SCHOOLS ===');
    
    // Fetch all schools with pagination
    const allSchools = await fetchAllSchoolsWithPagination();
    
    // Filter schools that have districtId = 0 (standalone schools)
    const standaloneSchools = allSchools.filter(school => school.districtId === 0);
    
    console.log(`\nFound ${standaloneSchools.length} standalone schools out of ${allSchools.length} total schools`);
    console.log(`Standalone schools represent ${((standaloneSchools.length / allSchools.length) * 100).toFixed(2)}% of all schools`);
    
    // Save standalone schools to a separate file
    await saveToFile(standaloneSchools, 'standalone_schools.json');
    
    // Show first few standalone schools as examples
    console.log('\nFirst 5 standalone schools:');
    standaloneSchools.slice(0, 5).forEach((school, index) => {
        console.log(`${index + 1}. ${school.schoolName} (ID: ${school.schoolId})`);
    });
    
    return standaloneSchools;
}

// Main execution
async function main() {
    try {
        console.log('=== MAGICBOX API PAGINATION EXAMPLE ===\n');
        
        // Option 1: Fetch all schools with pagination
        await fetchAllSchoolsWithPagination();
        
        // Option 2: Fetch all districts with pagination (if supported)
        // await fetchAllDistrictsWithPagination();
        
        // Option 3: Identify standalone schools
        await identifyStandaloneSchools();
        
        console.log('\n=== ALL OPERATIONS COMPLETE ===');
        
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

// Run the example
if (require.main === module) {
    main();
}

module.exports = {
    fetchAllSchoolsWithPagination,
    fetchAllDistrictsWithPagination,
    identifyStandaloneSchools
}; 