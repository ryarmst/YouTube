#!/usr/bin/env node

/**
 * Usage:
 *    node reconstruct.js <source-map-file>
 */

const fs = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

async function main() {
  const [,, mapFilePath] = process.argv;

  if (!mapFilePath) {
    console.error('Usage: node reconstruct.js <source-map-file>');
    process.exit(1);
  }

  if (!fs.existsSync(mapFilePath)) {
    console.error(`ERROR: File not found: ${mapFilePath}`);
    process.exit(1);
  }

  try {
    const rawMapData = fs.readFileSync(mapFilePath, 'utf-8');
    const sourceMap = JSON.parse(rawMapData);
    const consumer = await new SourceMapConsumer(sourceMap);

    // Iterate through each source in the map
    for (const sourcePath of consumer.sources) {

      // Attempt to get its content from 'sourcesContent' within the map
      const content = consumer.sourceContentFor(sourcePath, true); 
      // 'true' prevents throwing an error if content isn't found

      console.log('----------------------------------------');
      console.log(`SOURCE: ${sourcePath}`);
      if (content) {
        console.log(content);
      } else {
        console.log('[No content available in map for this file]');
      }
    }

    consumer.destroy();
  } catch (err) {
    console.error(`ERROR: Failed to parse and display sources => ${err.message}`);
    process.exit(1);
  }
}

main();
