let timeMap = {}
let id = 0
function mySetInterval(cb, time = 0, ...args) {
  let timeId = id
  id++
  let fn = () => {
    cb(...args)
    timeMap[timeId] = setTimeout(() => {
      fn()
    }, time)
  }
  timeMap[timeId] = setTimeout(fn, time)
  return timeId
}

function myClearInterval(id) {
  clearTimeout(timeMap[id])
  delete timeMap[id]
}
// // 调用
// let ids = mySetInterval(
//   (arg1, arg2) => {
//     console.log(233, arg1, arg2)
//   },
//   1000,
//   'a',
//   'b'
// )

// setTimeout(() => {
//   myClearInterval(ids)
// }, 5000)
