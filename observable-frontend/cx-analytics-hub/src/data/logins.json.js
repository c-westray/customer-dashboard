//Framework uses file-based routing for data loaders: 
// the data loader logins.json.js serves the file logins.json. 
// To load this file from src/logins.md we use the relative path ./data/logins.json.

const BASEURL = "http://127.0.0.1:8000"
const logins_url = `${BASEURL}/api/logins/`;
const logins_summary_url = `${BASEURL}/api/logins/summary`;
const logins_usertypes_url = `${BASEURL}/api/logins/usertypes`;

const assignments_url = `${BASEURL}/api/assignments/`;
const licenses_url = `${BASEURL}/api/licenses`;

async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error (`fetch failed: ${response.status}`);
    return await response.json();
}

const logins = await json(logins_url);
process.stdout.write(JSON.stringify(logins));


