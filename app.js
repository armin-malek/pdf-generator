const ejs = require("ejs");
const fs = require("fs");
const { numberToOrdinal } = require("./lib");

let json = JSON.parse(fs.readFileSync("./data.json").toString());
let template = fs.readFileSync("./index.ejs").toString();

fs.writeFileSync(
  "out.html",
  ejs.render(template, { ...json, numberToOrdinal: numberToOrdinal })
);
