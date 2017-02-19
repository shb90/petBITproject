import math

	#___make sure array within expected boundaries__#
def Normilize_Array(array):
    count = 0
    for i in range(len(array)):
        if ((array[i] > 2) and (array[i] < 90)):
            count += 1
    temp = [0 for k in range(count)]
    c = 0
    for i in range(len(array)):
        if (array[i] > 2) and (array[i] < 90):
            temp[c] = array[i]
            c += 1
    return temp

	#__ returns if a sharp rise is starting___#
def I_startRise(i,array):
    sum_ = 0
    s = i
    e = i
    verdict = 'no'
    if i+2 < len(array):
        if (array[i] < array[i+1]) and (array[i+1] < array[i+2]):
            sum_ += array[i+1]-array[i]
            sum_ += array[i+2]-array[i+1]
            verdict = 'yes'
            e = i+2
        else:
            if (array[i] < array[i+1]):
                sum_ += array[i+1]-array[i]
                e = i+2
                verdict = 'yes'
    return [s,e,sum_,verdict]

	#____returns if a sharp fall is starting___#
def I_startFall(i,array):
    sum_ = 0
    s = i
    e = i
    verdict = 'no'
    if i+1 >= len(array):
        return [s, e, sum_, verdict]
    if math.floor(array[i]) == math.floor(array[i+1]):
        i += 1
    if i+2 < len(array):
        if (array[i] > array[i+1]) and (array[i+1] > array[i+2]):
            sum_ += array[i+1]-array[i]
            sum_ += array[i+2]-array[i+1]
            verdict = 'yes'
            e = i+2
        else:
            if (array[i] > array[i+1]):
                sum_ += array[i+1]-array[i]
                e = i+2
                verdict = 'yes'
    return [s,e,sum_,verdict]

	#___return if I = start of a reverse pule___#
def I_reversePulse(i,array):
    verdict = 'no'
    s = i
    e = i
    if i+2 < len(array):
        temp = array[i]-array[i+1]
        if temp >= 35:
            j = i+1
            k = i+5
            while j < k:
                j += 1
                if j < len(array):
                    tmp = array[j]-array[j-1]
                    if tmp >= 35:
                        verdict = 'yes'
                        e = j
                        break
    return [s,e,verdict]

	#____if enough pulses recorded : BPM_byCounts#
	#____if not enough calculate by gaps between two#
def BPM_byCounts(array):
    curr = Normilize_Array(array)
    i = 0
    c = 0
    while i < len(curr):
        rise = I_startRise(i, curr)
        if rise[3] == 'yes':
            if curr[i] + rise[2] > 65:
                fall = I_startFall(rise[1], curr)
                if fall[3] == 'yes':
                    c += 1
                    i = fall[1]
        i += 1
    return c*4

def BPM_byReversePulse(array):
    arr = array
    i = 0
    c = 0
    while i < len(arr):
        revers = I_reversePulse(i, arr)
        if revers[2] == 'yes':
            c += 1
            i = revers[1]
        i += 1
    return c * 4

#_____________________GAPS___________________________________#
def I_riseAccurate(i,array):
    verdict = 'no'
    s=i
    e=i
    if i+2 < len(array):
        tmp = array[i+1]-array[i]
        if (tmp >= 7) and (array[i] > array[i+1]):
            verdict = 'yes'
            e = i+2
        else:
            if i+3 < len(array):
                tmp = 0
                tmp += array[i+1]-array[i]
                tmp += array[i + 2] - array[i+1]
                if (tmp >= 7) and (array[i] > array[i+3]):
                    verdict = 'yes'
                    e = i + 3
    return [s,e,verdict]

def BPM_combine(array):
    arr = array
    i = 0
    c = 0
    while i < len(arr) - 5:
        k = i + 5
        j = i
        while j < k:
            pulse = I_reversePulse(j, arr)
            if pulse[2] == 'yes':
                c += 1
                i = pulse[1]
                j = pulse[1]
            else:
                pulse = I_riseAccurate(i, arr)
                if pulse[2] == 'yes':
                    c += 1
                    i = pulse[1]
                    j = pulse[1]
            j += 1
        i += 1
    return c*4

def rejectBPM(bpm):
    if (bpm > 190) or (bpm<35):
        return 1
    return 0

def get_BPM(array):
    arr = array
    bpm_a = BPM_byReversePulse(arr)
    bpm_b = BPM_combine(arr)
    bpm_c = BPM_byCounts(arr)
    finalBPM = bpm_a
    if rejectBPM(bpm_a) == 1:
        finalBPM = bpm_b
        if rejectBPM(bpm_b) == 1:
            finalBPM = bpm_c
    return finalBPM