const path = require('path');

module.exports = {
  entry: {
    main: './src/index.tsx',
  },
  builtins: {
    html: [{ template: './index_rspack.html' }],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.wgsl/,
        type: 'asset/source'
      },
      {
        test: /\.png/,
        type: 'asset/resource'
      }
    ]
  },
};