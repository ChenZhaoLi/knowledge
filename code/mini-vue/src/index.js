import initData from './initData.js'
import mount from './compiler/index.js'
import renderHelper from './compiler/renderHelper.js'
import patch from './compiler/patch.js'
import initComputed from './initComputed.js'
/**
 * Vue 构造函数
 * @param {*} options new Vue(options) 时传递的配置对象
 */
export default function Vue(options) {
  this._init(options)
  // this.$mount() //??
}

/**
 * 初始化配置对象
 * @param {*} options
 */
Vue.prototype._init = function (options) {
  // 将 options 配置挂载到 Vue 实例上
  this.$options = options
  // 初始化 options.data
  // 代理 data 对象上的各个属性到 Vue 实例
  // 给 data 对象上的各个属性设置响应式能力
  initData(this)

  // 初始化 computed 选项，并将计算属性代理到 Vue 实例上
  // 结合 watcher 实现缓存
  initComputed(this)

  // 安装运行是的渲染工具函数
  renderHelper(this)
  this.__patch__ = patch
  // 如果存在 el 配置项，则调用 $mount 方法编译模板
  if (this.$options.el) {
    this.$mount()
  }
}

Vue.prototype.$mount = function () {
  mount(this)
}
