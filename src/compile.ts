const fs = require("fs");
const path = require("path");

const contentScript = fs
  .readFileSync(path.join(__dirname, "./content.js"))
  .toString();

const _cssContent = fs
  .readFileSync(path.join(__dirname, "./style.css"))
  .toString();

fs.writeFileSync(
  path.join(__dirname, "content.js"),
  contentScript.replace("{{ CSS_CONTENT }}", _cssContent)
);
