
/**
 * Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象分配到目标对象
 */

Object.myAssign = function(target,...src){
    for(let i = 0; i < src.length; i++){
        if(src[i] != null){
            for(let key in src[i]){
                // in 会把原型链上的 key 值一起查找出来
                // 这里只查找实例本身，不进行原型链查找，故加个 hasOwnProperty 判断
                if(src[i].hasOwnProperty(key)){ 
                    target[key] = src[i][key]
                }
            }
        }
    }
    return target
}
// 示例代码
const proto = { p: 'proto' }
const obj1 = { a: 'aa' }
const obj2 = { b: 'bb' }
// 以proto对象为新对象的__proto__
const obj3 = Object.create(proto, {
  c: {
    value: 'cc',
    enumerable: true
  },
  d:{
      value:'dd',
      enumerable:false // 不可枚举
  }
})
console.log(obj3)  // {c: 'cc'}
// 输出obj3的构造函数的原型对象
console.log(obj3.__proto__)  // {p: 'proto'}
const t1 = Object.myAssign({}, obj1, obj2)
console.log(t1)  // {a: "aa", b: "bb"}
const t2 = Object.myAssign({}, obj1, null, obj2, undefined)
console.log(t2)  // {a: "aa", b: "bb"}
const t3 = Object.myAssign({}, obj1, obj2, obj3)
console.log(t3)  // {a: "aa", b: "bb", c: "cc"}
