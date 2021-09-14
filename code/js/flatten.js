/**
 * @description 打平对象
 */
const obj = {
  a: {
    b: 1,
    c: 2,
    d: { e: 5 },
  },
  b: [1, 3, { a: 2, b: 3 }],
  c: 3,
}

// flatten(obj) 结果返回如下
// {
//  'a.b': 1,
//  'a.c': 2,
//  'a.d.e': 5,
//  'b[0]': 1,
//  'b[1]': 3,
//  'b[2].a': 2,
//  'b[2].b': 3
//   c: 3
// }

function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

function flatten(obj) {
  if (!isObject(obj)) return
  let res = {}
  const dfs = (cur, prefix) => {
    if (isObject(cur)) {
      // 处理对象
      for (let k in cur) {
        dfs(cur[k], `${prefix}${prefix ? '.' : ''}${k}`)
      }
    } else if (Array.isArray(cur)) {
      // 处理数组
      cur.forEach((item, index) => {
        dfs(item, `${prefix}[${index}]`)
      })
    } else {
      res[prefix] = cur
    }
  }
  dfs(obj, '')
  return res
}
let handleObj = flatten(obj)
console.log(handleObj)
