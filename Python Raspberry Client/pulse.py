#!/usr/bin/python
import time
import os
import Adafruit_ADS1x15
from time import gmtime, strftime

N=200

Flag=0

def SendPulse():
	print 'Pulse request from server '
	adc = Adafruit_ADS1x15.ADS1015()
	GAIN = 3/3

	oldtime = 0
	newtime = 0
	counter = 0
	tick = 0
	i = 0
	t = 0


	mylist = [0 for k in range(181)]
	while tick < 15:
		newtime = strftime("%S", gmtime())
		if oldtime != newtime :
			tick += 1
			oldtime = newtime
		Signal = adc.read_adc(0, gain=GAIN)

		if i < 181:
			if Signal > 0:
				mylist[i] = Signal/22.333
			if Signal<0:
				mylist[i] = Signal/-1543
			i += 1
			time.sleep(0.072 )
	return mylist
