const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "./dist/content.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "content.bundle.js",
  },
};
