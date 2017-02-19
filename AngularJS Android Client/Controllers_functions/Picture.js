function sendPicRequest($scope)
{
    if (!$scope.petSelectionCheck()) { return; }
    var Messg = '{"from":"' + $scope.OwnerName + '","to":"' + $scope.currentPET[1] + '"}';
    $scope.socket_.emit('RequestImage', Messg);
}

function installPicture($scope)
{
    if ($scope.gotImage == 'null') { return; }
    $scope.removeElem('picDirectiveDiv');
    document.getElementById('placeForPic').style.width = ($scope.docWidth) + 'px';
    $scope.createElem('picDirectiveDiv', 'picture-iframe', 'placeForPic');
    var base_img = new Image();
    base_img.src = $scope.gotImage;
    var canvas = document.getElementById('PictrCanvs');
    var context = canvas.getContext('2d');
    drawImageScaled(base_img, context);
}

function installFullSizePicture($scope)
{
    if ($scope.gotImage == 'null') { return; }
    $scope.removeElem('picDirectiveDiv');
    $scope.createElem('picDirectiveDiv', 'picture-iframe-full-size', 'placeForPic');
    var base_img = new Image();
    var container = document.getElementById('fullSizeDivContainer');
    var myWidth = ($scope.docWidth-25) + 'px';
    container.style.width = myWidth;
    base_img.src = $scope.gotImage;
    var canvas = document.createElement('canvas');
    canvas.width = base_img.width;
    canvas.height = base_img.height;
    var context = canvas.getContext('2d');
    context.drawImage(base_img, 0, 0);
    container.appendChild(canvas);
}

function SaveDaPicture($scope)
{
    $scope.SaveAsErr = "";
    if ($scope.saveAsText == null || $scope.saveAsText == '') {
        $scope.SaveAsErr = "Enter valid name"; return;
    }
    closeBox('SaveAsModal');
    if ($scope.saveAsDiag == true)
    {
        $scope.saveAsDiag = false;
        HealthSaveAsTXT($scope,$scope.saveAsText);
        return;
    }
    var base_img = new Image();
    base_img.src = $scope.gotImage;
    var canvas = document.createElement('canvas');
    canvas.width = base_img.width;
    canvas.height = base_img.height;
    var context = canvas.getContext('2d');
    context.drawImage(base_img, 0, 0);
    canvas.toBlob(function (blob) { saveAs(blob, $scope.saveAsText + ".jpg"); }, "image/jpg");
    $scope.saveAsText = "";
}

function InstallSaveAsWindow($scope)
{
    if ($scope.gotImage == 'null') { alert("picture data doesn't exists"); return; }
    var SaveAsModalw = document.getElementById('SaveAsModal');
    $scope.SaveAsErr = "";
    $scope.saveAsText = "";
    SaveAsModalw.style.display = "block";
}

function drawImageScaled(img, ctx)
{
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
                       centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}