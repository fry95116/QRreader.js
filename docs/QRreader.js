(function () {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }


    function QRreader() {

        this.frame = null
        this.display = null
        this.camera_idx = 0
        this.constraints = [
            { audio: true, video: { facingMode: "user" } },
            { audio: true, video: { facingMode: { exact: "environment" } } }
        ]

        this.constructor = function(){

            var stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.75)
            var content = ''
                + '<video class="absolute-center" autoplay="autoplay" muted="muted" playsinline></video>'
                + '<div class="absolute-center aperture" style="width:' + stride + 'px; padding-bottom:' + stride + 'px;" >'
                + '<hr class="scan-line">'
                + '</div>'
                + '<bitton class="btn-switch" onclick="switchDevice()"></bitton>'


            this.frame = document.createElement('div')
            this.frame.className="QRreader-mask"
            this.frame.innerHTML = content

        }

        this.showFrame = function () {
            document.body.appendChild(this.frame)
        }

        this.hideFrame = function(){
            document.body.removeChild(this.frame)
        }

        this.toggleFrame = function(){
            if(document.body.contains(this.frame)) this.hideFrame()
            else this.showFrame()
        }

        this.isSupported = function () {
            return isNotNil(isNotNil(this.getMediaDevices()))
        }

        /** 获取MediaDevices接口，如果不支持则返回null */
        this.getMediaDevices = function () {
            var res = null

            if (isNotNil(navigator)) {
                if (isNotNil(navigator.mediaDevices) && this._isMediaDevices(navigator.mediaDevices)) {
                    res = navigator.mediaDevices
                }
                else if (this._isMediaDevices(navigator)) {
                    res = navigator
                }
                else if (isNotNil(navigator.webkitEnumerateDevices) && isNotNil(navigator.webkitGetUserMedia)) {
                    navigator.enumerateDevices = navigator.webkitEnumerateDevices
                    navigator.getUserMedia = navigator.webkitGetUserMedia
                    res = navigator
                }
            }

            else if (isNotNil(MediaDevices) && this._isMediaDevices(MediaDevices)) {
                res = MediaDevices
            }

            return res
        }

        this._isMediaDevices = function(test){
            return isNotNil(test.enumerateDevices) && isNotNil(test.getUserMedia)
        }

        this.constructor()
    }

    window.QRreader = QRreader
})()
