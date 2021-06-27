import Dep from "./dep.js";
import observe from "./observe.js";

/**
 * 通过  Object.defineProperty 为 obj.key 设置 getter、setter 的拦截
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 */
export default function defineReactive(obj,key,val){
    // 递归调用 observe，处理 val 仍为对象的情况
    const childOb = observe(val)
    const dep = new Dep()
    Object.defineProperty(obj, key, {
        // 当发现 obj.key 的读取行为，会被 get 拦截
        get(){
            // 读取数据时 && Dep.target 不为 null，则进行依赖收集
            if(Dep.target){
                dep.depend()
                // 如果存在子 ob，则一起进行依赖收集
                if(childOb){
                    childOb.dep.depend()
                }
            }
            console.log(`getter: key = ${key}`)
            return val
        },
        // 当发现 obj.key = xx 的赋值行为时，会被 set 拦截
        set(newV){
            console.log(`setter:${key} = ${newV}`)
            if(newV === val) return
            val = newV
            // 对新值进行响应式处理，这里针对的是新值为非原始值的情况，比如 val 为对象，数组
            observe(val)
            // 数据更新，让 dep 通知自己收集的所有 watcher 执行 update 方法
            dep.notify()
        }
    })
}