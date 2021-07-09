const webpack = require('webpack')

module.exports = {
  filenameHashing: false,
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      }),
    ]
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
