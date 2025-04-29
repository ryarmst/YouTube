#!/usr/bin/env node

// Prereq: esprima

const fs = require("fs");
const esprima = require("esprima");

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

(async () => {
  let code = "";

  if (!process.stdin.isTTY) {
    code = await readStdin();
  } else if (process.argv[2]) {
    const filePath = process.argv[2];
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    code = fs.readFileSync(filePath, "utf8");
  } else {
    console.error("Usage: cat file.js | extract-comments.js OR extract-comments.js file.js");
    process.exit(1);
  }

  const ast = esprima.parseScript(code, {
    comment: true,
    loc: true,
    range: true,
  });

  const comments = ast.comments;

  if (comments.length === 0) {
    console.log("No comments found.");
    return;
  }

  comments.forEach(comment => {
    console.log(`[${comment.type}] Line ${comment.loc.start.line}: ${comment.value.trim()}`);
  });
})();
