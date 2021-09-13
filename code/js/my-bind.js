Function.prototype.myBind = function(context, ...args) {
  if (!context || context === null) {
    context = window
  }
  let fn = Symbol()
  context[fn] = this
  let _this = this

  const result = function(...innerArgs) {
    if (this instanceof _this === true) {
    } else {
      context[fn](...args, ...innerArgs)
    }
  }
  result.prototype = Object.create(this.prototype)
  return result
}

function Person(name, age) {
  console.log(name)
  console.log(age)
  console.log(this)
}
