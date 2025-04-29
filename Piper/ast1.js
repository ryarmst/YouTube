#!/usr/bin/env node

// Prereq: must install SWC

const fs = require("fs");
const swc = require("@swc/core");

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");

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
    code = fs.readFileSync(filePath, "utf-8");
  } else {
    console.error("Usage:\n  cat file.js | dump-ast.js\n  dump-ast.js file.js");
    process.exit(1);
  }

  const ast = await swc.parse(code, {
    syntax: "ecmascript",
    dynamicImport: true,
    jsx: true,
  });

  console.log(JSON.stringify(ast, null, 2));
})();
