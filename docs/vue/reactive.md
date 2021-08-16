## 响应式原理

> #### initState
>
> /src/core/instance/state.js

```javascript
/**
* 初始化顺序：props，methods，data，computed，watch
* 所以 data 里 无法使用 computed
* 如果 data 里使用的methods方法里用了computed变量，那computed变量为undefined
*/
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

> ### initProps
>
> /src/core/instance/state.js

```javascript
// props 最先初始化，主要做两件事
// 1. 给 props[key] 设置响应式
// 2. 将 key 代理到 vm实例上
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    // 获取 props[key] 的 default
    const value = validateProp(key, propsOptions, propsData, vm)
    //...省略部分
    // 给 props[key] 设置响应式
    defineReactive(props, key, value)
 
    if (!(key in vm)) {
      // 将 key 代理到 vm实例上，实现 vm[key] -> vm[_props][key]。vm 就是之后的 this
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```



> ### proxy
>
> /src/core/instance/state.js

```javascript
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
// 通过 Object.defineProperty 的 get 和 set 设置拦截
// 将 key 代理到 target 上，使 target[key] 的访问方式等同于 target[sourceKey][key]
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

```

> ### initMethods
>
> /src/core/instance/state.js

```javascript
// 主要是四件事情
// 1. methods对象的属性值必须是函数
// 2. 方法名不能和 props 的属性重复
// 3. 方法名不能和 vm 上以'_','$'开头的变量重复
// 4. 将方法的上下文绑定到 vm 上，并将方法赋值到 vm 上

function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      // methods[key] 必须是函数
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // 方法名不能和 props 的属性重复
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // 方法名不能和 vm 上以'_','$'开头的变量重复
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 将方法的上下文绑定到 vm 上，并将方法赋值到 vm 上
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}
```

> ### initData
>
> /src/core/instance/state.js

```javascript
// 1. 获取 data，如果是函数，则用 vm 实例作为上下文调用改函数。
// 2. data 属性值判重，不能和 methods，props 的属性值重复
// 3. data 里非 $ 或 _ 开头的属性，就会被代理到 vm 实例上，通过 this.xxx 访问
// 4. 为 data 对象上的数据设置响应式
function initData (vm: Component) {
  // 获取 data，是一个对象
  let data = vm.$options.data
  // getData 使用vm作为上下文来调用 data 函数
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      // data 的 key 不能和 methods 的 key 重复
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    // data 的 key 不能和 props 的 key 重复
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // data 的 key 不是以‘_’或‘$’开头的话，就代理到 vm 上
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 为 data 对象上的数据设置响应式
  observe(data, true /* asRootData */)
}
```

> ### initComputed
>
> /src/core/instance/state.js

```javascript
// 1. 创建 watcher 实例，并默认懒执行
// 2. 如果 vm 实例上没有 computed 属性的话，进行挂载。有的话，会和 data、props 做判重。
//    所以，computed 属性是可以和 methods 属性重名，且不会覆盖已挂载的 methods 属性
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // 创建 watcher 实例，并默认懒执行（computedWatcherOptions）
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 代理 computed 对象中的属性到 vm 实例上
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```

> ### initWatch
>
> /src/core/instance/state.js

```javascript
// watch 属性值的类型有四种 { [key: string]: string | Function | Object | Array }
// 1. 对属性值做处理，使 createWatcher 函数调用每个 handler
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        // watch[key] 是个数组，对数组中的每个 handler 做一次 createWatcher
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

// 兼容性处理，保证传递给 vm.$watch 的handle 是个函数
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // 如果 handler 是对象，即
  //  {
  //    handler: function (val, oldVal) { /* ... */ },
  //    deep: true
  //  }
  // 形式，提取 handler 和 options
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 如果是 string ,则说明应该是实例上的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

 Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    // initWatch 已经对 cb 做了处理，这里是对直接调用 vm.$watch 时的 cb 做兼容处理
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    // 创建 Watcher 实例
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 如果 immediate 为 true， 立即执行一次 cb 函数 
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
```

