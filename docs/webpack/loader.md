## 编写一个loader

[官网示例](https://webpack.docschina.org/contribute/writing-a-loader/)

loader 本质上是一个函数，用来对你传入的资源进行加工。所以在你编写简单 loader 的时候，可以创建一个 js 文件，然后导出一个或多个函数。

在本地开发 loader 的时候，引用的方法有3种：

1. 使用路径引入

   ```javascript
   // webpack.config.js
   const path = require('path')
   
   module.exports = {
     mode: 'production',
     module: {
       rules: [
         {
           test: /\.js$/,
           use: [
             {
               loader: path.resolve(__dirname, 'loaders/loader1.js'),
             },
           ],
         },
       ],
     },
   }
   
   ```

   

2. 使用 resolveLoader.modules 预设 loader 的查找路径

   ```javascript
   // webpack.config.js
   const path = require('path')
   module.exports = {
     mode: 'production',
     module: {
       rules: [
         {
           test: /\.js$/,
           use: [
             {
               loader: 'loader1',
             },
           ],
         },
       ],
     },
     resolveLoader: {
       modules: ['node_modules', path.resolve(__dirname, 'loaders')],
     },
   }
   
   ```

3. 如果你为 loader 创建了一个单独的包，你可以使用 [npm link](https://docs.npmjs.com/cli/v7/commands/npm-link/) 来将你的包链接到你项目的 node_modules 下

#### loader的使用

可以使用多个 loader 处理一个资源，这些 loader 会按照**从后往前**链式调用。

运行 webpack 打包命令可以看到，会先使用 loader2 处理，再使用 loader1 处理

```javascript
// webpack.config.js
const path = require('path')
module.exports = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['loader1', 'loader2'],
      },
    ],
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
}
```

```javascript
// src/index.js
console.log('hello')
```

```javascript
//loader2.js
module.exports = function(source) {
  return `${source};console.log('loader2')`
}
```

```javascript
// loader1.js
module.exports = function(source) {
  return `${source};console.log('loader1')`
}
```

```javascript
// dist/main.js 最终输出的内容
console.log("hello"),console.log("loader2"),console.log("loader1");
```

#### loader 的设计指南

在设计 loader 的时候可以参考一些官方的建议[官网链接](https://webpack.docschina.org/contribute/writing-a-loader/#guidelines)

* 单一职责

  尽量让每个 loader 只做一件事，可以更好的复用

* 链式调用

  处理复杂的任务时，将每一步都拆分成一个 loader，然后进行链式调用

* 规范化输出

  loader 文件的输出应该和普通 js 模块输出方式一样

* 无状态

  loader 模块的数据，应该依赖于外部传入。不应在本地缓存数据并使用它

* 可以借助 loader-utils 和 schema-utils 这两个包进行一些参数处理和验证

* 标记 loader 的外部依赖文件

  可以使用 `addDependency`  方法标记出依赖的外部文件，这样再 watch 模式下运行 webpack 时，可以监听到外部依赖文件内容的变化从而重新编译

* 不要使用绝对路径