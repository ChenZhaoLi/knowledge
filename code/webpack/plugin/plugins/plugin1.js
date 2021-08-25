const pluginName = 'HelloWorldPlugin '
const { validate } = require('schema-utils')
const schema = require('./schema.json')
class HelloWorldPlugin {
  constructor(option = {}) {
    validate(schema, option, {
      name: 'Hello World Plugin',
    })
  }
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log('webpack 构建正在启动！')
    })
  }
}

module.exports = HelloWorldPlugin
