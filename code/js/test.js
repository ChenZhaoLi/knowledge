const MyPromise = require('./my-promise.js')

// MyPromise.resolve()
//   .then(() => {
//     console.log(0)
//     return MyPromise.resolve(4)
//   })
//   .then((res) => {
//     console.log(res)
//   })

// MyPromise.resolve()
//   .then(() => {
//     console.log(1)
//   })
//   .then(() => {
//     console.log(2)
//   })
//   .then(() => {
//     console.log(3)
//   })
//   .then(() => {
//     console.log(5)
//   })
//   .then(() => {
//     console.log(6)
//   })
// console.log('outer')

new MyPromise((resolve, reject) => {
  console.log('外部promise')
  resolve()
})
  .then(() => {
    console.log('外部第一个then')
    new MyPromise((resolve, reject) => {
      console.log('内部promise')
      resolve()
    })
      .then(() => {
        console.log('内部第一个then')
        return MyPromise.resolve()
      })
      .then(() => {
        console.log('内部第二个then')
      })
  })
  .then(() => {
    console.log('外部第二个then')
  })
  .then(() => {
    console.log('外部第三个then')
  })
