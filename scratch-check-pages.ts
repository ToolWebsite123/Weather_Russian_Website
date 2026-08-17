import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "app", "weather-[slug]");
const entries = fs.readdirSync(dir, { withFileTypes: true });

const status: Record<string, boolean> = {};

for (const entry of entries) {
  if (entry.isDirectory()) {
    const pagePath = path.join(dir, entry.name, "page.tsx");
    status[entry.name] = fs.existsSync(pagePath);
  }
}

console.log("Subdirectory page.tsx status:");
console.log(JSON.stringify(status, null, 2));
