// console.log('helld')
import str from '../loaders/es6.js'
class Person {
  constructor(name) {
    this.name = name
  }
  setName(name) {
    this.name = name
  }
}
console.log(str)
console.log(new Person('jack'))
