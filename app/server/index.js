// require = old (common js)
//import = new (ES modules). Asynchronous, so code can continue. And can import only quat you need

import { Storage } from "@google-cloud/storage";
import path from "path";
import { fileURLToPath} from "url";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); //needs to be the FUNCTION express(), not just the
//express app instance.
app.use(cors());
const PORT = process.env.PORT || 8080;

// === Cloud Storage config for cached BigQuery results === //
const storage = new Storage(); // client for interacting with Google Cloud Storage (read/write files)
// https://console.cloud.google.com/storage/browser?project=klett-cx-analytics
const BUCKET_NAME = process.env.CACHE_BUCKET || "cx-analytics-cache";
const CACHE_FILE = "latest_query.json";

// express.static middleware to serve public resources:

//app.use(express.static(root, [options]); //
//**Good to remember to cache BigQuery responses to reduce repeated queries */
//Cache-control headers:
app.use(
  "/static",
  express.static("public", {
    maxAge: "1h", // cache for 1 hour
  })
);

//app.use(express.static('files'));

//Explicit route to serve index.html static file (and other static /public files) at the root ("/") route:
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
})


// === API endpoint: serve cached BigQuery data ===
app.get("/api/data", async (req, res) => {
  try {
    const file = storage.bucket(BUCKET_NAME).file(CACHE_FILE);
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString());
    res.json(data); // sends a json body response to the api request
  } catch (err) {
    console.error("Error reading cache:", err);
    res.status(500).json({ error: "Failed to read cached data." });
  }
});

// === Optional: manual refresh endpoint === 
app.post('/api/refresh', async (req, res) => {
    //To do: Implement BigQuery query + cache update here if needed
    res.json({ message: 'Manual refresh endpoint - not yet implemented.'});
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
