
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
  context: __dirname + "/src",
  devtool: 'source-map',
  entry: {
    app: ['./scripts/main.js']
  },
  output: {
    //publicPath: '',        
    filename: 'assets/scripts/[name].bundle.js',
    path: __dirname + "./build"    
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "common",
      filename: "assets/scripts/common.js",
      minChunks: 2
    }),
    new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true 
    }),
    // new StyleLintPlugin({
    //   configFile: './.stylelintrc',
    // })
    //new FaviconsWebpackPlugin('./favicon.png')
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader']
      },
      // {
      //   test: /\.js$/,
      //   enforce: "pre",
      //   exclude: /(node_modules|bower_components)/,
      //   loader: "eslint-loader",
      //   options: {
      //       fix: true
      //   }
      // },
    ]
  }
};
