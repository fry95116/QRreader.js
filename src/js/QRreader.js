(function ($) {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }

    $.fn.QRreader = function(option){

        opt = {
            switchDevice: true,
            readFromAlbum: false
        }
        
        opt = $.extend(option, opt)

        this.each(function(){
            if(this.tagName.toUpperCase() !== 'LABEL'){
                console.log('please load this plugin on <label> element.')
            }
        })
    }



    function QRreader() {

        this.frame = null
        this.display = null
        this.isFront = false
        this.stride = 0.618

        var stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * this.stride)

        var template = ''
            + '<div class="QRreader-mask" style="display: none;">'
                + '<video autoplay="autoplay" muted="muted" playsinline></video>'
                + '<div class="content-center">'
                    + '<div class="aperture">'
                        + '<div class="scan-line"></div>'
                        + '<div class="vertex left-bottom"></div>'
                        + '<div class="vertex right-bottom"></div>'
                        + '<div class="vertex left-top"></div>'
                        + '<div class="vertex right-top"></div>'
                    + '</div>'
                    + '<div class="tips">将二维码放入取景框中</div>'
                + '</div>'
                + '<button class="btn btn-cancel">&lt; 返回</button>'
                + '<button class="btn btn-switch">切换设备</button>'
                + '<label class="btn btn-album" for="QRreader-file-input">相册</label>'
                + '<input id="QRreader-file-input" type="file" accept="image/*">'
            + '</div>'

        this.frame = $(template)
        this.display = $('video', this.frame)

        $('.aperture', this.frame).css({width: stride + 'px', height: stride + 'px'})

        $('.btn-switch', this.frame).click(()=>{
            this.isFront = !this.isFront
            this._setCamera(this.isFront)
        })

        $('.btn-cancel', this.frame).click(()=>{
            this._hideFrame()
        })

        $('body').append(this.frame)
    }

    QRreader.prototype.CONSTRAINTS_DEFAULT      = { video: true, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_FRONT = { video: { facingMode: 'user' }, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_BACK  = { video: { facingMode: 'environment' }, audio: false }


    QRreader.prototype._hideFrame = function () {
        if(this.display[0] !== null)
            this.display[0].srcObject = null
        this.frame.hide()
    }

    QRreader.prototype._showFrame = function () {
        this._setCamera()
        this.frame.show()
    }

    QRreader.prototype._setCamera = function(){
        var mediaDevices = this._getMediaDevices()
        if (mediaDevices === null) alert('mediaDevices API not supported')
        else{
            var constraints = { video: { facingMode: (this.isFront? "user" : "environment") } };
            mediaDevices.getUserMedia(constraints)
            .then((stream)=>{
                this.display[0].srcObject = stream
            })
            .catch((err)=>{
                console.log('Error occured: ' + err.message)
            })
        }
    }

    /** 判断当前上下文是否支持MediaDevices接口 */
    QRreader.prototype.isSupported = function () {
        return isNotNil(this._getMediaDevices())
    }

    /** 获取MediaDevices接口，如果不支持则返回null */
    QRreader.prototype._getMediaDevices = function () {
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

    /** 检查`test`是否实现的MediaDevices接口 */
    QRreader.prototype._isMediaDevices = function (test) {
        return isNotNil(test.enumerateDevices) && isNotNil(test.getUserMedia)
    }

    window.QRreader = QRreader
})(jQuery)
