(function () {
    // init service worker
    if (navigator.serviceWorker != null) {
        navigator.serviceWorker.register('sw.js')
            .then(function (registration) {
                console.log('Registered events at scope: ', registration.scope);
            });
    }

    // get network info
    var statusEl = document.querySelector('#network-status')
    if (!navigator.onLine) {
        statusEl.classList = ['is-offline']
        statusEl.innerText = 'Offline'
    }

    // for some reason safari on mac can debug ios safari page but not ios home screen web apps 

    var msg = document.querySelector('.main-text')
    msg.innerHTML += getSupportInfo().join('<br>')

    function getSupportInfo() {
        return [
            'navigator : ' + typeof navigator,
            'MediaDevices:' + typeof MediaDevices,
            'navigator.mediaDevices: ' + typeof navigator.mediaDevices,
            'navigator.getUserMedia: ' + typeof navigator.getUserMedia,
            'navigator.webkitGetUserMedia: ' + typeof navigator.webkitGetUserMedia
        ]
    }

    qrReader.hook(document.getElementsByClassName('btn-scanner')[0], function(ret){
        alert(ret)
    })
})()
