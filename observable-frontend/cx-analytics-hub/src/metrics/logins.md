---
theme: dashboard
title: Logins dashboard
toc: false
---

# Logins Dashboard

<!-- Load and transform the data -->

```js
// 1️⃣ Load data
const logins = await FileAttachment("../data/logins.json").json();
const forecast = await FileAttachment("../data/forecast.json").json();

// Optional: display raw data
display(logins);
display(forecast);

// 2️⃣ Prepare logins data: parse dates
const loginsParsed = logins.map(d => ({
  ...d,
  created_month: new Date(d.created_month)
}));


// 3️⃣ Summary plot across all districts
// Aggregate total logins per month
const summary = d3.rollups(
  loginsParsed,
  v => d3.sum(v, d => d.total_logins),
  d => d.created_month
);

// Convert to objects and sort by month
const summarySorted = summary
  .map(([month, total]) => ({ month, total }))
  .sort((a, b) => a.month - b.month);

display(
  Plot.plot({
    title: "Total Logins Across All Districts",
    x: { type: "utc", label: "Month" },
    y: { grid: true, label: "Total Logins" },
    marks: [
      Plot.lineY(summarySorted, {
        x: "month",
        y: "total",
        stroke: "steelblue",
        curve: "linear"
      })
    ]
  })
);



// 4️⃣ Single-district plot
// Pick a district
const districtName = "Plum Borough School District"; // change to any district you want

// Filter and sort by month
const districtDataSorted = loginsParsed
  .filter(d => d.locationName === districtName)
  .sort((a, b) => a.created_month - b.created_month);

display(
  Plot.plot({
    title: `Logins for ${districtName}`,
    x: { type: "utc", label: "Month" },
    y: { grid: true, label: "Total Logins" },
    marks: [
      Plot.lineY(districtDataSorted, {
        x: "created_month",
        y: "total_logins",
        stroke: "steelblue",
        curve: "linear"
      })
    ]
  })
);
