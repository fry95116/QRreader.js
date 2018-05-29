(function () {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }


    function QRreader() {

        this.frame = null
        this.display = null
        this.isFront = false
        this.stride = 0.618
        this.constructor = function () {

            var stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * this.stride)
            stride = Math.min(stride, 420)

            var content = ''
                + '<video autoplay="autoplay" muted="muted" playsinline></video>'
                + '<div class="content-center">'
                    + '<div class="aperture" style="width: ' + stride + 'px; height: ' + stride + 'px;">'
                        + '<div class="scan-line"></div>'
                        + '<div class="vertex left-bottom"></div>'
                        + '<div class="vertex right-bottom"></div>'
                        + '<div class="vertex left-top"></div>'
                        + '<div class="vertex right-top"></div>'
                    + '</div>'
                    + '<div class="tips">将二维码放入取景框中</div>'
                + '</div>'
                + '<button class="btn-cancel">&times;</button>'
                + '<button class="btn-switch">切换设备</buttion>'
            this.frame = document.createElement('div')
            this.frame.className = 'QRreader-mask'
            this.frame.innerHTML = content

            this.display = this.frame.getElementsByTagName('video')[0]
            this.frame.querySelector('.btn-switch').addEventListener('click',()=>{
                this.isFront = !this.isFront
                this._setCamera(this.isFront)
            })
        }

        this._setCamera = function(){
            var mediaDevices = this.getMediaDevices()
            if (mediaDevices === null) alert('mediaDevices API not supported')
            else{
                var constraints = { video: { facingMode: (this.isFront? "user" : "environment") } };
                mediaDevices.getUserMedia(constraints)
                .then((stream)=>{
                    this.display.srcObject = stream
                })
                .catch((err)=>{
                    console.log('Error occured: ' + err.message)
                })
            }

        }
        this._showFrame = function () {
            document.body.appendChild(this.frame)
            this._setCamera()
        }

        this._hideFrame = function () {
            document.body.removeChild(this.frame)
        }

        this.toggleFrame = function () {
            if (document.body.contains(this.frame)) this.hideFrame()
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

        this._isMediaDevices = function (test) {
            return isNotNil(test.enumerateDevices) && isNotNil(test.getUserMedia)
        }

        this.constructor()
    }

    window.QRreader = QRreader
})()
