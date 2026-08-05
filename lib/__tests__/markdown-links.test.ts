import { describe, it, expect } from "vitest";
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

describe("Markdown Path Safety Check", () => {
  it("ensures no tracked .md files contain local absolute file:/// links", () => {
    const mdFiles = getAllMarkdownFiles(process.cwd());
    const offendingFiles: string[] = [];

    for (const filePath of mdFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("file:///")) {
        offendingFiles.push(path.relative(process.cwd(), filePath));
      }
    }

    expect(
      offendingFiles,
      `The following markdown files contain local absolute 'file:///' links:\n${offendingFiles.join("\n")}`
    ).toEqual([]);
  });
});
