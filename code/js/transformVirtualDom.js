let virtualDon = {
  tag: 'DIV',
  attrs: {
    id: 'app',
  },
  children: [
    {
      tag: 'SPAN',
      children: [{ tag: 'A', children: [1] }],
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [2] },
        { tag: 'A', children: ['3'] },
      ],
    },
  ],
}
// 把上诉虚拟Dom转化成下方真实Dom
// <div id="app">
//   <span>
//     <a></a>
//   </span>
//   <span>
//     <a></a>
//     <a></a>
//   </span>
// </div>

function _render(vnode) {
  if (typeof vnode === 'number') {
    vnode = String(vnode)
  }
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode)
  }
  const dom = document.createElement(vnode.tag)
  if (vnode.attrs) {
    Object.keys(vnode.attrs).forEach((key) => {
      const value = vnode.attrs[key]
      dom.setAttribute(key, value)
    })
  }
  vnode.children.forEach((child) => dom.appendChild(_render(child)))
  return dom
}
let dom = _render(virtualDon)
document.querySelector('#vnode').appendChild(dom)
