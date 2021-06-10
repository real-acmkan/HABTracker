#!/usr/bin/python3

import time, json
from Phidget22.Phidget import *
from Phidget22.Devices.GPS import *

def data():
        time.sleep(6)
        try:
                ch = GPS()
                ch.openWaitForAttachment(1000)
                alt = ch.getAltitude()
                lat = ch.getLatitude()
                lng = ch.getLongitude()
                t = ch.getTime()
                v = ch.getVelocity()
                h = ch.getHeading()
                with open("data.json","r+") as file:
                        file_data = json.load(file)
                        a = int(list(file_data)[-1]) + 1
                        data = { a : [{ "Altitude":  str(alt),
                                "Lat": str(lat),
                                "Long": str(lng),
                                "Time": str(t),
                                "Velocity": str(v),
                                "Heading": str(h)
                                }]
                        }
                        file_data.update(data)
                        file.seek(0)
                        json.dump(file_data, file)
                ch.close()
        except Exception as e:
                with open("error.txt", "a+") as f:
                        f.seek(0)
                        err = f.read(100)
                        if len(err) > 0:
                                f.write("\n")
                        f.write(str(e))


data()