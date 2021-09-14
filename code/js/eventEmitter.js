/**
 * @description 发布订阅
 */
class EventEmitter {
  constructor() {
    // 维护事件及订阅行为
    this.events = {}
  }
  /**
   * 注册事件订阅行为
   * @param {String} type 事件类型
   * @param {Function} cb 回调函数
   */
  on(type, cb) {
    if (!this.events[type]) {
      this.events[type] = []
    }
    this.events[type].push(cb)
  }
  /**
   * 只执行一次的订阅行为
   * @param {*} type
   * @param {*} cb
   */
  once(type, cb) {
    let fn = (...args) => {
      cb(...args)
      this.off(type, cb)
    }
    this.on(type, fn)
  }

  /**
   * 发布事件
   * @param {*} type 事件类型
   * @param  {...any} args 参数列表
   */
  emit(type, ...args) {
    if (this.events[type]) {
      this.events[type].forEach((cb) => cb(...args))
    }
  }

  /**
   * 移除某个事件的一个订阅行为
   * @param {*} type 事件类型
   * @param {*} cb 回调函数
   */
  off(type, cb) {
    if (this.events[type]) {
      const targetIndex = this.events[type].findIndex((fn) => fn === cb)
      if (targetIndex !== -1) {
        this.events[type].splice(targetIndex, 1)
      }
      if (this.events[type].length === 0) {
        delete this.events[type]
      }
    }
  }

  /**
   * 移除某个事件的所有订阅行为
   * @param {*} type 事件类型
   */
  offAll(type) {
    if (this.events[type]) {
      delete this.events[type]
    }
  }
}

const myEvent = new EventEmitter()

const handle = (...rest) => {
  console.log(...rest)
}

myEvent.on('click', handle)
myEvent.on('tap', handle)
myEvent.once('click', handle)

document.querySelector('#eventEmitter').addEventListener('click', () => {
  myEvent.emit('click', 'click', 123, 4, 5)
  myEvent.emit('tap', 'tap', 123)
  myEvent.offAll('tap')
})
