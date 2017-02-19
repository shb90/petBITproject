// installSentBits(..) starts the process on socket.io call

var notActivePulseLine = 70;
var pulseWhiteBorder = 26;
var runningOnArray = false;


function AnimateHeartBeats($scope)
{
    $scope.recievedBIP = false;
    if ($scope.runningTest) { $scope.StopHeart = true; return; }
    var cnvs = document.getElementById("myCanvs");
    var context = cnvs.getContext("2d");
    var prevX = 0; var prevY = notActivePulseLine;
    var myPoints = new Array(41);
    for (var i = 0; i < myPoints.length; i++) { myPoints[i] = notActivePulseLine; }
    var currentI = 0;

    drawPoints(myPoints);

    function AnimateDraw(Bip) {
        cnvs.width = cnvs.width;
        ErasedY = myPoints[0];
        myPoints = addPoint(myPoints, Bip);
        prevX = 0; prevY = ErasedY;
        drawPoints(myPoints);
    }

    function drawPoints(Points) {
        for (var i = 0; i < Points.length; i++) {
            draw(Points[i]);
        }
    }

    function addPoint(Points, newPoint) {
        var temp = new Array(Points.length);
        for (var i = 0; i < Points.length - 1; i++) {
            temp[i] = Points[i + 1];
        }
        temp[Points.length - 1] = newPoint;
        return temp;
    }

    function draw(y) {
        if (y == null) { y = notActivePulseLine; }
        // Border line // = 49 , (80-49 = 31)
        context.lineWidth = "2";
        context.strokeStyle = "white";
        context.moveTo(0,pulseWhiteBorder);
        context.lineTo(125,pulseWhiteBorder);
        context.stroke();
		
        context.beginPath();
        context.lineWidth = "2";
        context.strokeStyle = "red";
        context.moveTo(prevX, prevY);
        context.lineTo(prevX + 3, y);
        prevX += 3; prevY = y;
        context.stroke();
        context.beginPath();
    }

    function avgDraw(avg) {
        var ctx = context;
        ctx.font = "18px Arial";
        // Create gradient
        var gradient = ctx.createLinearGradient(0, 0, 1, 0);
        gradient.addColorStop("0", "red");
        gradient.addColorStop("0.5", "red");
        gradient.addColorStop("1.0", "red");
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillText("bpm : " + avg , 170, 50);
    }


    $scope.firstHeartRun = true;
    var showAvg = true;

    function DrawTimer() {
        if ($scope.recievedBIP) {
            if (currI_ + 2 >= newBitsArr.length) {
                $scope.recievedBIP = false;
                // Make another call for the next 15 seconds
            }
            currI_++;
            var temp = newBitsArr[currI_];
            AnimateDraw(temp);
            avgDraw(newBPM);
            if (currI_ + 27 >= newBitsArr.length && runningOnArray == true) {
                if ($scope.heartWindowActive == false) { return; }
                runningOnArray = false;
                $scope.socket_.emit('GetPulse', $scope.OwnerName, $scope.currentPET[1]);
            }
        }
        else {
            AnimateDraw(notActivePulseLine);
            avgDraw(0);
        }
        if ($scope.firstHeartRun) {
            //GetPulse();
            $scope.firstHeartRun = false;
        }
        if (!$scope.StopHeart) { setTimeout(DrawTimer, newWaitingTime); }
    }

    var bit = 0;

    function GetPulse() {
        $scope.recievedBIP = BitsList[bit]; bit++; if (bit >= BitsList.length) { bit = 0; }
        if (!$scope.StopHeart) { var TO = Math.floor(Math.random() * 3000) + 300; setTimeout(GetPulse, TO); }
    }

    $scope.recievedBIP = false;
    DrawTimer();

    $scope.runningTest = true;
}

var BitsList = [45, 35, 25, 10, 42, 32, 5, 2, 8, 11, 23, 34, 45, 44, 41, 32, 11, 25, 34, 40];

		// get pet health status
