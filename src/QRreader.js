(function () {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }


    function QRreader() {

        this.frame = null
        this.display = null
        this._idx_camera = 0
        this.constraints = [
            { audio: true, video: { facingMode: "user" } },
            { audio: true, video: { facingMode: { exact: "environment" } } }
        ]

        this.constructor = function () {

            var btn_switch = document.createElement('button')
            btn_switch.className = 'btn-switch'
            // btn_switch.addEventListener('click',function(e){
            //     switchDevice()
            // })

            var scanLine = document.createElement('hr')
            scanLine.className = 'scan-line'

            var stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.75)
            var aperture = document.createElement('div')
            aperture.className = 'absolute-center aperture'
            aperture.style.width = stride + 'px'
            aperture.style.paddingBottom = stride + 'px'
            aperture.appendChild(scanLine)

            this.display = document.createElement('video')
            this.display.setAttribute('autoplay', 'autoplay')
            this.display.setAttribute('muted', 'muted')
            this.display.setAttribute('playsinline', 'playsinline')

            this.frame = document.createElement('div')
            this.frame.className = 'QRreader-mask'
            this.frame.appendChild(this.display)
            this.frame.appendChild(aperture)
        }

        this.showFrame = function () {
            document.body.appendChild(this.frame)
            var mediaDevices = this.getMediaDevices()
            if (mediaDevices === null) alert('mediaDevices API not supported')
            this._idx_camera = (this._idx_camera + 1) % this.constraints.length
            var constraints = this.constraints[this._idx_camera]
            this._idx_camera++
            mediaDevices.getUserMedia(constraints)
                .then((stream)=>{
                    this.display.srcObject = stream
                })
                .catch((err)=>{
                    if (err instanceof OverconstrainedError) {
                        mediaDevices.getUserMedia({ video: true, audio: false })
                            .then((stream) => {
                                this.display.srcObject = stream
                            })
                            .catch((err) => console.log('Error occured: ' + err.message))
                    }
                    console.log('Error occured: ' + err.message)
                })
        }

        this.hideFrame = function () {
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
