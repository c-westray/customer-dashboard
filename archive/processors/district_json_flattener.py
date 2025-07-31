import json #python module that lets you work with json data
import csv

# [] is a list (but people casually call it an "array")
#to use an actual array in python, you have to 
    # import array
    # my_array = [1, 4, 7, 3]
#But for 99% of general Python work (especially with JSON), just use lists.
# {} is a dictionary


# Use snake_case for variables and functions in python. e.g. district_Id or school_Id. **Avoid** camelCase for variables. camelCase is used for classes e.g. className


#javascript uses .push, whereas python uses .append

#with is a way of opening a resource and guaranteeing the resource will be automatically closed when the process completes (even if there's an error)
with open("Grouped_District_List.json", "r") as f: #using the "transformedDistricts.json file in read mode (r) as the file with variable name f
    data = json.load(f)

    flattened_data = []

    for district in data:
        district_name = district.get("districtName", "NO_NAME_EXISTS")
        district_id = district.get("districtId","NO_ID_EXISTS")
        schools = district.get("schools", {}).get("data",[]) #returns a list [] of schools in the district
        #print(schools)

        for school in schools:
            school_name = school.get("schoolName","NO_SCHOOLNAME_EXISTS")
            school_id = school.get("schoolId", "NO_ID_EXISTS")

            flattened_data.append({
                "district_name": district_name,
                "district_id": district_id,
                "school_name": school_name,
                "school_id": school_id
            })

    print(flattened_data)

    #using "x" mode instead of "w" mode ensures it will not overwrite any exisitng file with this name
    with open("district_flattened_data.csv","w", newline='') as f:
        #csv.DictWriter is a special writer object, it takes in the dictionary keys as a list[] of field names (columns), then writes the values in the corresponding rows
        writer = csv.DictWriter(f, fieldnames=["district_name","district_id","school_name","school_id"]) #fieldnames=[...]: Specifies the column order
        writer.writeheader()
        writer.writerows(flattened_data)

     # print(district["districtId"]) #this is like district.districtID in javascript
     # we treat object like dictionaries where we send the key to access the value
     # problem with this is it can cause a "key error" if no key exists.
     # Therefore use the .get("key", "value_if_null") to safely handle cases where no key exists 
     #dictionary.get(keyname, value_if_does_not_exist)
    
    """
    "w" = write mode

        If "district_flattened_data.csv" does not exist, Python will create it for you ✅

    If it does exist, Python will overwrite the entire file ❗ (So be careful if you have something important in there!)    
    """

    #print(data)


