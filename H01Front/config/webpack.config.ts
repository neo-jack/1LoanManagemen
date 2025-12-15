/**
 * 自定义 webpack 配置函数
 * @param config webpack-chain 配置对象
 * @param env 环境变量 'development' | 'production'
 * @param webpack webpack 实例
 */
export function chainWebpack(
  config: any,
  { env, webpack }: { env: string; webpack: any },
) {
  // ========== 示例1: 添加自定义 alias ==========
  // config.resolve.alias.set('@utils', require('path').resolve(__dirname, '../src/utils'));

  // ========== 示例2: 修改 output 配置 ==========
  // config.output.filename('[name].[contenthash:8].js');

  // ========== 示例3: 添加自定义 plugin ==========
  // const YourPlugin = require('your-plugin');
  // config.plugin('your-plugin').use(YourPlugin, [{ /* options */ }]);

  // ========== 示例4: 配置 externals（CDN 引入时使用）==========
  // config.externals({
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  // });

  // ========== 示例5: 修改 splitChunks 配置 ==========
  // config.optimization.splitChunks({
  //   chunks: 'all',
  //   minSize: 30000,
  //   cacheGroups: {
  //     vendors: {
  //       name: 'vendors',
  //       test: /[\\/]node_modules[\\/]/,
  //       priority: 10,
  //     },
  //     antd: {
  //       name: 'antd',
  //       test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
  //       priority: 20,
  //     },
  //   },
  // });

  // ========== 示例6: 添加自定义 loader ==========
  // config.module
  //   .rule('custom-rule')
  //   .test(/\.custom$/)
  //   .use('custom-loader')
  //   .loader('custom-loader')
  //   .options({ /* loader options */ });

  // ========== 示例7: 修改已有 loader 配置 ==========
  // config.module
  //   .rule('js')
  //   .use('babel-loader')
  //   .tap((options) => {
  //     // 修改 babel-loader 配置
  //     return { ...options, cacheDirectory: true };
  //   });

  // ========== 示例8: 配置 devServer ==========
  // 注意: devServer 配置建议在 .umirc.ts 中直接配置

  // ========== 示例9: 添加环境判断 ==========
  if (env === 'production') {
    // 生产环境特定配置
    // config.optimization.minimize(true);
  } else {
    // 开发环境特定配置
    // config.devtool('eval-cheap-module-source-map');
  }
}
