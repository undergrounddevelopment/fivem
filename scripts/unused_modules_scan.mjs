// Scan for TypeScript/JavaScript modules under selected directories that appear to have no imports/usages.
// Usage: node scripts/unused_modules_scan.mjs

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = process.cwd();
const SCAN_DIRS = ['components', 'hooks', 'lib'];
const EXTS = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir) {
  return fs.readdir(dir, { withFileTypes: true }).then(async entries => {
    const files = [];
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await walk(full));
      } else if (EXTS.includes(path.extname(entry.name))) {
        files.push(full);
      }
    }
    return files;
  });
}

async function main() {
  const allFiles = [];
  for (const d of SCAN_DIRS) {
    const dirPath = path.join(root, d);
    try {
      allFiles.push(...await walk(dirPath));
    } catch {
      // ignore missing directory
    }
  }

  // Build content index once for performance
  const codeFiles = await walk(root);
  const contentCache = new Map();
  for (const file of codeFiles) {
    try {
      contentCache.set(file, await fs.readFile(file, 'utf8'));
    } catch {}
  }

  const unused = [];
  for (const file of allFiles) {
    const baseName = path.basename(file).replace(/\.[^.]+$/, '');
    let count = 0;
    for (const [candidatePath, content] of contentCache) {
      if (candidatePath === file) continue;
      if (content.includes(baseName)) {
        count += 1;
        break;
      }
    }
    if (count === 0) {
      unused.push(path.relative(root, file));
    }
  }

  const outPath = path.join(root, 'unused_modules_report.json');
  await fs.writeFile(outPath, JSON.stringify(unused, null, 2), 'utf8');
  console.log(`Unused module scan complete. ${unused.length} candidate files saved to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
