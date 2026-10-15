

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
/*
module.exports = {
  devServer: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
}; */

// vue.config.js
// 🚨 ¡Línea Corregida! Debemos requerir el plugin para usarlo.
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 

module.exports = {
  // Asegúrate de que la extracción de CSS esté habilitada por defecto
  css: {
    extract: true, 
  },
  
  chainWebpack: config => {
    // 1. Eliminamos y reconfiguramos la regla 'css' para asegurarnos de que el plugin se aplique correctamente
    config.module.rule('css').uses.clear();

    // 2. Re-añadimos los loaders esenciales
    config.module
      .rule('css')
      .test(/\.css$/)
      .use('vue-style-loader')
        .loader('vue-style-loader')
        .end()
      .use('css-loader')
        .loader('css-loader')
        .end()
      .use('postcss-loader')
        .loader('postcss-loader')
        .end();

    // 3. Aseguramos que MiniCssExtractPlugin esté en los plugins
    // Nota: Vue CLI ya lo hace, pero lo forzamos aquí para el caso de conflicto
    config
      .plugin('mini-css-extract-plugin')
      .use(MiniCssExtractPlugin, [{
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css',
      }]);
  }
};