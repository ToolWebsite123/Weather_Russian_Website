import fs from "fs";
import path from "path";

function getAllMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    if (file === "node_modules" || file === ".next" || file === ".git") continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results.push(...getAllMarkdownFiles(fullPath));
    } else if (file.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

function checkMarkdownLinks() {
  const mdFiles = getAllMarkdownFiles(process.cwd());
  let hasErrors = false;

  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("file:///")) {
      console.error(
        `❌ Error: Found absolute local link 'file:///' in ${path.relative(process.cwd(), filePath)}`
      );
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log(`✅ All ${mdFiles.length} markdown files passed path sanity check (no 'file:///' links).`);
  }
}

checkMarkdownLinks();
