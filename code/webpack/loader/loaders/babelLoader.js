const { getOptions } = require('loader-utils')
const { validate } = require('schema-utils')
const babel = require('@babel/core')
const util = require('util')

const babelSchema = require('./babelSchema.json')

// 将 babel.transform 转换成 promise 风格
const transform = util.promisify(babel.transform)

module.exports = function(content, map, meta) {
  // 获取 options
  const options = getOptions(this) || {}
  // 校验 options
  validate(babelSchema, options, {
    name: 'Babel Loader',
  })
  // 获取异步回调函数
  const callback = this.async()

  // 开始转换
  transform(content, options)
    .then(({ code, map }) => callback(null, code, map, meta))
    .catch((e) => callback(e))
}
