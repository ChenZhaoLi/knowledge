/**
 *
 * @param {*} tag
 * @param {*} attr
 * @param {*} children
 * @param {*} context
 * @param {*} text
 */
export default function VNode(tag, attr, children, context, text = null) {
  return {
    // 标签
    tag,
    // 属性 Map 对象
    attr,
    // 父节点
    parent: null,
    // 子节点组成的 Vnode 数组
    children,
    // 文本节点的 Ast 对象
    text,
    // Vnode 的真实节点
    elm: null,
    // Vue 实例
    context,
  }
}
