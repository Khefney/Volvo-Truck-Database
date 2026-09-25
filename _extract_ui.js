const fs = require("fs");
const s = fs.readFileSync("index.html", "utf8");
const m = s.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (!m) {
  console.log("no template");
  process.exit(1);
}
let raw = m[1].trim();
if (raw.startsWith('"') && raw.endsWith('"')) raw = JSON.parse(raw);
fs.writeFileSync("_template.html", raw);
console.log("template bytes", raw.length);
const idx = raw.indexOf("const MODELS");
console.log("MODELS at", idx);
const logicStart = raw.lastIndexOf("<script", idx);
console.log("script before MODELS", logicStart, raw.slice(logicStart, logicStart + 80));
