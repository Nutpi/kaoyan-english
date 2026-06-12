const fs = require("fs");
const path = require("path");
const LIB = path.resolve(__dirname, "..", "lib");
const existing = new Set();
fs.readdirSync(LIB).filter(f => f.startsWith("words") && f.endsWith(".ts")).concat(["words.ts"]).forEach(file => {
  const c = fs.readFileSync(path.join(LIB, file), "utf8");
  const m = c.match(/word:\s*'([^']+)'/g);
  if (m) m.forEach(x => existing.add(x.match(/word:\s*'([^']+)'/)[1].toLowerCase()));
});
console.log("Existing unique:", existing.size);
console.log("Need:", 3000 - existing.size);
