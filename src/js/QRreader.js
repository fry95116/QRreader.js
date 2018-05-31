(function ($) {
    /** 检查`test`是否不为undefined或者null */
    function isNotNil(test) {
        return typeof (test) != undefined || typeof (test) != null
    }

    function waitUntil(condition, timeout){
        timeout = timeout || -1
        var startTime =  new Date().getTime()
        return new Promise(function(resolve, reject){
            function waitLoop(){
                setTimeout(function(){
                    if(timeout > 0 && new Date().getTime() - startTime > timeout) reject(new Error('time out'))
                    else if(condition()) resolve()
                    else waitLoop()
                }, 100)
            }

            waitLoop()
        })
    }
    /** 获取MediaDevices接口，如果不支持则返回null */
    function getMediaDevices () {
        var res = null

        if (isNotNil(navigator)) {
            if (isNotNil(navigator.mediaDevices) && isMediaDevices(navigator.mediaDevices)) {
                res = navigator.mediaDevices
            }
            else if (isMediaDevices(navigator)) {
                res = navigator
            }
            else if (isNotNil(navigator.webkitEnumerateDevices) && isNotNil(navigator.webkitGetUserMedia)) {
                navigator.enumerateDevices = navigator.webkitEnumerateDevices
                navigator.getUserMedia = navigator.webkitGetUserMedia
                res = navigator
            }
        }

        else if (isNotNil(MediaDevices) && isMediaDevices(MediaDevices)) {
            res = MediaDevices
        }

        return res
    }

    /** 检查`test`是否实现的MediaDevices接口 */
    function isMediaDevices (test) {
        return isNotNil(test.enumerateDevices) && isNotNil(test.getUserMedia)
    }

    function decodeFromFile(file){
        return new Promise((resolve, reject)=>{
            var reader = new FileReader()
            reader.onload = function(e) {
                try{
                    res = qrcode.decode(e.target.result);
                    resolve(res)
                }
                catch(err){
                    reject(err)
                }
            }
            reader.readAsDataURL(file);	
        })
    }

    $.fn.QRreader = function(option, onMsg){

        var opt = {
            switchDevice: true,
            readFromAlbum: true,
            onDetected: null
        }
        
        option = $.extend({}, opt, option)

        alert(getMediaDevices())
        if(false){
            var reader = new QRreader(option)

            this.each(function(){
                if(this.tagName.toUpperCase() !== 'LABEL'){
                    console.log('please load this plugin on <label> element.')
                    return
                }
                $(this).click(()=>{
                    reader._setCamera()
                        .then(()=>reader._showFrame())
                        .then(()=>reader._startCapture())
                        .then((res)=>{
                            reader._clearCapture()
                            reader._hideFrame()
                            if(option.onDetected) option.onDetected(res)
                        })
                        .catch((err)=>{
                            console.log('Error occured: ' + err.message)
                            // if(window.iOS) alert('Error occured: ' + err.message)
                        })
                })
            })
        }
        else{
            this.each(function(){
                if(this.tagName.toUpperCase() !== 'LABEL'){
                    console.log('please load this plugin on <label> element.')
                    return
                }
                this.setAttribute('for', 'QRreader-file-input')
                var $file_input = $('<input id="QRreader-file-input" type="file" accept="image/*">')
                $file_input.change(function(){
                    if(this.files.length === 0) return
                    decodeFromFile(this.files[0])
                    .then((res)=>{
                        if(option.onDetected) option.onDetected(res)
                    })
                    .catch(()=>{
                        console.log('Error occured: ' + err.message)
                    })
                })
                alert('add file input')
                $(this).after($file_input)
            })

        }
    }

    function QRreader(opt) {

        this._frame = null
        this._display = null
        this._isFront = false
        this._stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.618)
        this._ctx = null
        this._timer_id = -1

        this.switchDevice = true
        this.readFromAlbum = true
        if(typeof opt.switchDevice !== 'undefined')
            this.switchDevice = opt.switchDevice
        if(typeof opt.readFromAlbum !== 'undefined')
            this.readFromAlbum = opt.readFromAlbum

        var template = ''
            + '<div class="QRreader-mask" style="display: none;">'
                + '<video autoplay="autoplay" muted="muted" playsinline></video>'
                + '<canvas id="canvas" style="display:none;"></canvas>'
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
            + '</div>'

        this._frame = $(template)
        this._display = $('video', this._frame)

        this._ctx = $('canvas', this._frame)[0].getContext('2d')

        $('.aperture', this._frame).width(this._stride).height(this._stride)

        if(this.switchDevice){
            var $btn_switch = $('<button class="btn btn-switch">切换设备</button>')
            $btn_switch.click(()=>{
                this._isFront = !this._isFront
                this._setCamera(this._isFront)
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
            this._clearCapture()
            this._hideFrame()
        })

        $('body').append(this._frame)
    }

    QRreader.prototype.CONSTRAINTS_DEFAULT      = { video: true, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_FRONT = { video: { facingMode: 'user' }, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_BACK  = { video: { facingMode: 'environment' }, audio: false }

    QRreader.prototype._setCamera = function(){
        return new Promise((resolve, reject)=>{
            var mediaDevices = getMediaDevices()
            if (mediaDevices === null) 
                reject('mediaDevices API not supported')
            else{
                var constraints = this.CONSTRAINTS_DEFAULT
                if(this.switchDevice){
                    constraints = this._isFront ? this.CONSTRAINTS_CAMERA_FRONT : this.CONSTRAINTS_CAMERA_BACK
                }

                mediaDevices.getUserMedia(constraints)
                .then((stream)=>{
                    this._display[0].srcObject = stream
                    resolve()
                })
                .catch(reject)
            }
        })
    }

    QRreader.prototype._showFrame = function(){
        return new Promise((resolve, reject)=>{
            this._frame.show()
            resolve();
        })
    }
 
    QRreader.prototype._startCapture = function(){
        return new Promise((resolve, reject)=>{
            waitUntil(()=> {
                return this._display[0].videoWidth !== 0 && this._display[0].videoHeight !== 0
            })
            .then(()=>{
                $('canvas', this._frame).attr({
                    'width': this._display[0].videoWidth + 'px',
                    'height': this._display[0].videoHeight + 'px'
                })
                
                if(this._ctx === null) return

                this._clearCapture()
                
                var width_canvas = $('canvas', this._frame).width()
                var height_canvas = $('canvas', this._frame).height()

                var captureLoop = ()=>{
                    this._timer_id = setTimeout(()=>{
                        this._ctx.drawImage(this._display[0], 0, 0)
                        try{
                            var img = this._ctx.getImageData(0, 0, width_canvas, height_canvas)
                            var res = qrcode.decodeFromImageData(img, width_canvas, height_canvas)
                            resolve(res)
                        }
                        catch(err){
                            if(typeof err !== 'string'){
                                console.log(err)
                            }
                            captureLoop()
                        }
                    }, 500)
                }
                captureLoop()
            })
            .catch((err)=>console.log(err))
        })
    }

    QRreader.prototype._clearCapture = function(){
        if(this._timer_id != -1){
            clearInterval(this._timer_id)
            this._timer_id = -1
        }
    }
    
    QRreader.prototype._hideFrame = function () {
        if(this._display[0] !== null)
            this._display[0].srcObject = null
        this._frame[0].style.display= 'none'
    }

    // /** 判断当前上下文是否支持MediaDevices接口 */
    // QRreader.prototype.isSupported = function () {
    //     return isNotNil(this.getMediaDevices())
    // }

})(jQuery)