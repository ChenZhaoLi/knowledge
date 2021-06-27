export default function Dep(){
    // 存储当前 dep 实例收集的所有 watcher
    this.watchers = []
}

// Dep.target 是一个静态属性，值为 null 或者 watcher 实例
// 在实例化 Watcher 时进行赋值，待依赖收集完成后在 Watcher 中又重新赋值为 null
Dep.target = null

/**
 * 收集 watcher
 * 在发生读取操作时 (vm.xx) && 并且 Dep.target 不为 null 时进行依赖收集
 */
Dep.prototype.depend = function(){
    // 防止 Watcher 实例被重复收集
    if(this.watchers.includes(Dep.target)) return
    // 收集 Watcher 实例
    this.watchers.push(Dep.target)
}

/**
 * Dep 通知自己已收集的所有 watcher 执行更新函数
 */
Dep.prototype.notify = function(){
    for(let watcher of this.watchers){
        watcher.update()
    }
}