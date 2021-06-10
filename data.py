#!/usr/bin/python3

import time, json
from Phidget22.Phidget import *
from Phidget22.Devices.GPS import *

def data():
        time.sleep(7)
        try:

                ch = GPS()
                ch.openWaitForAttachment(1000)
                altitude = ch.getAltitude()
                data = {"altitude": str(altitude)}
                write_json(data)
                ch.close()
        except Exception as e:
                with open("/root/error.txt", "a+") as f:
                        f.seek(0)
                        err = f.read(100)
                        if len(err) > 0:
                                f.write("\n")
                        f.write(str(e))


def write_json(new_data, filename='/root/data.json'):
    with open(filename,'r+') as file:
          # First we load existing data into a dict.
        file_data = json.load(file)
        # Join new_dat3a with file_data
        file_data.update(new_data)
        # Sets file's current position at offset.
        file.seek(0)
        # convert back to json.
        json.dump(file_data, file, indent = 2)

data()