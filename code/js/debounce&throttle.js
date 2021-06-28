/**
 * @description 简单实现节流和防抖
 */

/**
 * 节流函数
 * @param {*} handle 
 * @param {*} delay 
 */
 function throttle(handle,delay){
     let prevTime = Date.now()

     return function(){
         let now = Date.now()
        if(now - prevTime >= delay){
            handle()
            prevTime = now
        }
     }
 }

/**
 * 防抖函数
 * @param {*} handle 
 * @param {*} delay 
 */
 function debounce(handle, delay){
    let timer = null
    return function(...args){
         // 保留调用时的this上下文
        let context = this
        if(timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=>{
            console.log('time func execute ', ...args)
            handle.call(context,...args)
        },delay)
    }
}
