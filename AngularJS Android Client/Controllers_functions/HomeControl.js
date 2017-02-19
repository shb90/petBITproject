angular.module('myApp')
.controller('homeCtrl', function ($scope, $rootScope, $http, $compile, $window)
{
		// Arguments installment
    $scope.petsNames = [];
    $scope.petsNumbers = [];
    $scope.petsAges = [];
    $scope.petsSizes = [];
    $scope.petsIcons = [];
    $scope.friendsLi = [];
    $scope.friendsPetsGPSLat = [];
    $scope.friendsPetsGPSLon = [];
    $scope.friendPetsNames = [];
    $scope.messages = [];
    $scope.CloseOpenTabs = new Array(5);
    $scope.onTheMap = new Array(1);
    $scope.MSGstatus = '';
    $scope.gotImage = 'null';
    $rootScope.loadHomePage = function (MyUserName)
    {
        document.getElementById('IDcontn_').innerHTML = '<div class="profLeft">' +
                            '<b id="profTEXT">No pet has been selected<br />select pet form the list<br /></b>' +
                            '</div>' +
                            '<div class="profRight">' +
                            '<img src="images/NoPetsProf.png" id="profIMG" />' +
                            '</div>';
        $scope.OwnerName = MyUserName;
        $scope.currentPET = ['null', 'null','null'];
        $scope.OnfriendsWatch = false;
        $scope.friendOwnerUsername = 'null';
        for (var i = 0; i < $scope.CloseOpenTabs.length; i++)
        { $scope.CloseOpenTabs[i] = 'close'; }
        $scope.onTheMap = new Array(1);
        $scope.onTheMap[0] = "Not selected";
        $scope.myMap = "null";
        $scope.friendsPetsNumbers = [];
        $scope.setMSGstatus();
        $scope.socket_ = new Object();
        $scope.socket_ = io($rootScope.SA);
        $scope.socket_.on('RecievedMessage' + $scope.OwnerName, function (msg) { alert(msg); });
        $scope.socket_.on('RecievedImage' + $scope.OwnerName, function (image) {
            alert('Recieved new image');
            $scope.gotImage = 'data:image/jpg;base64,' + image;
            installPicture($scope);
        });
        $scope.socket_.on('takeLocation' + $scope.OwnerName, function (lat, lon) {
            animateMovment($scope, lat, lon);
        });
        $scope.socket_.on('takeHeartBit' + $scope.OwnerName, function (array, avg) {
            installSentBits($scope, array, avg);
        });
        $rootScope.logOffEvent = $scope.LogOff = function () { SetLogoff($scope, $rootScope); };
    };
		// update status if there are NEW messages
    $scope.setMSGstatus = function ()
    {
        var myRequest = '?command=GetNewMessagesNotice&userName=' + $scope.OwnerName;
        $http.get($rootScope.SA + myRequest)
        .then(function (result)
        {
            var answer = eval(result).data;
            $scope.MSGstatus = answer.log
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Can't reach server", data, status, headers, config));
        });
    };
		// get user pet list from server
    $scope.setMyPetsList = function ()
    {
        if ($scope.CheckIfClosing(0)) { return; }
        $scope.getMyPetsList();
    };
    $scope.getMyPetsList = function ()
    {
        $scope.removeElem('PLiDir');
        var myRequest = '?command=GetPetsList&userName=' + $scope.OwnerName;
        $http.get($rootScope.SA + myRequest)
        .then(function (result)
        {
            var answer = eval(result).data;
            if (answer.title == 'error') {
                MakeErrDiv(answer.log, 'PLiDir', 'petslistDiv');
                return;
            }
            $scope.petsNames = new Array(answer.log.length);
            $scope.petsNumbers = new Array(answer.log.length);
            $scope.petsIcons = new Array(answer.log.length);
            $scope.petsAges = new Array(answer.log.length);
            $scope.petsSizes = new Array(answer.log.length);
            for (var i = 0; i < answer.log.length; i++) {
                $scope.petsNames[i] = answer.log[i].petname;
                $scope.petsNumbers[i] = answer.log[i].petnumber;
                $scope.petsIcons[i] = answer.log[i].icon;
                $scope.petsAges[i] = answer.log[i].age;
                $scope.petsSizes[i] = answer.log[i].size;
            }
            $scope.createElem('PLiDir', 'pet-list-directive', 'petslistDiv');
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Can't reach the server", data, status, headers, config));
        });
    };
		// on click shows # of meters from friend pet on the map
	$scope.DistanceFromFriend = friendDistancePointer = function (petName,Lat,Lon)
    {
        var latlngA = new google.maps.LatLng({ lat: $scope.myLatLon[0], lng: $scope.myLatLon[1] });
        var latlngB = new google.maps.LatLng({ lat: Lat, lng: Lon });
        var distance = Math.floor(getDistance(latlngA, latlngB));
        alert('The distance between you and '+petName+'<hr>'+distance+' meters');
    };
    $scope.removeElem = function (elemnt)
    {
        var element = angular.element(document.querySelector('#' + elemnt));
        element.remove();
    };
    $scope.CheckIfClosing = function (index)
    {
        if ($scope.CloseOpenTabs[index] == 'open') { $scope.CloseOpenTabs[index] = 'close'; return true; }
        $scope.CloseOpenTabs[index] = 'open'; return false;
    };
		// against markers duplications
    $scope.CheckIfOnTheMap = function (phone)
    {
        for (var i = 0; i < $scope.onTheMap.length; i++) {
            if (phone == $scope.onTheMap[i]) { return true; }
        }
        return false;
    };
    $scope.AddOnTheMap = function (phone)
    {
        $scope.onTheMap = $rootScope.AddToArray($scope.onTheMap, phone);
    };
    $scope.removeOnTheMap = function (phone)
    {
        for (var i = 1; i < $scope.onTheMap.length; i++) {
            if ($scope.onTheMap[i] == phone) { $scope.onTheMap[i] = ""; }
        }
    };
    $scope.createElem = function (id, directive, holderDiv)
    {
        var el = '<div id="' + id + '" ' + directive + '></div>';
        var element = angular.element(document.querySelector('#' + holderDiv));
        var generated = element.html(el);
        $compile(generated.contents())($scope);
    };
    $scope.petsContacts = function (petsName)
    {
        var i = $scope.getPetIndexx(petsName);
        $scope.currentPET = [petsName, $scope.petsNumbers[i], $scope.petsIcons[i] + '.png',
                                $scope.petsAges[i],$scope.petsSizes[i]];
        $scope.onTheMap[0] = $scope.currentPET[1];
        alert('Monitoring ' + $scope.currentPET[0] + '<br>Number : ' + $scope.currentPET[1] +
                    '<br><img src="Markers/' + $scope.currentPET[2]+'" /><br>' +
                    '<p>Age/Size = ' + $scope.currentPET[3] + '/' + $scope.currentPET[4] + '</p>');
        changeProf(petsName, $scope.currentPET[1], $scope.currentPET[2], $scope.currentPET[3], $scope.currentPET[4]);
    };
    $scope.getPetIndexx = function (petName) {
        for (var i = 0; i < $scope.petsNames.length; i++)
        { if ($scope.petsNames[i] == petName) { return i; } }
        return 0;
    }
    $scope.getPetNumber = function (petName)
    {
        for (var i = 0; i < $scope.petsNames.length; i++)
        { if ($scope.petsNames[i] == petName) { return $scope.petsNumbers[i]; } }
        return $scope.petsNumbers[0];
    };
    $scope.getPetIcon = function (petName) {
        for (var i = 0; i < $scope.petsNames.length; i++)
        { if ($scope.petsNames[i] == petName) { return $scope.petsIcons[i]; } }
        return $scope.petsIcons[0];
    };
    $scope.IconsApplied = false;
    $scope.AddPet = function ()
    {
        if (!$rootScope.checkFields(['addpet', $scope.petNameText, $scope.petNumberText], 'OwnerSignup'))
        { alert('Enter valid info'); return; }
        if ($scope.IconsApplied == false)
        {
            $scope.IconsCollection = new Array(21);
            for (var i = 0; i < $scope.IconsCollection.length; i++) {
                $scope.IconsCollection[i] = i;
            }
            $scope.createElem('iconListPick', 'icon-pick-list', 'placeForIcons');
            $scope.IconsApplied = true;
        }
        showPopUp('IconBox');
    };
    $scope.SendPetAddRequest = function (iconNum) {
        closeBox('IconBox');
        $scope.iconNumS = iconNum;
        showPopUp('sizeAgeBox');
    };
    $scope.iconNumS = '0';
    $scope.SendFinalPetAddRequest = function () {
        //currentSizeD , totalRangeV
        closeBox('sizeAgeBox');
        var iconNum = $scope.iconNumS;
        alert(currentSizeD + ' , ' + totalRangeV + ' , ' + iconNum);
        var myRequest = '?command=AddPetToOwner&OwnerName=' + $scope.OwnerName + '&petName=' +
                $scope.petNameText + '&petNumber=' + $scope.petNumberText + '&petIcon=' + iconNum + 
                                '&age=' + totalRangeV + '&size=' + currentSizeD;
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            alert(answer.log);
            if (answer.title != 'error') { $scope.getMyPetsList(); }
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Can't reach the server", data, status, headers, config));
        });
    };
    $scope.petSelectionCheck = function ()
    {
        if ($scope.currentPET[0] == 'null' || $scope.currentPET[1] == 'null')
        { alert("<b>please pick a pet from the list</b>"); return false; }
        return true;
    };
    $scope.myMap = "null"; $scope.myLatLon = new Array(2);
    $scope.setLocation = function () {
        installTheMap($scope, $rootScope, $http);
    };
    $scope.radiusPickListApplied = false;
    $scope.getRadius = function () {
        if (!$scope.petSelectionCheck()) { alert('Select a pet'); return; }
        if ($scope.myMap == "null") { return; }
        if (!$scope.radiusPickListApplied)
        {
            $scope.radiusCollection = [25, 50, 100, 150, 200, 250, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
            $scope.createElem('radiusPickListt', 'radius-pick-list', 'placeForRadius');
            $scope.radiusPickListApplied = true;
        }
        showPopUp('RadiusBox');
    };
    $scope.makeRadius = function (distance) {
        $scope.radiusInputErr = '';
        if (distance == '' || distance == null) { 
            $scope.radiusInputErr = 'invalid input'; return; }
        if (isNaN(distance)) { 
            $scope.radiusInputErr = 'Enter a number'; return;
        }
        var d = parseInt(distance);
        if (d > 15000) { 
            $scope.radiusInputErr = 'Enter a number below 15,000'; return; }
        closeBox('RadiusBox');
        PutMapRadius($scope,d);
    }
    $scope.AddMarkersToMap = function (lat, lon, Title, Line, PNGfile) {
        AddMarker($scope, lat, lon, Title, Line, PNGfile);
    };
    $scope.sendMyChatbox = function ()
    {
        var text = $scope.OwnerName + ' : ' + $scope.msgChatText;
        var msg = '{"from":"' + $scope.OwnerName + '","to":"' + $scope.friendOwnerUsername + '","message":"' + text + '"}';
        $scope.socket_.emit('sendMessage', msg);
        document.getElementById('myModal').style.display = "none";
    };
    $scope.setMessages = function ()
    {               // MessagesListDiv  || ErrMessages
        $scope.MSGstatus = "No new messages";
        $scope.removeElem('MSGdirectv');
        var myRequest = '?command=GetMessages&userName=' + $scope.OwnerName;
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            if (answer.title == 'error'){ alert(answer.log); return; }
            $scope.messages = new Array(answer.log.length);
            for (var i = 0; i < answer.log.length; i++) {
                $scope.messages[i] = new Object();
                $scope.messages[i].msg = (i + 1) + ')' + answer.log[i].messg;
                var msg = ""; var title = ""; var j;
                for (j = 0; j < answer.log[i].messg.length; j++) {
                    if (answer.log[i].messg[j] == ':') { break; }
                    title += answer.log[i].messg[j];
                }
                for (var k = j+1; k < answer.log[i].messg.length; k++) {
                    msg += answer.log[i].messg[k];
                }
                if (j >= answer.log[i].messg.length) {
                    title = "Anonymous";
                    msg = answer.log[i].messg;
                }
                $scope.messages[i].msg = msg;
                $scope.messages[i].title = title;
                $scope.messages[i].indx = i+1;
            }
            $scope.createElem('MSGdirectv', 'message-list-frame', 'MessagesListDiv');
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Can't reach the server", data, status, headers, config));
        });
    };
    $scope.insertNewComment = function (comment)
    {
        $scope.messages = $rootScope.AddToArray($scope.messages, comment);
        $scope.removeElem('MSGdirectv');
        $scope.createElem('MSGdirectv', 'messages-iframe', 'MessagesListDiv');
    };
    //______________________________________________________________________________________________________________//
    $scope.pulseTESTT = function () {
        $scope.socket_.emit('GetPulse', $scope.OwnerName, $scope.currentPET[1]);
    };
    $scope.heartWindowActive = false;
    $scope.animatedPulse_ = false;
    $scope.setHealth = function ()
    {
        if ($scope.CheckIfClosing(2)) { $scope.heartWindowActive = false; return; }
        if (!$scope.petSelectionCheck()) { return; }
        $scope.removeElem('healthDirecDiv');
        $scope.runningTest = false; $scope.StopHeart = false;
        $scope.heartWindowActive = true;
        $scope.animatedPulse_ = false;
        $scope.diagnose = "Click on the Doctor to diagnose " + $scope.currentPET[0] + " health";
        $scope.createElem('healthDirecDiv', 'health-ifram', 'healthSlideDiv');//________________________________________________________//
        $scope.startHeartMonitor = function () {
            if ($scope.animatedPulse_ == true) { return; }
            $scope.animatedPulse_ = true;
            AnimateHeartBeats($scope);
            $scope.socket_.emit('GetPulse', $scope.OwnerName, $scope.currentPET[1]);
        };
    };
    $scope.getDiagnose = function () { DiagnosePet($scope,$rootScope, $http); };
    $scope.saveAsDiag = false;
    $scope.SaveAsDiagnose = function () {
        $scope.saveAsDiag = true;
        showPopUp('SaveAsModal');
    };
    $scope.setPicture = function () { sendPicRequest($scope); };
    $scope.savePicture = function () { SaveDaPicture($scope); };
    $scope.SaveWindow = function () { InstallSaveAsWindow($scope); };
    $scope.RebootPicture = function (size) {
        if (size == 'full')
        {
            installFullSizePicture($scope);
        }
        else
        {
            installPicture($scope);
        }
    };
    $scope.setFriends = function ()
    {
        if ($scope.CheckIfClosing(4)) { return; }
        $scope.getFriendsList();
    };
    $scope.getFriendsList = function ()
    {
        $scope.removeElem('FriendsDirecDiv');
        var myRequest = '?command=GetFriendsList&userName=' + $scope.OwnerName;
        $http.get($rootScope.SA + myRequest)
        .then(function (result) {
            var answer = eval(result).data;
            if (answer.title == 'error'){ alert(answer.log); return; }
            $scope.friendsLi = new Array(answer.log.length);
            for (var i = 0; i < answer.log.length; i++)
            { $scope.friendsLi[i] = answer.log[i].friendname; }
            $scope.createElem('FriendsDirecDiv', 'friend-list-directive', 'friendslistDiv');
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Server doesn't respond", data, status, headers, config));
        });
    };
    $scope.seeFriendPets = function (friend)
    {
        var myRequest = '?command=GetFriendPets&friendName=' + friend;
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            if (answer.title == 'error') { alert(answer.log); return; }
            $scope.friendsPetsGPSLat = new Array(answer.log.length);
            $scope.friendsPetsGPSLon = new Array(answer.log.length);
            $scope.friendPetsNames = new Array(answer.log.length);
            $scope.friendOwnerUsername = friend;
            for (var i = 0; i < $scope.friendsPetsNumbers.length; i++) {
                $scope.removeOnTheMap($scope.friendsPetsNumbers[i]);
            }
            $scope.friendsPetsNumbers = new Array(answer.log.length);
            for (var i = 0; i < answer.log.length; i++) {
                $scope.friendPetsNames[i] = answer.log[i].petname;
                $scope.friendsPetsGPSLat[i] = parseFloat(answer.log[i].lat);
                $scope.friendsPetsGPSLon[i] = parseFloat(answer.log[i].lon);
                $scope.friendsPetsNumbers[i] = answer.log[i].petnumber;
                $scope.AddOnTheMap(answer.log[i].petnumber);
                var lat = $scope.friendsPetsGPSLat[i];
                var lon = $scope.friendsPetsGPSLon[i];
                $scope.AddMarkersToMap(lat, lon, $scope.friendOwnerUsername, $scope.friendPetsNames[i], 'blue_MarkerF.png');
            }
            $scope.OnfriendsWatch = true;
            alert($scope.friendOwnerUsername + ' pets will be displayed on the map\nOpen & close the Map');
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Can't reach the server.....", data, status, headers, config));
        });
    };
    $scope.AddFriend = function ()
    {
        if (!$rootScope.checkFields([$scope.friendNameText], 'nothing'))
        { alert("please enter valid info"); return; }
        var myRequest = '?command=AddFriend&userName=' + $scope.OwnerName + '&friendName=' + $scope.friendNameText;
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            alert(answer.log);
            if (answer.title != 'error') { $scope.getFriendsList(); }
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Server is offline", data, status, headers, config));
        });
    };
    $scope.GetAreaPets = function () {
        if ($scope.myMap == "null") { return; }
        var myRequest = '?command=GetPetsNearMe&lat=' + Math.floor($scope.myLatLon[0]) + '&lon=' + Math.floor($scope.myLatLon[1]);
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            if (answer.title == 'error') { alert(answer.log); return; }
            for (var i = 0; i < answer.log.length; i++) {
                if (!$scope.CheckIfOnTheMap(answer.log[i].petnumber)) {
                    var x = parseFloat(answer.log[i].lat);
                    var y = parseFloat(answer.log[i].lon);
                    $scope.AddMarkersToMap(x, y, '', '', 'darkgreen_MarkerS.png');
                }
            }
        })
        .catch(function (data, status, headers, config) {
            alert(GetErrText("Server isn't responding..", data, status, headers, config));
        });
    };
    $scope.SymptomsBox = function () { symptomsBOXshow($scope, $rootScope, $http); };
    symptmsSendEvent = function () { getSymptomsAnalyze($scope, $rootScope, $http); };
    getiLLnessEvent = function (illness) { getIllnessDits(illness, $scope, $rootScope, $http); };
    $scope.lightONoffValue = 'off';
    $scope.turnFlashLight = function () {
        if (!$scope.petSelectionCheck()) {
            alert('pick a pet'); return;
        }
        if ($scope.lightONoffValue == 'off') {
            $scope.lightONoffValue = 'on';
            document.getElementById('lightSwitchB').innerHTML = 'Turn Light OFF' +
                '<img src="images/lightON.png" style="float:right"/>';
        }
        else {
            $scope.lightONoffValue = 'off';
            document.getElementById('lightSwitchB').innerHTML = 'Turn Light ON' +
                '<img src="images/lightOFF.png" style="float:right"/>';
        }
        $scope.socket_.emit('LightSwitch', $scope.currentPET[1], $scope.lightONoffValue);
    }
});

function myMapClickButtn()
{
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
}

var friendDistancePointer;
function myDistanceClickBuytton(petName,Lat,Lon)
{
    friendDistancePointer(petName,Lat,Lon);
}