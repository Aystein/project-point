const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

module.exports = {
  entry: {
    mylib: path.resolve(__dirname, "src/index.tsx"),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
  output: {
    chunkFilename: "[name].js",
    filename: "[name].js",
  },
  experiments: {
    syncWebAssembly: true,
    topLevelAwait: true
  },
  devServer: {
    client: {
      overlay: false
    }
  },
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "WebAssembly" }],
    }),
  ],
  devtool: "source-map",
};
