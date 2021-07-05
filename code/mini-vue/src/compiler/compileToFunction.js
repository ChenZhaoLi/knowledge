import generate from './generate.js'
import parse from './parse.js'

/**
 * 解析模板字符串，得到 AST 语法数
 * 将 AST 语法树生成渲染函数
 * @param {*} template 模板字符串
 * @returns 渲染函数
 */
export default function compileToFunction(template) {
  // 解析模板，生成 ast
  const ast = parse(template)
  console.log(ast)
  // 将 ast 生成渲染函数
  const render = generate(ast)
  return render
}
