#!/usr/bin/python
from picamera import PiCamera
from time import sleep
import base64
from socketIO_client import SocketIO, LoggingNamespace

class Camera:
    global camera
    camera = PiCamera()
    camera.rotation = 90
    camera.resolution = (320, 240) # 640 x 480

    def __init__(self):
        camera.start_preview()



    def take_a_pic(self):
        print "take a picture in 3 seconds..."
        sleep(3)

        try:
            camera.capture('/home/pi/Desktop/project/images/img.png')
            print "good picture"
            camera.stop_preview()

        except Exception:
            print "can't pake a picture: from camera.py"
            camera.stop_preview()

        imageFile = open("/home/pi/Desktop/project/images/img.png", "rb")
        imgBase64 = base64.b64encode(imageFile.read())
        # print imgBase64
        return imgBase64

