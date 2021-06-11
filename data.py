import time, csv
from datetime import datetime
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
                v = ch.getVelocity()
                h = ch.getHeading()
                with open("/root/data.csv","a", encoding="UTF8") as file:
                        writer = csv.writer(file)
                        now = datetime.now()
                        c = now.strftime("%H:%M:%S")
                        data = [alt, lat, lng, v, h, c]
                        writer.writerow(data)

                ch.close()
        except Exception as e:
                with open("/root/error.txt", "a+") as f:
                        f.seek(0)
                        err = f.read(100)
                        if len(err) > 0:
                                f.write("\n")
                        f.write(str(e))


data()