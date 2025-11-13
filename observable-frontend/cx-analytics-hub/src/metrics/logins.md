---
theme: dashboard
title: Logins Dashboard
toc: false
---

# Logins Dashboard

```js
// 1 Load data

/* @app.get("/api/logins")
  School and district breakdown (does not have usertypes, totals them.)
      //Table 4: `klett-cx-analytics.logins_staging_cleaned.step_four_separate_grand_totals_table`
      // Important to filter by the total_level
      // // total_level = DISTRICT or SCHOOL
      // Ignores usertype. (user_type_id is always "All Users")
*/
const logins_district_school_breakdown = await FileAttachment("../data/logins.json").json();


/* @app.get("/api/logins/usertypes")
  Usertype breakdown.
      Table 3: `klett-cx-analytics.logins_staging_cleaned.step_three_aggregate_monthly`//
      //Groups by user_type_id = admin, teacher, student, parent
*/
const logins_usertype_breakdown = await FileAttachment("../data/logins_usertypes.json").json();


/* @app.get("/api/logins/summary")
"ALL_DISTRICTS" AND "ALL_DISTRICTS_ALL_TIME" grand summary (Still has user_type). 
      Table 5: `klett-cx-analytics.logins_staging_cleaned.step_five_all_districts_total`
      //Ignores district and school breakdown. SchoolName is always "All Schools", DistrictName is always "All Districts", locationName is always "All Locations"
      //is_pilot is always null...
      //Important to filter by user_type, 
      //because does strill provide usertype breakdown.
      //Also important to filter by total_level = "All
      //
*/ 

const logins_all_locations_summary = await FileAttachment("../data/logins_summary.json").json()



// 2 Parse dates and filter for district-level only

//Table 4: Logins
const loginsDistrict = logins
  .filter(d => d.total_level === "DISTRICT")
  .map(d => ({
    ...d, // spread operator copies all original fields
    // location_name: d.locationName,
    // district_name: d.districtName, 
    //etc. (but use ...d instead)
    created_month: new Date(d.created_month) // transforms created_month into a date before mapping
  }));



// 3 Summary plot across all districts
// d3.rollups(data, reduceFn, keyFn1, keyFn2, ...)
const summary = d3.rollups(
  loginsDistrict,
  v => d3.sum(v, d => d.total_logins), // v is the array of row for each group. then passed to toal logins // groups across all districts, ***ignoring user type or district name***. So like the grand total 
  d => d.created_month
);

//summary looks like:
/*
[
  [Date("2024-01-01"), 1200],
  [Date("2024-02-01"), 1800],
  [Date("2024-03-01"), 2400],
  ...
]
*/

//now, destructure summary by mapping each pair into an ojbect
const summarySorted = summary
  .map(([month, total]) => ({ month, total }))
  .sort((a, b) => a.month - b.month); // sorts by last to first month

const summarySorted = summary
  .map(month, total]) => ({ month, total })
  .sort((a, b) => a.month - b.month);
 
// Produces an array of objects like this
//for convenient plotting
/*
[
  { month: new Date("2024-01-01"), total: 1200 },
  { month: new Date("2024-02-01"), total: 1800 },
  { month: new Date("2024-03-01"), total: 2400 }
]
*/

display(
  Plot.plot({
    title: "Total Logins Across All Districts",
    x: { type: "utc", label: "Month" }, // utc is coordinated universal time, ignoring timezones.
    y: { grid: true, label: "Total Logins" },
    marks: [
      Plot.lineY(summarySorted, {
        x: "month",
        y: "total",
        stroke: "steelblue",
        curve: "linear" // "linear" simply direclty connects points (jagged line)
      })
    ]
  })
);


const districtNames = Array.from(new Set(loginsDistrict.map(d => d.locationName))).sort();



```
  <style>
    select.district-select {
      background-color: #feededff;
      border-color: blue;
      color: white;
      padding: 0.5em 1em;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    }

    select.district-select:hover {
      background-color: #3b5cb0ff; /* darker blue on hover */
    }
  </style>

  <select class="district-select">
    ${districtNames.map(name => `<option value="${name}">${name}</option>`).join("")}
  </select>
```

