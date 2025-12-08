#!/usr/bin/env node

/**
 * reconstruct2.js
 * 
 * A script that:
 * 1. Reads a minified JS file and its .map file.
 * 2. Uses source-map to figure out which slices of the minified code 
 *    correspond to each original source.
 * 3. Prints those minified code chunks grouped by source.
 * 
 * Usage:
 *   node show-minified-chunks.js <bundle.min.js> <bundle.min.js.map>
 * 
 * Limitations:
 *   - Output is just the minified slices grouped by source path.
 *   - This does NOT recover the true original source if it wasn't embedded.
 */

const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

function extractSubstring(lines, startLine, startCol, endLine, endCol) {
  if (startLine === endLine) {
    return lines[startLine - 1].slice(startCol, endCol);
  }

  const result = [];

  result.push(lines[startLine - 1].slice(startCol));

  for (let ln = startLine + 1; ln < endLine; ln++) {
    result.push(lines[ln - 1]);
  }

  result.push(lines[endLine - 1].slice(0, endCol));

  return result.join('\n');
}

(async function main() {
  const [,, minFilePath, mapFilePath] = process.argv;
  if (!minFilePath || !mapFilePath) {
    console.error('Usage: node show-minified-chunks.js <bundle.min.js> <bundle.min.js.map>');
    process.exit(1);
  }

  if (!fs.existsSync(minFilePath) || !fs.existsSync(mapFilePath)) {
    console.error('ERROR: One or both files not found.');
    process.exit(1);
  }

  const minCode = fs.readFileSync(minFilePath, 'utf8');
  const mapData = JSON.parse(fs.readFileSync(mapFilePath, 'utf8'));
  
  let consumer;
  try {
    consumer = await new SourceMapConsumer(mapData);
  } catch (err) {
    console.error('ERROR: Failed to parse source map =>', err.message);
    process.exit(1);
  }

  const lines = minCode.split(/\r?\n/);

  const mappings = [];
  consumer.eachMapping(m => {
    if (m.source) {
      mappings.push(m);
    }
  });

  mappings.sort((a, b) => {
    if (a.generatedLine === b.generatedLine) {
      return a.generatedColumn - b.generatedColumn;
    }
    return a.generatedLine - b.generatedLine;
  });

  const codeBySource = {};

  for (let i = 0; i < mappings.length; i++) {
    const current = mappings[i];
    const next = mappings[i + 1];

    const startLine = current.generatedLine;
    const startCol = current.generatedColumn;
    let endLine, endCol;

    if (next) {
      endLine = next.generatedLine;
      endCol  = next.generatedColumn;
    } else {
      endLine = current.generatedLine;
      endCol  = lines[endLine - 1].length;
    }

    const snippet = extractSubstring(lines, startLine, startCol, endLine, endCol);

    codeBySource[current.source] = (codeBySource[current.source] || '') + snippet;
  }

  consumer.destroy();

  Object.keys(codeBySource).forEach(source => {
    console.log('============================================');
    console.log(`SOURCE: ${source}`);
    console.log('--------------------------------------------');
    console.log(codeBySource[source]);
    console.log('============================================\n');
  });
})();
