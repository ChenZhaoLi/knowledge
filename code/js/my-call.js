/**
 * 简单实现 call
 * 功能：1.改变this指向
 *      2.读取函数入参
 * @param {*} context
 * @param  {...any} args
 */
Function.prototype.myCall = function(context, ...args) {
  // 1.将调用 myCall 的函数，保存起来
  context.func = this
  // 2.通过 context 来执行func
  context.func(...args)
  // 3.执行完毕，删除 context 上添加的func
  delete context.func
}

// 用法
var me = {
  name: 'czl',
}
function showFullName(surname) {
  console.log(`${surname} - ${this.name}`)
}
showFullName.myCall(me, 'chen')
showFullName.call(me, 'chen') // 原版 call
