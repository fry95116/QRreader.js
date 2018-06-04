(function () {

    const util = require('./util.js')
    const jsqr = require('jsqr')
    // $.fn.QRreader = function(option, onMsg){

    //     var opt = {
    //         switchDevice: true,
    //         readFromAlbum: true,
    //         onDetected: null
    //     }
        
    //     option = $.extend({}, opt, option)
    //     if(getMediaDevices() !== null){
    //         var reader = new QRreader(option)

    //         this.each(function(){
    //             if(this.tagName.toUpperCase() !== 'LABEL'){
    //                 console.log('please load this plugin on <label> element.')
    //                 return
    //             }
    //             $(this).click(()=>{
    //                 reader._setCamera()
    //                     .then(()=>reader._showFrame())
    //                     .then(()=>reader._startCapture())
    //                     .then((res)=>{
    //                         reader._clearCapture()
    //                         reader._hideFrame()
    //                         if(option.onDetected) option.onDetected(res)
    //                     })
    //                     .catch((err)=>{
    //                         console.log('Error occured: ' + err.message)
    //                     })
    //             })
    //         })
    //     }
    //     else{
    //         this.each(function(){
    //             if(this.tagName.toUpperCase() !== 'LABEL'){
    //                 console.log('please load this plugin on <label> element.')
    //                 return
    //             }
    //             this.setAttribute('for', 'QRreader-file-input')
    //             var $file_input = $('<input id="QRreader-file-input" type="file" accept="image/*" multiple>')
    //             $file_input.change(function(){
    //                 if(this.files.length === 0) return
    //                 decodeFromFile(this.files[0])
    //                 .then((res)=>{
    //                     if(option.onDetected) option.onDetected(res)
    //                 })
    //                 .catch(()=>{
    //                     console.log('Error occured: ' + err.message)
    //                 })
    //             })
    //             $(this).after($file_input)
    //         })

    //     }
    // }

    class QRreader {
        constructor(opt) {
            
            this._isFront = false;
            this._stride = Math.round(Math.min(window.innerHeight, window.innerWidth) * 0.618);
            this._frame = null;  // 
            this._display = null;
            this._canvas = null;
            this._ctx = null;

            // this._timer_id = -1;
            this.isCapturing = false;
            this.switchDevice = true;
            this.readFromAlbum = true;

            if (typeof opt !== 'undefined'){
                if (typeof opt.switchDevice !== 'undefined')
                    this.switchDevice = opt.switchDevice;
                if (typeof opt.readFromAlbum !== 'undefined')
                    this.readFromAlbum = opt.readFromAlbum;
            }

            var template = ''
                + '<video autoplay="autoplay" muted="muted" playsinline></video>'
                + '<canvas id="canvas" style="display:none"></canvas>'
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

            this._frame = document.createElement('div')
            this._frame.className = 'QRreader-mask'
            this._frame.style.display = 'none'
            this._frame.innerHTML = template

            this._display = this._frame.getElementsByTagName('video')[0] || null
            this._canvas = this._frame.getElementsByTagName('canvas')[0]
            this._ctx = this._canvas.getContext('2d');

            var aperture = this._frame.getElementsByClassName('aperture')[0]
            aperture.style.width = this._stride + 'px'
            aperture.style.height = this._stride + 'px'

            if (this.switchDevice) {
                var btn_switch = document.createElement('button')
                btn_switch.className = 'btn btn-switch'
                btn_switch.innerText = '切换设备'
                btn_switch.addEventListener('click', ()=>{
                    this._isFront = !this._isFront
                    this._setCamera(this._isFront)
                })
                this._frame.appendChild(btn_switch)
            }
            
            if (this.readFromAlbum) {
                var btn_album = document.createElement('label')
                btn_album.className = 'btn btn-album'
                btn_album.setAttribute('for', 'QRreader-file-input')
                btn_album.innerText = '相册'
                this._frame.appendChild(btn_album)
            }

            this._frame.getElementsByClassName('btn-cancel')[0].addEventListener('click', ()=>{
                this._clearCapture()
                this._hideFrame()
            })

            document.body.appendChild(this._frame)
            
            var file_input = document.createElement('input')
            file_input.setAttribute('id', 'QRreader-file-input')
            file_input.setAttribute('type', 'file')
            file_input.setAttribute('accept', 'image/*')
            file_input.setAttribute('capture', 'camera')
            //TODO: set change event
            document.body.appendChild(file_input)
        }

        hook(el, onDetected){
            if(el.tagName.toUpperCase() !== 'LABEL'){
                throw new Error('must be hooked on a <label> element!')
                return
            }
            el.setAttribute('for', 'QRreader-file-input')
            if(util.getMediaDevices() !== null){

                var ret = null
                var doOnClick = async ()=>{
                    try{
                        await this._setCamera()
                        this._showFrame()
                        ret = await this._startCapture()
                    }
                    catch(err){
                        console.log(err)
                    }
                    this._clearCapture()
                    this._hideFrame()

                    var ret = ret.data || null
                    await util.sleep(10)
                    if(onDetected) onDetected(ret)
                }
                el.onclick = function(){
                    doOnClick()
                    return false;
                }
                // el.addEventListener('click', ()=>{
                //     // (async ()=>{
                //     //     await this._setCamera()
                //     //     this._showFrame()
                //     //     var ret = await this._startCapture()
                //     //     this._clearCapture()
                //     //     this._hideFrame()
                //     //     if(onDetected) onDetected(ret)
                //     // })()
                //     alert('onClick')
                //     return false
                // })
            }
        }
        // _setCamera() {
        //     return new Promise(async (resolve, reject) => {
        //         var mediaDevices = util.getMediaDevices()
        //         if (mediaDevices === null)
        //             reject('mediaDevices API not supported')
        //         else {
        //             var constraints = this.CONSTRAINTS_DEFAULT
        //             if (this.switchDevice) {
        //                 constraints = this._isFront ? this.CONSTRAINTS_CAMERA_FRONT : this.CONSTRAINTS_CAMERA_BACK
        //             }
        //             try{
        //                 var stream = await mediaDevices.getUserMedia(constraints)
        //                 this._display.srcObject = stream
        //                 resolve()
        //             }
        //             catch(err){
        //                 reject(err)
        //             }
        //         }
        //     });
        // }


        async _setCamera() {
            var mediaDevices = util.getMediaDevices()
            if (mediaDevices === null)
                reject('mediaDevices API not supported')
            else {
                var constraints = this.CONSTRAINTS_DEFAULT
                if (this.switchDevice) {
                    constraints = this._isFront ? this.CONSTRAINTS_CAMERA_FRONT : this.CONSTRAINTS_CAMERA_BACK
                }
                try{
                    var stream = await mediaDevices.getUserMedia(constraints)
                    this._display.srcObject = stream
                    return
                }
                catch(err) {throw err}
            }
        }

        _showFrame() {
            this._frame.style.display = 'block'
        }


        async _startCapture() {
                await util.waitUntil(() => {
                    return this._display.videoWidth !== 0 
                        && this._display.videoHeight !== 0;
                }, 2000)
                // may be throw timeout error 
                var width_canvas = this._display.videoWidth
                var height_canvas = this._display.videoHeight

                this._canvas.setAttribute('width', width_canvas + 'px')
                this._canvas.setAttribute('height', height_canvas + 'px')

                if(this._ctx === null) return
                this._clearCapture()

                this.isCapturing = true
                while(this.isCapturing){
                    await util.sleep(500)
                    this._ctx.drawImage(this._display, 0, 0)
                    var imageData = this._ctx.getImageData(0, 0, width_canvas, height_canvas)
                    var ret = jsqr(imageData.data, width_canvas, height_canvas)
                    console.log(new Date().getTime())
                    console.log(ret)
                    if(ret !== null) return ret
                    // TODO: process image
                }

                // var captureLoop = () => {
                //     this._timer_id = setTimeout(() => {
                //         this._ctx.drawImage(this._display, 0, 0)
                //         // TODO: process img

                //         // try {
                //         //     var img = this._ctx.getImageData(0, 0, width_canvas, height_canvas);
                //         //     var res = qrcode.decodeFromImageData(img, width_canvas, height_canvas);
                //         //     resolve(res);
                //         // }
                //         // catch (err) {
                //         //     if (typeof err !== 'string') {
                //         //         console.log(err);
                //         //     }
                //         //     captureLoop();
                //         // }
                //     }, 500)
                // }
        }

        _clearCapture() {
            this.isCapturing = false
        }
        _hideFrame() {
            if (this._display !== null)
                this._display.srcObject = null
            this._frame.style.display = 'none'
        }
    }

    QRreader.prototype.CONSTRAINTS_DEFAULT      = { video: true, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_FRONT = { video: { facingMode: 'user' }, audio: false }
    QRreader.prototype.CONSTRAINTS_CAMERA_BACK  = { video: { facingMode: 'environment' }, audio: false }

    window.qrReader = new QRreader()
    // /** 判断当前上下文是否支持MediaDevices接口 */
    // QRreader.prototype.isSupported = function () {
    //     return isNotNil(this.getMediaDevices())
    // }

})()