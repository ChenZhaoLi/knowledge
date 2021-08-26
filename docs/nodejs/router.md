实现路由部分，使路径可以正常分发

先定义一个简单的数据设置函数，在`lib`下新建`baseFun.js`

```javascript
/**
 * @description 设置响应数据
 * @param {*} ctx
 * @param {*} ret
 * @param {*} message
 * @param {*} dataInfo
 * @param {*} httpStatus
 */
function setResInfo(ctx, ret, message, dataInfo, httpStatus = 200) {
  let retInfo = {}
  if (!ret) {
    retInfo = {
      ret: -1,
      message: message ? message : 'error',
      data: dataInfo ? dataInfo : {},
    }
  } else {
    retInfo = {
      ret: 0,
      message: message ? message : 'success',
      data: dataInfo ? dataInfo : {},
    }
  }
  ctx.response.type = 'text/plain'
  ctx.response.status = httpStatus
  ctx.response.body = retInfo
  return
}

module.exports = {
  setResInfo,
}

```



新建文件`src/middleware/router.js`

```javascript
// src/middleware/router.js
const URL = require('url').URL
const baseFun = require('../lib/baseFun.js')

module.exports = function () {
  return async function (ctx, next) {
   // ...
  }
}

```

在 `app.js`中使用

```javascript
// app.js
const routerMiddleware = require('./src/middleware/router.js')
// ...
app.use(routerMiddleware())
// ...
```

在本项目的`router`处理中，路径和类名、方法名是对应的。比如在浏览器地址栏输入`http://127.0.0.1:3000/tools/local`，意味着要去`src/controller`下找到 `tools` 文件夹，调用里面的local方法。

```javascript
    // ...
    // 获取 get 参数
    const pathname = new URL(ctx.request.url, `http://${ctx.request.headers.host}`).pathname  // /tools/local

    let pathnameArr = pathname.split('/').filter(Boolean)
    if (pathnameArr.length < 2) {
      baseFun.setResInfo(ctx, false, 'path not found', null, 404)
      return await next()
    }
 	let method = pathnameArr.pop() // local
    let controllerPath = pathnameArr.join('/') // '/tools'
    let ControllerClass
    // ...

```

拿到文件名后就尝试`require` 对应的文件，然后执行对应的方法

```javascript
// 尝试查找文件
    try {
      // require(`../controller/tools`)
      ControllerClass = require(`../controller/${controllerPath}`)
    } catch (error) {
      baseFun.setResInfo(ctx, false, 'path not found', null, 404)
      return await next()
    }
    // 尝试加载文件中的方法
    try {
      const controllerObj = new ControllerClass(ctx)
      if (!controllerObj[method]) {
        baseFun.setResInfo(ctx, false, 'path not found', null, 404)
        return await next()
      }
      if (controllerObj[method][Symbol.toStringTag] === 'AsyncFunction') {
        // 异步方法
        await controllerObj[method]()
        return await next()
      } else {
        // 同步方法
        controllerObj[method]()
        return await next()
      }
    } catch (error) {
      console.log(error)
      baseFun.setResInfo(ctx, false, 'server error', null, 500)
      return await next()
    }
```

controller 目录下的 js 文件要导出一个 Class

```javascript
// controller/tools.js
class Tools {
  test() {
    console.log('test')
  }
}
module.exports = Tools

```

接下来只要在浏览器地址栏输入`http://127.0.0.1:3000/tools/test`，就可以在`log/info-0.js`中看到输出