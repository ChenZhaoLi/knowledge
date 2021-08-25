const HelloWorldPlugin = require('./plugins/plugin1.js')
const { FileListPlugin } = require('./plugins/plugin2.js')
module.exports = {
  mode: 'production',
  plugins: [
    // new HelloWorldPlugin({ test: '12' })
    new FileListPlugin(),
  ],
}
