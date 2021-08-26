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
        children: [
          ['/nodejs/IO', 'IO需要注意哪些'],
          ['/nodejs/1', '初始化'],
          ['/nodejs/router', '路由中间件'],
          ['/nodejs/2', '使用mongodb'],
          ['/nodejs/3', '使用redis'],
          ['/nodejs/cache', '缓存模块'],
          ['/nodejs/log', '日志模块'],
        ],
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
