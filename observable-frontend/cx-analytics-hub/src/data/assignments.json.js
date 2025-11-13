//Framework uses file-based routing for data loaders: 
// the data loader logins.json.js serves the file logins.json. 
// To load this file from src/logins.md we use the relative path ./data/logins.json.

import { BASEURL } from "../config.js";

const assignments_url = `${BASEURL}/api/assignments/`;

async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error (`fetch failed: ${response.status}`);
    return await response.json();
}

const data = await json(assignments_url);
process.stdout.write(JSON.stringify(data));