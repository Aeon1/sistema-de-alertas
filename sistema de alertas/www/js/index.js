
function captureSuccess(mediaFiles) {
        var i, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            //uploadFile(mediaFiles[i]);
        }
    }

    // Called if something bad happens.
    //
    function captureError(error) {
        var msg = 'An error occurred during capture: ' + error.code;
        navigator.notification.alert(msg, null, 'Uh oh!');
    }

    // A button will call this function
    //
    function captureImage() {
        // Launch device camera application,
        // allowing user to capture up to 2 images
        navigator.device.capture.captureImage(captureSuccess, captureError, {limit: 2});
    }