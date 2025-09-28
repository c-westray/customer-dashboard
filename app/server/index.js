import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { Storage } from "@google-cloud/storage";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);  //points to current file
const __dirname = path.dirname(__filename); //points to parent directory

const app = express();
const PORT = process.env.PORT || 8080;

// === Middleware ===
app.use(cors());
app.use(
  "/static",
  express.static(path.join(__dirname, "../public"), { maxAge: "1h" }) // serve /public files at /static
);

const mypath = path.join(__dirname, "../public");
const indexpath = path.join(__dirname, "../public", "index.html");

console.log("Hello world", mypath);
console.log("Index path is: ", indexpath);
console.log(PORT);

// === Google Cloud Storage config ===
const storage = new Storage();
const BUCKET_NAME = process.env.CACHE_BUCKET || "cx-analytics-cache";
const CACHE_FILE = "latest_query.json";

// === Routes ===

// Root: serve the dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// API: cached BigQuery data
app.get("/api/data", async (req, res) => {
  try {
    const file = storage.bucket(BUCKET_NAME).file(CACHE_FILE);
    const [contents] = await file.download();
    const data = JSON.parse(contents.toString());
    res.json(data);
  } catch (err) {
    console.error("Error reading cache:", err);
    res.status(500).json({ error: "Failed to read cached data." });
  }
});

// API: manual refresh (optional placeholder)
app.post("/api/refresh", async (req, res) => {
  // TODO: implement BigQuery refresh logic
  res.json({ message: "Manual refresh endpoint - not yet implemented." });
});

// API: Observable notebook proxy (HIDES API KEY)
app.get("/api/observable", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.observablehq.com/d/98ba04b43c04d700@20.js?v=4",
      {
        headers: {
          Authorization: `Bearer ${process.env.OBSERVABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Observable API error: ${response.status}`);
    }

    const js = await response.text();
    res.setHeader("Content-Type", "application/javascript");
    res.send(js);
  } catch (err) {
    console.error("Error fetching Observable notebook:", err);
    res.status(500).send("Failed to fetch notebook.");
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
