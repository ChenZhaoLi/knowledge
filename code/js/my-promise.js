/**
 * 实现一个简单的 promise
 * @param {*} executor 执行器
 */
function CutePromise(executor){
    function resolve(value){}
    function reject(reason){}
    executor(resolve,reject)
}

CutePromise.prototype.then = function(onResolved, onRejected){}