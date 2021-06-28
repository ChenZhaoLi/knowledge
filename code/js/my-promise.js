/**
 * 实现一个简单的 promise
 * @param {*} executor 执行器
 */
function CutePromise(executor){
    // 记录异步任务成功的执行结果
    this.value = null
    // 记录异步任务失败的原因
    this.reason = null
    // 记录当前状态，初始化时 pending
    this.status = 'pending'
    // 存储 this
    var self = this

    // 缓存两个队列，维护 resolved 和 rejected 各自对应的处理函数
    this.onResolvedQueue = []
    this.onRejectedQueue = []

    function resolve(value){
        // 如果不是 pending 状态，直接返回
        if(self.status !== 'pending') return
        
        // 异步任务成功，把结果赋值给 value
        self.value = value
        // 切换当前状态为 resolved
        self.status = 'resolved'
        // 批量执行 resolved 队列里的任务
        self.onResolvedQueue.forEach(resolved=>resolved(self.value))
    }
    function reject(reason){}
    executor(resolve,reject)
}

/**
 * 决议程序
 * @param {*} promise2 then 函数所return的对象
 * @param {*} x onResolved(就是 then 函数的第一个函数型入参) 所 return 的值
 * @param {*} resolve promise2 的 resolve
 * @param {*} reject  promise2 的 reject
 */
function resolutionProcedure(promise2, x, resolve, reject){
    // 为了确保 resolve, reject 不要被重复执行
    let hasCalled;
    if(x === promise2){

    }else if(x !== null && (typeof x === 'object' || typeof x === 'function')){
        try {
            let then = x.then
            if(typeof then === 'function'){
                then.call(x,y=>{
                    
                })
            }else{
                resolve(x)
            }
        }catch(e){

        }
    }else{
        // 如果 x 不是一个 object 或者 function，用 x 为参数执行 promise
        resolve(x)
    }

}

CutePromise.prototype.then = function(onResolved, onRejected){
    
    // onResolved 和 onRejected 必须是函数；如果不是，用一个透传来兜底
    if(typeof onResolved !== 'function'){
        onResolved = function(x){return x}
    }
    if(typeof onRejected !== 'function'){
        onRejected = function(e){throw e}
    }
    // 保存 this
    var self = this
    // 这个变量用来存返回值 x
    let x

    // resolve 态的处理函数
    function resolveByStatus(resolve, reject){
        setTimeout(function(){
            try{
                x = onResolved(self.value)
                // 进入决议程序
                resolutionProcedure(promise2,x,resolve,reject)
                
            }catch(e){}
        })
    }
    // reject 态的处理函数
    function rejectByStatus(resolve,reject){}

    // 创建一个符合 Promise 规范的对象
    var promise2 = new CutePromise(function(resolve,reject){
        // 判断状态，分配对应的处理函数
        if(self.status === 'resolved'){

        }else if(self.status === 'rejected'){

        }else if(self.status === 'pending'){
            // 如果是 pending， 则将任务推入相应队列
            self.onResolvedQueue.push(function(){
                resolveByStatus(resolve,reject)
            })
            self.onRejectedQueue.push(function(){
                rejectByStatus(resolve,reject)
            })
        }
    })
    return promise2
}