/**
 * Build script — Minify client-side JavaScript using Terser.
 * Run with: npm run build:js
 * 
 * Processes public/js/depth.js → public/js/depth.min.js
 * This obfuscates the scroll-depth logic so casual users can't read it.
 */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const INPUT = path.join(__dirname, '..', 'public', 'js', 'depth.js');
const OUTPUT = path.join(__dirname, '..', 'public', 'js', 'depth.min.js');

async function build() {
  console.log('[BUILD] Minifying client-side JavaScript...');

  const source = fs.readFileSync(INPUT, 'utf8');

  const result = await minify(source, {
    compress: {
      dead_code: true,
      drop_console: true,
      passes: 2
    },
    mangle: {
      toplevel: true
    },
    output: {
      comments: false
    }
  });

  if (result.error) {
    console.error('[BUILD] Terser error:', result.error);
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT, result.code, 'utf8');

  const originalSize = Buffer.byteLength(source, 'utf8');
  const minifiedSize = Buffer.byteLength(result.code, 'utf8');
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

  console.log(`[BUILD] depth.js: ${originalSize}B → ${minifiedSize}B (${savings}% smaller)`);
  console.log('[BUILD] Output: public/js/depth.min.js ✓');
}

build().catch(err => {
  console.error('[BUILD] Fatal error:', err);
  process.exit(1);
});
