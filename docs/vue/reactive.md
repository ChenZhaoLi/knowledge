

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



> ### observe
>
> /src/core/observer/index.js

```javascript
// 响应式的入口，旨在建立一套观察者机制
// 1. 非对象和 VNode 实例不做响应式处理
// 2. 查找 value 中是否有 __ob__ 属性，如果有说明此对象已经建立过观察者机制了，直接返回 __ob__
// 3. new 一个 Observer 实例，这个观察者实例会被添加到 value 上，key 为 __ob__

export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 非对象和 VNode 实例不做响应式处理
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 查找 __ob__ 属性
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 创建 Observer 实例
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

> ### Observer
>
> /src/core/observer/index.js

```javascript
// Observer 实例

export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    // dep 实例用来维护观察者列表，并在被观察者发生变化时通知观察者
    this.dep = new Dep()
    this.vmCount = 0
    // 给 value 添加一个不可枚举的属性 __ob__, 值为 this
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        // 如果当前环境的对象上能使用 __proto__
        // 设置 value 的 __proto__ 为 arrayMethods
        protoAugment(value, arrayMethods)
      } else {
        // 不能使用__proto__, 在 value 上使用  Object.defineProperty 直接添加方法
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      // 遍历 value 的所有属性，给每个属性调用 defineReactive 方法
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```

> ### defineReactive
>
> /src/core/observer/index.js

```javascript
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 实例化 Dep，一个 key 一个 dep
  const dep = new Dep()
  // 获取 obj.key 的属性描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 如果 obj.key 不可配置，直接 return
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 得到 val 值
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 递归调用，处理 val 为对象的情况。确保每个 key 都被观测
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

> ### 拦截能改变原数组的七个方法
>
> src/core/observer/array.js

```javascript

const arrayProto = Array.prototype
// 创建一个对象，该对象的 __proto__ 是 Array.prototype
export const arrayMethods = Object.create(arrayProto)

// 能改变原数组的七个方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // 缓存原生方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 执行原生方法
    const result = original.apply(this, args)
    // 拿到数组上的 Observer 实例
    const ob = this.__ob__
    let inserted
    // 添加数组选项时，对新添加的值也做响应式处理
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // 通知依赖进行更新
    ob.dep.notify()
    return result
  })
})
```



> ### Dep
>
> /src/core/observer/dep.js

```javascript
import type Watcher from "./watcher";
import { remove } from "../util/index";
import config from "../config";

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    if (process.env.NODE_ENV !== "production" && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
const targetStack = [];

// 在 Watcher 的 get 函数中会调用此函数，对 Dep.target 进行赋值
export function pushTarget(target: ?Watcher) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```



* 一个依赖收集的流程

  ```javascript
  ...
  watch: {
            msg(oldVal, val) {
              console.log(oldVal, val);
            }
          },
   data() {
            return {
              msg: "hello vue"
            };
          }
  ...
  ```

  举个例子，在 watch 中对 data 的 msg 进行监听，就会触发依赖收集

  1. 首先会初始化 data

  2. 然后初始化 watch，然后会以 createWatcher -> vm.$watch -> new Watcher 的顺序执行

  3. Watcher 的 constructor 会执行 this.get。this.get 方法先调用 pushTarget 方法，将当前 Watcher 实例

     赋值给 Dep.target。然后执行 this.getter 获取 msg 的值

  4. 读取 vm.msg 值的操作，会触发 proxy 的 get 方法，从而去读取 vm._data.msg。然后触发 defineReactive 函数里给 vm._data.msg 设置的 get 函数

  5. 在 vm._data.msg 的 get 函数中触发 dep.depend -> Watcher 的 addDep -> dep 的 addSub