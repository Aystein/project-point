const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
    ],
  },
  resolve: { extensions: [".ts"] },
  output: {
    chunkFilename: "[name].js",
    filename: "[name].js",
  },

  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ],
  devtool: "source-map",
};
