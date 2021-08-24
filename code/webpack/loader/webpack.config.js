const path = require('path')
module.exports = {
  mode: 'production',
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: [
      //     {
      //       loader: path.resolve(__dirname, 'loaders/loader1.js'),
      //     },
      //   ],
      // },
      // {
      //   test: /\.js$/,
      //   use: ['loader1', 'loader2'],
      // },
      // {
      //   test: /\.js$/,
      //   use: 'depend',
      // },
      {
        test: /\.js$/,
        loader: 'babelLoader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
}
