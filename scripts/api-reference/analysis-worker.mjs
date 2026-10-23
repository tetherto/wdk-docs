import fs from 'node:fs/promises';
import path from 'node:path';
import { extractPackage } from './extract.mjs';

// Only the trusted executable is imported. The job is data, never --eval source.
let input = '';
for await (const chunk of process.stdin) {
  input += chunk;
  if (input.length > 8 * 1024 * 1024) throw new Error('Analysis job too large');
}
const job = JSON.parse(input);
const report = await extractPackage(job);
await fs.writeFile(path.join(job.outputRoot, 'worker-result.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
