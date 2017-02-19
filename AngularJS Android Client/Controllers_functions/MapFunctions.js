function installTheMap($scope,$rootScope,$http)
{
		// check if Map is already active
		// if not get pet latitude longitude from server->raspberry
		// install map
    if ($scope.CheckIfClosing(1)) { $scope.myMap = "null"; return; }
    if (!$scope.petSelectionCheck()) { return; }
    $scope.removeElem('googleMapLocDiv');
    $scope.myMap = "null"; $scope.myLatLon = new Array(2);
    var myRequest = '?command=GetMyPetLocation&myPetNumber=' + $scope.currentPET[1];
    $http.get($rootScope.SA + myRequest, { timeout: 50000 })
    .then(function (result) {
        var answer = eval(result).data;
        if (answer.title == 'error') { alert(answer.log); return; }
        $scope.myLatLon[0] = parseFloat(answer.log[0].lat);
        $scope.myLatLon[1] = parseFloat(answer.log[0].lon);
        $scope.createElem('googleMapLocDiv', 'location-ifram', 'locationSlide');
        document.getElementById('gmap_canvas').style.width = ($rootScope.docWidth-25) + 'px';
        document.getElementById('gmap_canvas').style.border = '1px solid black';
        installMap($scope.myLatLon[0], $scope.myLatLon[1]);
        $scope.MainMarker = -1;
        $scope.AddMarkersToMap($scope.myLatLon[0], $scope.myLatLon[1], $scope.OwnerName, $scope.currentPET[0], 'Markers/' + $scope.currentPET[2]);
        if ($scope.OnfriendsWatch) {
            for (var i = 0; i < $scope.friendPetsNames.length; i++) {
                var lat = $scope.friendsPetsGPSLat[i];
                var lon = $scope.friendsPetsGPSLon[i];
                $scope.AddMarkersToMap(lat, lon, $scope.friendOwnerUsername, $scope.friendPetsNames[i], 'blue_MarkerF.png');
            }
        }
        setTimeout(function () {
            $scope.socket_.emit('GetLocation', $scope.OwnerName, $scope.currentPET[1]);
        }, 1500);
    })
    .catch(function (data, status, headers, config) {
        alert(GetErrText("Can't reach the server", data, status, headers, config));
    });

    function installMap(x, y) {
        var myOptions = {
            zoom: 17,
            center: new google.maps.LatLng(x, y),
            gestureHandling: 'cooperative', // mods cooperative(phones),greedy(all),none,auto
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $scope.myMap = new google.maps.Map(document.getElementById("gmap_canvas"), myOptions);
        acivate_CircleR = false;
    }
}

function AddMarker($scope,lat, lon, Title, Line, PNGfile)
{	// PNGfile => marker.png on the map according to profile
    if ($scope.myMap == "null") { return; }
    if (PNGfile != '' || PNGfile != null) {
        marker = new google.maps.Marker({ map: $scope.myMap, position: new google.maps.LatLng(lat, lon), icon: PNGfile });
    }
    else {
        marker = new google.maps.Marker({ map: $scope.myMap, position: new google.maps.LatLng(lat, lon) });
    }
    if ($scope.MainMarker == -1){
        $scope.MainMarker = marker;
    }
    google.maps.event.addListener(marker, "click");
    if (Title != '') {
        var contnt = "<b>" + Title + "</b><br>" + Line;
        if (PNGfile != '' && PNGfile[0] != 'M') {
            contnt += '<br><img class="LeftPicF" src="images/FriendBoxMessg.png" onclick="myMapClickButtn()"/>';
            contnt += '<img class="RightPicF" src="images/FriendBoxDistance.png" ' +
                'onclick="myDistanceClickBuytton(\'' + Line + '\','+lat+','+lon+')" />';
        }
        infowindow = new google.maps.InfoWindow({ content: contnt });
        infowindow.open($scope.myMap, marker);
    }
}

var times = 0;
function MoveMarker($scope,lat,lon)
{ 		// GPS is unknown
    if (lat == 0 || lon == 0) {
        document.getElementById('loadingGMAPimg').src = 'images/loadingG.gif';
        setTimeout(function () {
            document.getElementById('loadingGMAPimg').src = '';
        }, 1500);
        return;
    }
    $scope.MainMarker.setPosition(new google.maps.LatLng(lat, lon));
    if (times == 0){
        $scope.myMap.panTo(new google.maps.LatLng(lat, lon));
    }
    times++;
		// Move Map focus after 5 movments of the marker
    if (times >= 5) { times = 0; }
    if (acivate_CircleR) {
        if (isInsideCircle($scope, lat, lon) == false) {
            if (activeAlert_ == false) {
                alert($scope.currentPET[0] + ' is out of the assigned borders');
            }
        }
    }
}


var acivate_CircleR = false;
function PutMapRadius($scope,distance)
{		// ALERT if pet crosses boundaries
    if ($scope.myCircle != null && $scope.myCircleCenter != null) {
        $scope.myCircle.setMap(null);
        $scope.myCircleCenter.setMap(null);
    }
    $scope.radiusDistnc = distance;
    var lat = $scope.MainMarker.getPosition().lat();
    var lon = $scope.MainMarker.getPosition().lng();
    $scope.myCircleCenter = marker = new google.maps.Marker({
        map: $scope.myMap, position: new google.maps.LatLng(lat, lon), icon: 'images/TransparentMarker.png'
    });
    $scope.myCircle = new google.maps.Circle({
        map: $scope.myMap,
        radius: distance,
        fillColor: '#009933',
        strokeColor: '#009933'
    });
    $scope.myCircle.bindTo('center', $scope.myCircleCenter, 'position');
    acivate_CircleR = true;
}

google.maps.Circle.prototype.contains = function (latLng) {
    return this.getBounds().contains(latLng) && google.maps.geometry.spherical.computeDistanceBetween(this.getCenter(), latLng) <= this.getRadius();
}
    
function isInsideCircle($scope,latitude,londitude)
{
    if ($scope.myCircle == null) { return false; }
    var latlng = new google.maps.LatLng({ lat: latitude, lng: londitude });
    var temp = $scope.myCircle.getBounds().contains(latlng);
    return temp;
}

function animateMovment($scope,lat,lon)
{
    if ($scope.myMap == "null") { return; }
    MoveMarker($scope, lat, lon);
    $scope.myLatLon[0] = lat;
    $scope.myLatLon[1] = lon;
    setTimeout(function () {
        $scope.socket_.emit('GetLocation', $scope.OwnerName, $scope.currentPET[1]);
    }, 5000);
}
	// distance between point1 ~ point2 (p1,p2)
var getDistance = function (p1, p2) {
    var R = 6378137;
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};

var rad = function (x) {
    return x * Math.PI / 180;
};

function canculateDistance(pointA,pointB)
{
    var earthRadius = 6378137;
    var DistncLat = radiusP(pointB.lat() - pointA.lat());
    var DistncLon = radiusP(pointB.lon() - pointA.lon());
    var alpha = Math.sin(DistncLat / 2) * Math.sin(DistncLat / 2) +
                    Math.cos(radiusP(pointA.lat())) * Math.cos(radiusP(pointB.lat())) *
                        Math.sin(DistncLon / 2) * Math.sin(DistncLon / 2);
    var cotr = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1 - alpha));
    var distance = earthRadius * cotr;
    return distance;
}

function radiusP(p)
{
    return p*Math.PI/180;
}