function DiagnosePet($scope,$rootScope,$http)
{
    $scope.DocDiogns_ += "\n______________\n";
    var myRequest = '?command=getBPM&putNum=' + $scope.currentPET[1];
    $http.get($rootScope.SA + myRequest)
    .then(function (result) {
        var answer = eval(result).data;
        if (answer.title == 'error') {
            $scope.DocDiogns_ += answer.log + ' in the last 10 minutes '; return;
        }
        var BPMs = new Array(answer.log.length);
        var sum = 0;
        var stringBPMarr = '(';
        for (var i = 0; i < answer.log.length; i++)
        { 
            BPMs[i] = Math.floor(answer.log[i].bpm);
            sum += BPMs[i];
            stringBPMarr += BPMs[i] + ',';
        }
        stringBPMarr += ')';
        var recentBPM = BPMs[0];
        var avgBPM = Math.floor(sum / BPMs.length);
        $scope.DocDiogns_ += 'recent BPM recordings: \n' + stringBPMarr + '\n' +
                            'average BPM based on the last 20 minutes : ' + avgBPM + '\n' +
                            'average verdict : \n' + getMyBPMRange(avgBPM,$scope.currentPET[3], $scope.currentPET[4], true) + '\n' +
                            'latest BPM recording : ' + recentBPM + '\n' +
                            'BPM health verdict : \n' + getMyBPMRange(recentBPM,$scope.currentPET[3], $scope.currentPET[4], false);
    })
    .catch(function (data, status, headers, config) {
        alert(GetErrText("Server doesn't respond", data, status, headers, config));
    });
}

function getMyBPMRange(BPM, age, size, avg) {
    var bpm_ = parseInt(BPM);
    var age = parseInt(age);
    var advice = 'please check the symptoms and monitor the heart rate to see if it stabilizes';
    if (avg == true) {
        advice = 'please check the symptoms and contact a vet as soon as possible';
    }
    if (age <= 0.2) {
        if (bpm_ < 150) {
            return "your pet's BPM is abnormally low should be above atleast above 155 for its age \n" + advice;
        }
        if (bpm_ > 220) {
            return "your pet's BPM is abnormally HIGH should not be over 220 for its age \n" + advice;
        }
        return "your pet's BPM is at an healthy rate";
    }
    if (size == 'small') {
        if (bpm_ < 66) {
            return "your pet's BPM is abnormally low should be above atleast above 70 for its size \n" + advice;
        }
        if (bpm_ > 180) {
            return "your pet's BPM is abnormally HIGH should not be over 180 for its size \n" + advice;
        }
        return "your pet's BPM is at an healthy rate";
    }
    if (bpm_ < 57) {
        return "your pet's BPM is abnormally low should be above atleast above 60 for its size \n" + advice;
    }
    if (bpm_ > 140) {
        return "your pet's BPM is abnormally HIGH should not be over 140 for its size \n" + advice;
    }
    return "your pet's BPM is at an healthy rate";
}

function HealthSaveAsTXT($scope,saveAsName)
{
    var txt = new Blob([$scope.diagnose], { type: "text/plain;charset=utf-8" });
    saveAs(txt, saveAsName + ".txt");
    $scope.saveAsText = "";
}

var newWaitingTime = 250;
var newBitsArr = [];
var newBPM = 60;
var currI_ = 0;

function installSentBits($scope,array,avg)
{
	printArr = new Array(array.length);
	newBitsArr = new Array(array.length);
	for (var i = 0; i < newBitsArr.length; i++) {
		newBitsArr[i] = getBIT_inGrapth(array[i]);
		printArr[i] = Math.floor(array[i]);
	}
    newBPM = avg;
    newWaitingTime = Math.floor(20000 / newBitsArr.length);
		// timeout gaps according to the length of the array ^
    runningOnArray = true;
    currI_ = -1;
    $scope.recievedBIP = true;
		// if false stops printing on canvas sends for another array
}

function getBIT_inGrapth(number) {
    var temp = Math.floor(number);
    if (temp > 70) { temp = 70; }
    if (temp <= 0) { temp = 0; }
    temp = 90 - temp;
    return temp;
}


var SymtmsNames;
var SymtmsPicks;
var SYMc = 0;
var symptmsSendEvent;

function symptomsBOXshow($scope, $rootScope, $http) {
    var myRequest = '?command=GetSymptoms';
    $http.get($rootScope.SA + myRequest, { timeout: 50000 })
    .then(function (result) {
        var answer = eval(result).data;
        if (answer.title == 'error') { alert(answer.log); return; }
        var d = document.getElementById('medicalBOX');
        var stnHTML = '<div class="symptms_Rpciks">';
        var n = answer.log.length;
        SymtmsNames = new Array(n);
        SymtmsPicks = new Array(n);
        SYMc++;
        for (var i = 0; i < n; i++) {
            SymtmsNames[i] = answer.log[i].symname;
            SymtmsPicks[i] = '#b3ff99';
        }
        for (var i = 0; i < answer.log.length; i++) {
            stnHTML += '<div class="RadioSizeD" onclick="selectSymptom(' + i + ')" ' +
                            ' id="' + SYMc + 'SYM' + i + '" ><b>' + answer.log[i].symname + '</b>' +
                            '<br>' + answer.log[i].symdescription + '</div>';
        }
        stnHTML += '<button class="myBTN" onclick="symptmsSendEvent()">SEND</button></div>';
        d.innerHTML = stnHTML;
        showPopUp('mySymptoms');
    })
    .catch(function (data, status, headers, config) {
        alert(GetErrText("Server isn't responding..", data, status, headers, config));
    });
}

