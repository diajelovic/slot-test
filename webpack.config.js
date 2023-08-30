const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
  const isDEV = !env || !env.production;

  return {
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new HtmlWebpackPlugin({
        template: "index.html"
      }),
    ],
    entry: './main.ts',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    context: path.resolve(__dirname, 'src'),
    mode: isDEV ? "development" : "production",
    devtool: "eval-source-map",
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        },
        {test: /\.[j|t]sx?$/, exclude: /node_modules/, loader: 'babel-loader'},
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {},
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 9000
    }
  }
};


