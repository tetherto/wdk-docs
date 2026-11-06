import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export const digest = (value) => createHash('sha256').update(value).digest('hex');
export const within = (root, file) => file === root || file.startsWith(root + path.sep);

export function parseJson(text, label = 'JSON') {
  const value = JSON.parse(text);
  const tree = ts.parseJsonText(label, text);
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const names = new Set();
      for (const property of node.properties) {
        const name = property.name?.text;
        if (names.has(name)) throw new Error(`Duplicate JSON key ${name} in ${label}`);
        names.add(name);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return value;
}

export async function readJson(file) {
  const stat = await fs.lstat(file);
  if (!stat.isFile() || stat.size > 8 * 1024 * 1024) throw new Error('Expected a bounded regular JSON file');
  return parseJson(await fs.readFile(file, 'utf8'), file);
}

export async function snapshot(root) {
  root = await fs.realpath(root);
  const files = {};
  let bytes = 0;
  let count = 0;
  const walk = async (directory) => {
    const names = (await fs.readdir(directory)).sort();
    for (const name of names) {
      if (name === '.git' || name === 'node_modules') continue;
      const file = path.join(directory, name);
      const stat = await fs.lstat(file);
      if (stat.isSymbolicLink()) throw new Error(`Input symlink is unsupported: ${path.relative(root, file)}`);
      if (stat.isDirectory()) await walk(file);
      else if (stat.isFile()) {
        bytes += stat.size;
        if (bytes > 100 * 1024 * 1024 || ++count > 10000) throw new Error('Input snapshot limit exceeded');
        files[path.relative(root, file).split(path.sep).join('/')] = digest(await fs.readFile(file));
      } else throw new Error('Special input files are unsupported');
    }
  };
  await walk(root);
  return { sha256: digest(JSON.stringify(files)), files, bytes };
}

export async function createOutput(destination, protectedRoots) {
  const parent = await fs.realpath(path.dirname(path.resolve(destination)));
  const output = path.join(parent, path.basename(destination));
  for (const root of protectedRoots) {
    if (within(root, output) || within(output, root)) throw new Error('Output must be outside the docs checkout and acquired inputs');
  }
  // Exclusive creation: never replace a prior run, authored file, symlink or another writer.
  await fs.mkdir(output);
  return output;
}

export async function writeJson(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
}

export function compareSnapshots(before, after) {
  const entries = [];
  for (const file of [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].sort()) {
    const oldHash = before.files[file];
    const newHash = after.files[file];
    if (oldHash !== newHash) entries.push({ file, change: !oldHash ? 'added' : !newHash ? 'removed' : 'changed', before: oldHash ?? null, after: newHash ?? null });
  }
  return entries;
}