function selectSymptom(i) {
    if (SymtmsPicks[i] == 'white') {
        SymtmsPicks[i] = '#b3ff99';
        document.getElementById(SYMc + 'SYM' + i).style.backgroundColor = '#b3ff99';
    }
    else {
        SymtmsPicks[i] = 'white';
        document.getElementById(SYMc + 'SYM' + i).style.backgroundColor = 'white';
    }
}


var getiLLnessEvent;
function getSymptomsAnalyze($scope,$rootScope,$http) {
    //{"syms":["a","b","c"]}
    var symptmsOBJ = '{"syms":["null"';
    for (var i = 0; i < SymtmsNames.length; i++) {
        if (SymtmsPicks[i] == 'white') {
            symptmsOBJ += ',"' + SymtmsNames[i] + '"';
        }
    }
    symptmsOBJ += ']}';
    var myRequest = '?command=getIllnessAnlyz&symtms=' + symptmsOBJ;
    var d = document.getElementById('medicalBOX');
    $http.get($rootScope.SA + myRequest, { timeout: 50000 })
    .then(function (result) {
        var answer = eval(result).data;
        if (answer.title == 'error') { d.innerHTML = answer.log; return; }
        d.innerHTML = "";
        for (var i = 0; i < answer.log.length; i++) {
            d.innerHTML += '<div class="RadioSizeD" onclick="getiLLnessEvent(\'' + answer.log[i].illname + '\')" ' +
                            '><b>' + answer.log[i].illname + '</b>' +
                            '<br>Symptoms matches the illness : ' + answer.log[i].c + '</div>';
        }
    })
    .catch(function (data, status, headers, config) {
        alert(GetErrText("Server is dead....", data, status, headers, config));
    });
}

function getIllnessDits(illness, $scope, $rootScope, $http) {
    //showPopUp('illnessBox');
    var d = document.getElementById('illnessDIV');
    var myRequest = '?command=getIllnessDesc&illName='+illness;
    $http.get($rootScope.SA + myRequest, { timeout: 50000 })
    .then(function (result) {
        var answer = eval(result).data;
        if (answer.title == 'error') { alert(answer.log); return; }
        d.innerHTML = "";
        d.innerHTML += '<b>Illness name<br>' + answer.log[0].illname + '</b><br><b>(' +
            answer.log[0].eng_name + ')</b><hr class="Myhr">Physical causes : <hr>' + answer.log[0].physical_causes +
            '<hr>Mental causes : <hr>' + answer.log[0].mental_causes +
            '<hr class="Myhr">Full symptoms<hr>';
        //__________DOC report____________________________//
        $scope.diagnose = '(1)illness name : \n' + answer.log[0].illname + '\n(' + answer.log[0].eng_name + ')\n' +
                           '\n(2)Physical causes : \n' + answer.log[0].physical_causes + '\n\n(3)Mental causes : \n' +
                           answer.log[0].mental_causes + '\n\n(4)Full symptoms : \n';
        //_________________________________________________//
        for (var i = 0; i < answer.log.length; i++) {
            d.innerHTML += '<p><b>' + answer.log[i].symname + '</b><br>' + answer.log[i].symdescription + '</p>';
            $scope.diagnose += answer.log[i].symname + '\n' + answer.log[i].symdescription + '\n\n';
        }
        d.innerHTML += '<hr class="Myhr">illness details<hr>' + answer.log[0].illdescription +
                        '<hr class="Myhr">Diagnosis<hr>' + answer.log[0].ill_diagnose +
                        '<hr class="Myhr">illness managment<br>(always consult with a vet)' +
                        ': <hr>' + answer.log[0].ill_managment;
        //__________DOC report____________________________//
        $scope.diagnose += '\n(5)illness details : \n' + answer.log[0].illdescription + '\n\n(6)Diagnosis : \n' +
                            answer.log[0].ill_diagnose + '\n\n' +
                            '(7)illness managment : \n(always consult with a vet)\n' + answer.log[0].ill_managment;
        //_________________________________________________//

        showPopUp('illnessBox');
    })
    .catch(function (data, status, headers, config) {
        alert(GetErrText("Server is dead....", data, status, headers, config));
    });
}