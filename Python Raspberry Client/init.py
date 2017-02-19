#!/usr/bin/python
import thread
import time
from socketIO_client import SocketIO, LoggingNamespace
from gps import start_reading
import requests
from Point import MyPoint
import camera
#import temperature
import led
from pulse import SendPulse
from BPM import get_BPM
#from license import get_lisense
import RPi.GPIO as GPIO


LocationPoint = MyPoint()
PhoneNumber = '0547777777'
#PhoneNumber = get_lisense()
socketIO = SocketIO('https://ipet-project-server.herokuapp.com/socket.io/')

Pulse_List = []
Pulse_BPM = 0
BPM_Counter = 0
BPM_request = 0

BPM_list = [0,0,0,0,0,0,0,0]


#temperature = temperature.Temperature()
leds = led.Ledscontrol()

Led_var = 0

#Temperature_var = 0

class Program:

    def __init__(self):
        global Led_var
        for i in range(0,5):
            leds.led_search()

        self.Login_Online_DB()




    def Get_Gps(self):
        """__locate location from gps.py__"""
        global LocationPoint
        while True:
            LocationPoint = start_reading(3)
            print "GPS Location: {0} , {1}".format(LocationPoint.x, LocationPoint.y)





    def Update_GPS_DB(self):
        """__update gps location in database__"""
        global Led_var

        path = "http://ipet-project-server.herokuapp.com"

        time.sleep(3) # waiting for location
        while True:
            if(LocationPoint.x != 0 and LocationPoint.y != 0):
                payload_set_location = {
                            'command': 'PetSetLocation',
                            'number': PhoneNumber,
                            'lat': LocationPoint.x,
                            'lon': LocationPoint.y
                }

                f = requests.get(path, params=payload_set_location)

                if (f.content == 'Updated'):
                    Led_var = 1
                    print 'Location: {0}, {1} updated in DB for User: {2}'.format(LocationPoint.x, LocationPoint.y, PhoneNumber)
                else:
                    print 'Can\'t login to the server'

            else:
                print "No Location to send to DB... tring againg"
            time.sleep(180)



    # def Update_GPS_Socket(self,userName):
    #     """__Send socket one time for user__"""
    #     global Led_var
    #     global LocationPoint
    #     try:
    #         Led_var = 1
    #         socketIO.emit('GiveLocation', userName, LocationPoint.x, LocationPoint.y)
    #         print "GPS: Sending socket to {0}: lat{1} ,lon{2}".format(userName, LocationPoint.x, LocationPoint.y)
    #     except Exception:
    #         print "can't send in socket to{0}".format(userName)

    def Update_GPS_Socket(self,userName):
        """__Send socket one time for user__"""
        #global Led_var
        global LocationPoint

        #Led_var = 1
        socketIO.emit('GiveLocation', userName, LocationPoint.x, LocationPoint.y)
        print "GPS: Sending socket to {0}: lat{1} ,lon{2}".format(userName, LocationPoint.x, LocationPoint.y)




    def Update_Picture_Socket(self, userName):
        """__Send socket one time for user__"""
        global Led_var
        cam = camera.Camera()
        try:
            picture = cam.take_a_pic()
        except Exception:
            print "Can't take a picture"

        try:
            Led_var = 1
            socketIO.emit('sendImage', userName, picture)
            print "Picture: Sending socket to {0}".format(userName)
        except Exception:
            print "can't send in socket to{0}".format(userName)


    def Login_Online_DB(self):
        """__change status on db to online for those user__"""
        global Led_var

        path = "http://ipet-project-server.herokuapp.com"

        payload_login = {
            'command': 'Petlogin',
            'petNumber': PhoneNumber
        }

        f = requests.get(path, params=payload_login)

        if (f.content == 'Connected'):
            Led_var = 1
            print 'logined as {0} successfuly!'.format(PhoneNumber)
            return 1
        else:
            print 'Can\'t login to the server'
            return 0

    def leds_controler(self):
        global Led_var
        # while True:
        #     if (Led_var == 0):
        #         leds.led_online()
        #     else:
        #         leds.led_connect()
        #         Led_var = 0

        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(11, GPIO.OUT)  # pin 11 for led online and connect

        while True:
            if (Led_var == 0):

                GPIO.output(11, GPIO.HIGH)
                time.sleep(1)
                GPIO.output(11, GPIO.LOW)
                time.sleep(1)

            else:
                GPIO.output(11, GPIO.HIGH)
                time.sleep(0.1)
                GPIO.output(11, GPIO.LOW)
                time.sleep(0.1)
                GPIO.output(11, GPIO.HIGH)
                time.sleep(0.1)
                GPIO.output(11, GPIO.LOW)
                time.sleep(0.1)
                GPIO.output(11, GPIO.HIGH)
                time.sleep(0.1)
                GPIO.output(11, GPIO.LOW)
                time.sleep(0.1)

                Led_var = 0






    def Update_Light_Socket(self, OnOff):
        print "Led: socket {0}".format(OnOff)
        if(OnOff == "on"):
            leds.led_search_on()
        elif(OnOff == "off"):
            leds.led_search_off()




    def Get_Pulse(self):
        global Pulse_List
        global Pulse_BPM
        global BPM_Counter
        global BPM_list
        global BPM_request
        global PhoneNumber

        while True:
            Pulse_List = SendPulse()
            Pulse_BPM = get_BPM(Pulse_List)

            print "Get pulse..."
            if (Pulse_BPM < 45):
                BPM_Counter = 0
            BPM_Counter += 1
            BPM_request += 1
            if BPM_Counter <= 3:
                Pulse_BPM = 0
            else:
                BPM_list = self.list_handler(BPM_list, Pulse_BPM)
                if (BPM_request >= 8) and (Pulse_BPM > 45):
                    Sum_ = 0
                    for i in range(len(BPM_list)):
                        Sum_ += BPM_list[i]
                    BPMavgg = (Sum_ / len(BPM_list))
                    BPM_request = 0
                    path = "http://ipet-project-server.herokuapp.com"
                    parmBPM = {
                        'command': 'putBPM',
                        'putNum': PhoneNumber,
                        'bpm': BPMavgg
                    }
                    reqst = requests.get(path,params=parmBPM)
                    if (reqst.content == 'inserted'):
                        print 'BPM updated'
                    else:
                        print 'cant update BPM'
            #print Pulse_List
            print ('BPM : ',Pulse_BPM)

    def Update_Pulse_Socket(self, userName):
        """__Send socket one time for user__"""
        global Pulse_List
        global Led_var
        global Pulse_BPM
        try:
            Led_var = 1
            socketIO.emit('GivePulse', userName, Pulse_List, Pulse_BPM)
            print "Pulse: Sending socket"
        except Exception:
            print "can't send in socket to{0}".format(userName)


    def list_handler(self,var_list, var):
        tmp_list = [0,0,0,0,0,0,0,0]
        i = 1
        while i < 8:
            tmp_list[i-1] = var_list[i]
            i += 1
        tmp_list[7] = var
        return tmp_list


    # def Get_temperature(self):
    #     global Temperature_var
    #     while True:
    #         tmp = temperature.get_temperature()
    #         if (tmp != 0):
    #             Temperature_var = tmp
    #             print("Temperature: %d C" % Temperature_var)
    #             time.sleep(7)


#################### Main function ####################

def main():

    prog = Program()
    print "Starting..."

    #prog.Login_Online_DB()    #moved to __init__

    socketIO.on('sendLocation' + PhoneNumber, prog.Update_GPS_Socket)
    socketIO.on('TakePic' + PhoneNumber, prog.Update_Picture_Socket)
    socketIO.on('Light' + PhoneNumber, prog.Update_Light_Socket)
    socketIO.on('sendHeartBit' + PhoneNumber, prog.Update_Pulse_Socket)

    try:
        thread1 = thread.start_new(prog.Get_Gps, ())
        thread2 = thread.start_new(prog.Update_GPS_DB, ())
        thread3 = thread.start_new(prog.leds_controler, ())
        thread4 = thread.start_new(prog.Get_Pulse, ())
        #thread5 = thread.start_new(prog.Get_temperature, ())
    except:
        print "Thread Exeption"




    socketIO.wait(seconds=10000)



if __name__ == "__main__": main()