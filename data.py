#!/usr/bin/python3

import time
from Phidget22.Phidget import *
from Phidget22.Devices.GPS import *

def data():
	time.sleep(5)
	ch = GPS()
	try:
		ch.openWaitForAttachment(1000)
		altitude = ch.getAltitude()
		print("Altitude: " + str(altitude))
		file = open("success.txt", "w")
		file.write(str(altitude))
		file.close()
		ch.close()
	except Exception as e:
		file = open("error.txt", "w")
		file.write(str(e))
		file.close



data()