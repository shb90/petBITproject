var currentPage = 0;
var popUpWindows = ['myAlertLogin', 'myAlertHome', 'myModal', 'SaveAsModal', 'mySymptoms', 'illnessBox'];

function loadJavaScriptElements()
{
    var Alerts = ['Login', 'Home'];
    for (var i = 0; i < Alerts.length; i++) {
        var div = document.createElement('div');
        div.innerHTML = '<div id="myAlert' + Alerts[i] + '" class="modal">' +
                        '<div class="modal-content">' +
                        '<span class="close" style="display:none">×</span>' +
                        '<p><b>Notice</b></p><hr />' +
                        '<p id="myAlert' + Alerts[i] + 'Text"></p><hr />' +
                        '<button onclick="closeMyAlert()">OK</button>' +
                        '</div></div>';
        document.getElementById(Alerts[i] + "AlertDiv").appendChild(div);
    }
}

function closeMyAlert() {
    var myAlertID = popUpWindows[currentPage];
    var myAlert = document.getElementById(myAlertID);
    myAlert.style.display = "none";
    activeAlert_ = false;
}

var activeAlert_ = false;
function alert(text) {
    var myAlertID = popUpWindows[currentPage];
    var myAlert = document.getElementById(myAlertID);
    document.getElementById(myAlertID + 'Text').innerHTML = text;
    myAlert.style.display = "block";
    activeAlert_ = true;
}

function showPopUp(windowID)
{
    var popUp = document.getElementById(windowID);
    popUp.style.display = "block";
}

function GetErrText(TEXT,data, status, headers, config)
{
    var string = TEXT+'<br>';
    string += '<b>Error logs:</b><br>' +
              '<div class="AlrtRemarks">' +
              '<b>DATA</b>: ' + JSON.stringify(data) + '<hr>' +
              '<b>STATUS</b>: ' + JSON.stringify(status) + '<hr>' +
              '<b>HEADER</b>: ' + JSON.stringify(headers) + '<hr>' +
              '<b>CONFIG</b>: ' + JSON.stringify(config) +
              '</div>';
    return string;
}

var foldingDivs = ['phoneSlide', 'petslistDiv', 'addSlide', 'locationSlide', 'friendslistDiv',
            'addFriendSlide', 'MessagesListDiv', 'healthSlideDiv', 'picSlideDiv'];

function SetLogoff($scope,$rootScope)
{
    for (var i = 0; i < foldingDivs.length; i++) {
        $('#' + foldingDivs[i]).css('display', 'none');
    }
    $scope.OwnerName = ""; $scope.currentPET = ['null', 'null'];
    $scope.removeElem('PLiDir'); $scope.removeElem('googleMapLocDiv');
    $scope.removeElem('healthDirecDiv'); $scope.removeElem('picDirectiveDiv');
    $scope.removeElem('FriendsDirecDiv'); $scope.removeElem('MSGdirectv');
    $scope.socket_.emit('forceDisconnect');
    currentPage = 0; $rootScope.logOffEvent = 'null';
    $.mobile.changePage($("#loginPage"), "slide", true, true);
    
}

function removeBase64header(base64string)
{
    var temp = base64string.substring('data:image/png;base64,'.length);
    alert('<div class="AlrtRemarks">' + temp + '</div>');
    return temp;
}

function closeBox(theWindow)
{
    var MyWindow = document.getElementById(theWindow);
    MyWindow.style.display = "none";
}

function loadingOPEN(text) {
    var loadUp = document.getElementById('loadingBox'+currentPage);
    loadUp.style.display = "block";
    document.getElementById('loadingBoxTEXT').innerHTML = text;
}

function loadingClose() {
    var loadUp = document.getElementById('loadingBox'+currentPage);
    loadUp.style.display = "none";
}
		// loading box popup
function makeLoadingBOX(loadingID,appeadTo) {
    var body = '<div id="' + loadingID + '" class="modal">' +
                '<div class="modal-content" style="height: 125px;">' +
                '<span class="close" style="display:none">×</span>' +
                '<p id="loadingBoxTEXT"></p><hr />' +
                '<span class="loadSpan"><img src="images/loadingG.gif" width="50" height="50" /></span>' +
                '</div>' +
                '</div>';
    var box = document.createElement('div');
    box.innerHTML = body;
    document.getElementById(appeadTo).appendChild(box);
}

function totalABS(number,value) {
    var num = parseFloat(number);
    if (num > 12 && value == 'months') { return 12; }
    if (num < 1 && value == 'months') { return 1; }
    if (num > 25 && value == 'years') { return 25; }
    if (num < 0) { return 0; }
    var numF = Math.floor(num);
    var numDif = num - numF;
    if (numDif >= 0.5) {
        return (numF + 1);
    }
    return numF;
}

var monthsRangeV = 1;
var yearsRangeV = 0;
var totalRangeV = 0;
function showRangeValue(number, peragraph, values) {
    var num = totalABS(number, values);
    var extra = '';
    if (values == 'years' && num == 25) {
        extra = 'or more';
    }
    if (values == 'months' && num == 1) {
        extra = 'or less';
    }
    if (values == 'years') { yearsRangeV = num; }
    else { monthsRangeV = num; }
    installTotalV();
    document.getElementById(peragraph).innerHTML = num + ' ' + values + ' ' + extra;
}

function installTotalV() {
    var temp = yearsRangeV + '.' + monthsRangeV;
    totalRangeV = parseFloat(temp);
}

var radioArr = ['smallDogD','mediDogD','bigDogD'];
var currentSizeD = 'small';

function pickSizeDog(size, divId) {
    $('#' + divId).css('background-color', '#d7ffcc');
    currentSizeD = size;
    for (var i = 0; i < radioArr.length; i++) {
        if (radioArr[i] != divId) {
            $('#' + radioArr[i]).css('background-color', '#b3ff99');
        }
    }
}

	// popup error
function MakeErrDiv(text, newDIVid, ContainerID) {
    var newDiv = document.createElement('div');
    newDiv.id = newDIVid;
    newDiv.innerHTML = '<p class="Err">' + text + '</p>';
    document.getElementById(ContainerID).appendChild(newDiv);
}

	// change pet profile div
function changeProf(name, number, icon, age, size) {
    document.getElementById('profIMG').src = 'Markers/' + icon;
    document.getElementById('profTEXT').innerHTML = name + '<br>' + number + '<br>' +
                                      'Age: ' + age + ' pet size: ' + size;
}