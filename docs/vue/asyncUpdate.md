## 异步更新



> ### notify
>
> /src/core/observer/dep.js

```javascript
// 数据发生变更，会触发 dep 的 notify 方法，执行收集的 watcher 的 update 去更新
notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    if (process.env.NODE_ENV !== "production" && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }
    // 执行收集的 Watcher 实例的 update方法
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
```



> ### update
>
> /src/core/observer/watcher.js

```javascript
// 将当前 watcher 实例传递给 queueWatcher 方法  
update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

> ### queueWatcher
>
> src/core/observer/scheduler.js

```javascript
const queue: Array<Watcher> = []
let has: { [key: number]: ?true } = {}
let waiting = false
let flushing = false
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's 
 * pushed when the queue is being flushed.
 */
// 收集 watcher 实例到 queue 数组中
// 1. 判断 watcher 是否有被缓存
export function queueWatcher (watcher: Watcher) {
  // 拿到 watcher 的 id，判断 has 数组中是否有这个 id 的记录。
  // 有则说明 watcher 已经在 queue 数组中了
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    // 当前没有在刷新，在执行 flushSchedulerQueue 函数期间会一直为 true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 当前正在刷新，按照 watcher 的 id 大小插入到 queue 数组中
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    // 执行 resetSchedulerState 会重置为 false。
    // 确保刷新 queue 数组的 flushSchedulerQueue 函数只能有一个再运行
    if (!waiting) {
      waiting = true
		
      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 这里是同步执行，一般不会走这里。对性能影响大
        flushSchedulerQueue()
        return
      }
      // 异步执行，这个方法就是 vue 的 $nextTick
      // 将 flushSchedulerQueue 传递给 nextTick
      nextTick(flushSchedulerQueue)
    }
  }
}
```

> ### nextTick
>
> /src/core/util/next-tick.js

```javascript
const callbacks = []
let pending = false
// 将 cb 放入 callbacks 数组中
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  }) 
  // pending 默认为 false，在这里会置为 true，会在 flushCallbacks 函数中重置为 false。
  // flushCallbacks 是会被 timeFunc 放到微任务队列中执行，这是为了限制微任务的数量
  if (!pending) {
    pending = true
    timerFunc() // timeFunc 用来执行 flushCallbacks 方法
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

> ### timeFunc
>
> /src/core/util/next-tick.js

```javascript
let timerFunc

// timeFunc 是用来进行异步执行的函数，不同的环境有不同的异步方法
// timeFunc 用来执行 flushCallbacks 方法
// 1. 首选 Promise
// 2. 其次 MutationObserver 
// 3. setImmediate ，第3和第4已经是宏任务了
// 4. 上述方法都不支持，则使用 setTimeout
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {

  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
 
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
```

> ### flushCallbacks
>
> /src/core/util/next-tick.js

```javascript
// 执行 callbacks 数组中的函数
function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

> ### flushSchedulerQueue
>
> src/core/observer/scheduler.js

```javascript
// 执行 queue 数组中的 watcher 更新
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      // 执行 before 钩子
      watcher.before()
    }
    id = watcher.id
    // 从 has 中清除接下来要执行的 watcher
    has[id] = null
    // 执行 watcher 的 run 方法
    watcher.run()
    // in dev build, check and stop circular updates.
    // 检查循环更新
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  /**
   * 重置调度状态：
   *   1、重置 has 缓存对象，has = {}
   *   2、waiting = flushing = false，表示刷新队列结束
   *     waiting = flushing = false，表示可以向 callbacks 数组中放入
   *    新的 flushSchedulerQueue 函数，并且可以向浏览器的任务队列放入下一个 flushCallbacks 函数
   */
  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
```

> ### run
>
> /src/core/observer/watcher.js

```javascript
run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
```

> ### get
>
> /src/core/observer/watcher.js

```javascript
 /**
   * Evaluate the getter, and re-collect dependencies.
   * 获取值，并重新收集依赖
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```

