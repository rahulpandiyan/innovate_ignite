const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const KEEP = new Set(["BGMI & FreeFire", "Project Expo"]);

function stripFees(text) {
  return text
    .replace(/Solo ₹\d+ \/ Group ₹\d+/g, "Free")
    .replace(/Solo ₹\d+ \(max 5 min\)/g, "Solo (max 5 min)")
    .replace(/Group (2-\d+) ₹\d+ \(5-7 min\)/g, "Group $1 (5-7 min)")
    .replace(/₹\d+ per (team|member|participant|head)/g, "Free")
    .replace(/₹\d+/g, "Free");
}

function fixSeed(file) {
  const p = path.join(ROOT, file);
  const src = fs.readFileSync(p, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);
  let currentEvent = null;
  let prices = 0;
  let groups = 0;
  let rules = 0;

  const out = lines.map((line) => {
    const nameMatch = line.match(/^\s{6}name: "([^"]+)",$/);
    if (nameMatch) currentEvent = nameMatch[1];
    const free = currentEvent && !KEEP.has(currentEvent);

    if (free && /^\s{6}price: \d+,$/.test(line)) {
      prices++;
      return line.replace(/price: \d+/, "price: 0");
    }
    if (free && /^\s{6}groupPrice: \d+,$/.test(line)) {
      groups++;
      return line.replace(/groupPrice: \d+/, "groupPrice: null");
    }
    if (free && line.includes('rules: "') && line.includes("₹")) {
      rules++;
      const stripped = stripFees(line);
      if (stripped.includes("₹")) throw new Error(`₹ left in ${file} for ${currentEvent}: ${stripped}`);
      return stripped;
    }
    return line;
  });

  const next = out.join(eol);
  fs.writeFileSync(p, next, "utf8");
  console.log(`${file}: prices->0: ${prices}, groupPrice->null: ${groups}, rules stripped: ${rules}`);
}

fixSeed("scripts/seed-prod.ts");
fixSeed("scripts/seed-rbac.ts");

// seed-rbac demo registration on VV CARE (now free) should be CONFIRMED, not PENDING
const rbacPath = path.join(ROOT, "scripts/seed-rbac.ts");
let rbac = fs.readFileSync(rbacPath, "utf8");
const before = rbac;
rbac = rbac.replace(
  /event: acappella,(\r?\n)\s{4}collegeId: gat.id,\1\s{4}status: "PENDING",/,
  (m, nl) => m.replace('status: "PENDING"', 'status: "CONFIRMED"')
);
if (rbac === before) throw new Error("seed-rbac demo registration pattern not found");
fs.writeFileSync(rbacPath, rbac, "utf8");
console.log("seed-rbac.ts: VV CARE demo registration PENDING -> CONFIRMED");
