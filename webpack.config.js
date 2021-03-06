const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "siren.bundle.js",
    path: path.resolve(__dirname, "bundle")
  },
  node: {
    fs: "empty"
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }]
  }
}