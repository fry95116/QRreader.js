(function () {

  /** 检查`test`是否不为undefined或者null */
  function isNotNil(test) {
    return typeof (test) != undefined || typeof (test) != null
  }

  /** 检查MediaDevices接口支持 */
  function isMediaDevicesSupported() {
    return isNotNil(getMediaDevice())
  }

  /** 获取MediaDevices接口，如果不支持则返回null */
  function getMediaDevices() {
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
  
  /** 测试`test`是否实现了MediaDevices接口 */
  function isMediaDevices(test) {
    return isNotNil(test.enumerateDevices) && isNotNil(test.getUserMedia)
  }

  function showFrame(){
    
  }

  window.isMediaDevicesSupported = isMediaDevicesSupported
  window.getMediaDevices = getMediaDevices
})()
