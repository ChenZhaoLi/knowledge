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
        title: 'NodeJS',
        children: [['/nodejs/IO', 'IO需要注意哪些']],
      },
      {
        title: 'webpack',
        children: [
          ['/webpack/loader', 'webpack的loader'],
          ['/webpack/plugin', 'webpack的plugin'],
        ],
      },
      {
        title: 'Vue',
        children: [
          ['/vue/init', '初始化'],
          ['/vue/reactive', '响应式原理'],
          ['/vue/asyncUpdate', '异步更新'],
          ['/vue/global-api', '全局API'],
        ],
      },
    ],
  },
}
