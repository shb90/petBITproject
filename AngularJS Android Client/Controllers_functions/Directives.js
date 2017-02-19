angular.module('myApp')
.directive('petListDirective', function () {
    return {
        template: '<ol id="petistData" class="rectangle-list">' +
                    '<li ng-repeat="i in petsNames"><a ng-click="petsContacts(i)">{{i}}</a></li>' +
                  '</ol>'
    };
})
.directive('locationIfram', function () {
    return {
        template:  "<span style='height: 357px;'>" +
                        "<div id='gmap_canvas' style='height:357px;width:500px;'></div>" +
                        "<img id='loadingGMAPimg' " +
                        " style='height:40px;width:40px;' />" +
                    "</span>"
    };
})
.directive('healthIfram', function () { //healthDigA
    return {
        template: '<canvas id="myCanvs" width="250" height="100" class="myCanvas"></canvas>' +
                    '<hr><img src="images/HeartBeat.png" ng-click="startHeartMonitor()" /><hr>' +
                    '<div class="healthDigA" id="diagnoseDiv">{{DocDiogns_}}</div>' +
                    '<div class="healthDigB"><div class="BlockDocIcon">' +
                    '<img ng-click="SymptomsBox()" src="images/Symptoms.png" /></div>' +
                    '<img src="images/Doctor.png" ng-click="getDiagnose()"/>' + 
                    '<img src="images/SaveMINI.png" ng-click="SaveAsDiagnose()" /></div>'
    };
})
.directive('pictureIframe', function () {
    return {
        template: "<span><img src='images/Save.png' ng-click='SaveWindow()'/>" +
                   "<img src='images/ZoomIN.png' ng-click=\"RebootPicture('full')\" />" +
                    "<hr><canvas id='PictrCanvs'></canvas></span>"
    };
})
.directive('pictureIframeFullSize', function () {
    return {
        template: "<span><img src='images/Save.png' ng-click='SaveWindow()'/>" +
                   "<img src='images/ZoomOUT.png' ng-click=\"RebootPicture('small')\" />" +
                     "<hr><div class='fullSizeDiv' id='fullSizeDivContainer'>" +
                        "</div></span>"
    };
})
.directive('friendListDirective', function () {
    return {
        template: '<ol id="friendsOListDiv" class="rectangle-list">' +
                    '<li ng-repeat="i in friendsLi"><a ng-click="seeFriendPets(i)">{{i}}</a></li>' +
                    '</ol>'
    };
})
.directive('messagesIframe', function () {
    return {
        template: '<table style="width:100%"><tr ng-repeat="i in messages"><td>{{i}}</td></tr></table>'
    };
})
.directive('iconPickList', function () {
    return {
        template: '<div ng-repeat="i in IconsCollection" align="center">' +
                    '<div ng-click="SendPetAddRequest(i)" class="DivIcon">' +
                    '<img src="Markers/{{i}}.png" /></div><br>' +
                    '</div>'
    };
})
.directive('radiusPickList', function () {
    return {
        template: '<div ng-repeat="i in radiusCollection" align="center">' +
                    '<div ng-click="makeRadius(i)" class="DivIcon"><b>{{i}} meters</b></div><br>' +
                    '</div><div class="DivIcon">' +
                    '<input type="text" ng-model="radiusMeterText" class="myTextInpt" /><br>{{radiusInputErr}}<br>' +
                    '<button ng-click="makeRadius(radiusMeterText)" class="myBTN">Other</button>' +
                    '</div>'
    };
})
.directive('messageListFrame', function () {
    return {
        template: '<div ng-repeat="i in messages" align="center">' +
                    '<div class="MSGboxframeC"><div class="MSGboxframeA">{{i.indx}}</div>' + 
                    '<div class="MSGboxframeB">{{i.title}}</div><hr><p>{{i.msg}}</p>' +
                    '</div><br>' +
                    '</div>'
    };
});