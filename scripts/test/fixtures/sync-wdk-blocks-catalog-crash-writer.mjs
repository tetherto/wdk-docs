import fs from 'node:fs/promises';

import { syncWdkBlocksCatalog } from '../../sync-wdk-blocks-catalog.mjs';

const paths = process.argv.slice(2);
if (paths.length !== 4 || paths.some((filePath) => !filePath)) {
  throw new Error(
    'Usage: sync-wdk-blocks-catalog-crash-writer.mjs <source> <markdown> <catalog> <schema>',
  );
}
const [sourcePath, markdownPath, catalogTargetPath, schemaTargetPath] = paths;

let renames = 0;
const fileSystem = {
  ...fs,
  async rename(from, to) {
    await fs.rename(from, to);
    renames += 1;
    if (renames === 2) {
      process.stdout.write('ready\n');
      setInterval(() => {}, 1_000);
      await new Promise(() => {});
    }
  },
};

await syncWdkBlocksCatalog({
  sourcePath,
  markdownPath,
  catalogTargetPath,
  schemaTargetPath,
  fileSystem,
});
