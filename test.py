import json
 
 
# function to add to JSON
def write_json(new_data, filename='data.json'):
    with open(filename,'r+') as file:
          # First we load existing data into a dict.
        file_data = json.load(file)
        print(int(list(file_data)[-1]) + 1)
        # Join new_dat3a with file_data
        file_data.update(new_data)
        # Sets file's current position at offset.
        file.seek(0)
        # convert back to json
        json.dump(file_data, file, indent = 4)
 
    # python object to be appended
y = { "2" : [{ "Altitude":  "1803.9",
     "Lat": "53.1835",
     "Long": "-131.9467",
     "Time": "22:55:46",
     "Velocity": "4.3",
     "Heading": "123.4"
        }]
    }
     
write_json(y)