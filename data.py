#!/usr/bin/python3

import schedule, time
from Phidget22.Phidget import *
from Phidget22.Devices.GPS import *

def data():
        ch = GPS()
        ch.openWaitForAttachment(1000)
        altitude = ch.getAltitude()
        print("Altitude: " + str(altitude))
        ch.close()


data()

schedule.every(1).minutes.do(data)

while True:
    schedule.run_pending()
    time.sleep(1)
