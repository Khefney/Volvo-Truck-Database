const fs = require("fs");
const template = fs.readFileSync("_template.html", "utf8");
const json = JSON.stringify(template).replace(/</g, "\\u003c");
const packed = '<script type="__bundler/template">\n' + json + "\n</script>";
for (const file of ["index.html", "deploy/index.html"]) {
  let html = fs.readFileSync(file, "utf8");
  const start = html.indexOf('<script type="__bundler/template">');
  const end = html.lastIndexOf("</script>");
  if (start < 0 || end < start) throw new Error("missing template in " + file);
  html = html.slice(0, start) + packed + html.slice(end + "</script>".length);
  html = html.replace("<title>Bundled Page</title>", "<title>Volvo Fleet Intelligence</title>");
  fs.writeFileSync(file, html);
}
const a = fs.readFileSync("index.html");
const b = fs.readFileSync("deploy/index.html");
const packedHtml = a.toString("utf8");
const m = packedHtml.match(/<script type="__bundler\/template">\n([\s\S]*?)\n<\/script>/);
const parsed = JSON.parse(m[1]);
if (parsed !== template) throw new Error("packed template does not match source");
if (!parsed.includes("function roundEstimate")) throw new Error("missing round");
if (!parsed.includes("No completed service in the last 90 days")) throw new Error("missing stale rule");
if (parsed.includes("else if (!mine.some(row => row[5] === 'Closed'))")) throw new Error("old health rule still present");
console.log("identical", a.equals(b), "bytes", a.length, "template", parsed.length);
