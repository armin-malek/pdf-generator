const ejs = require("ejs");
const fs = require("fs");

let json = JSON.parse(fs.readFileSync("./data.json").toString());
let template = fs.readFileSync("./template.ejs").toString();

fs.writeFileSync("out.html", ejs.render(template, json));
