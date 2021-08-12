module.exports = {
  base: '/knowledge/',
  themeConfig: {
    sidebar: [
      '/',
      {
        title: 'CSS',
        children: [['/css/priority', '权重']],
      },
      {
        title: 'Vue',
        children: [
          ['/vue/init', '初始化'],
          ['/vue/reactive', '响应式原理'],
        ],
      },
    ],
  },
}
