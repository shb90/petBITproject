angular.module('myApp')
.controller('loginCtrl', function ($scope, $rootScope, $http, $compile)
{
		// onClick login&signUP button
    $scope.myClick = function (commnd)
    {
        if (commnd == 'OwnerSignup' && $scope.phoneDivToggled) { return; }
        if (!$rootScope.checkFields([$scope.userName, $scope.password, $scope.phone], commnd))
        { $scope.ErrorLine = 'Enter valid info, cannot be over 15 characters, phone number 10 digits'; return; }
        $scope.ErrorLine = 'Connecting';
        var myRequest = '?command=' + commnd + '&userName=' + $scope.userName + '&password=' + $scope.password + '&phone=' + $scope.phone;
        $http.get($rootScope.SA + myRequest, { timeout: 50000 })
        .then(function (result) {
            var answer = eval(result).data;
            if (answer.title == 'error') { $scope.ErrorLine = answer.log; return; }
            $scope.loadHomePage(answer.user);
            currentPage = 1; $scope.ErrorLine = '';
            $.mobile.changePage($("#homePage"), "slide", true, true);
        })  // errors notice
        .catch(function (data, status, headers, config) { alert(GetErrText('Cannot connect to Server', data, status, headers, config)); });
    };
    $rootScope.checkFields = function (fieldsArray, command)
    {
        for (var i = 0; i < fieldsArray.length; i++) {
            if (i == 2) {
                if (command != 'OwnerSignup') { break; }
                if (isNaN(fieldsArray[i]) || fieldsArray[i].length != 10) { return false; }
            }
            else {
                if (fieldsArray[i] == null || fieldsArray[i] == "" || fieldsArray[i].length > 15)
                { return false; }
            }
        }
        return true;
    }
    $scope.phoneDivToggled = true;
    $scope.SignupSlide = function () { $scope.phoneDivToggled = !$scope.phoneDivToggled; };
    $rootScope.AddToArray = function (array, elemnt)
    {
        var temp = new Array(array.length + 1);
        for (var i = 0; i < array.length; i++) {
            temp[i] = array[i];
        }
        temp[array.length] = elemnt;
        return temp;
    };
});