(function ($) {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }

    $.fn.QRreader = function(option){

        opt = {
            switchDevice: true,
            readFromAlbum: true
        }
        
        option = $.extend(option, opt, {})
        var reader = new QRreader(option)

        this.each(function(){
            if(this.tagName.toUpperCase() !== 'LABEL'){
                console.log('please load this plugin on <label> element.')
                return
            }
            $(this).click(()=>{
                reader._showFrame()
            })
        })
        


    }

    function QRreader(opt) {

        this._frame = null
        this._display = null
        this._isFront = false
        this._stride = 0.618
        this.switchDevice = opt.switchDevice | true
        this.readFromAlbum = opt.readFromAlbum | true

        var stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * this._stride)

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
                + ''
                + '<label class="btn btn-album" for="QRreader-file-input">相册</label>'
                + '<input id="QRreader-file-input" type="file" accept="image/*">'
            + '</div>'

        this._frame = $(template)
        this._display = $('video', this._frame)

        $('.aperture', this._frame).width(stride).height(stride)

        if(this.switchDevice){
            var $btn_switch = $('<button class="btn btn-switch">切换设备</button>')
            $btn_switch.click(()=>{
                this._isFront = !this.isFront
                this._setCamera(this.isFront)
            })
            this._frame.append($btn_switch)
        }
        if(this.readFromAlbum){
            var $btn_switch = $('<label class="btn btn-album" for="QRreader-file-input">相册</label>')
            var $file_input = $('<input id="QRreader-file-input" type="file" accept="image/*">')
            this._frame.append($btn_switch)
            this._frame.append($file_input)
        }

        $('.btn-cancel', this._frame).click(()=>{
            this._hideFrame()
        })

        $('body').append(this._frame)
    }

    QRreader.prototype.CONSTRAINTS_DEFAULT      = { video: true, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_FRONT = { video: { facingMode: 'user' }, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_BACK  = { video: { facingMode: 'environment' }, audio: false }


    QRreader.prototype._hideFrame = function () {
        if(this._display[0] !== null)
            this._display[0].srcObject = null
        this._frame.hide()
    }

    QRreader.prototype._showFrame = function () {
        this._setCamera()
        this._frame.show()
    }

    QRreader.prototype._setCamera = function(){
        var mediaDevices = this._getMediaDevices()
        if (mediaDevices === null) alert('mediaDevices API not supported')
        else{
            if(this.switchDevice){
                mediaDevices.getUserMedia(this._isFront ? this.CONSTRAINTS_CAMERA_FRONT : this.CONSTRAINTS_CAMERA_BACK)
                .then((stream)=>{this._display[0].srcObject = stream})
                .catch((err)=>{console.log('Error occured: ' + err.message)})
            }
            else{
                mediaDevices.getUserMedia(this.CONSTRAINTS_DEFAULT)
                .then((stream)=>{this._display[0].srcObject = stream})
                .catch((err)=>{console.log('Error occured: ' + err.message)})
            }
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
})(jQuery)
