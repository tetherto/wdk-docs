import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { digest, within, readJson, snapshot, createOutput, writeJson, compareSnapshots } from './io.mjs';

const toolRoot = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(toolRoot, '../..');
const sha = /^[0-9a-f]{40}$/;
const help = `WDK API-reference preparation pilot (Node 22.13+)
  npm run api-reference -- capabilities
  npm run api-reference -- inspect --bundle INPUT.json --out NEW_DIRECTORY [--baseline RECEIPT.json]
  npm run api-reference -- observe --module core|evm --out NEW_DIRECTORY [--review-policy POLICY.json] [--published-baseline RECEIPT.json]
  npm run api-reference -- epoch --state STATE.json --event EVENT.json --out NEW_DIRECTORY
Outputs are scratch evidence. No command edits docs, approves content, commits, pushes or merges.
`;

async function toolIdentity() {
  const files = ['main.mjs', 'analysis-worker.mjs', 'io.mjs', 'extract.mjs', 'observe.mjs', 'candidate.mjs', 'modules.json'];
  const hashes = {};
  for (const file of files) hashes[file] = digest(await fs.readFile(path.join(toolRoot, file)));
  const versions = {};
  for (const name of ['typedoc', 'typedoc-plugin-markdown', 'typescript']) versions[name] = (await readJson(path.join(docsRoot, 'node_modules', name, 'package.json'))).version;
  return { sourceDigest: digest(JSON.stringify(hashes)), lockDigest: digest(await fs.readFile(path.join(docsRoot, 'package-lock.json'))), versions };
}

export function validateBundle(bundle, modules) {
  if (bundle.schemaVersion !== 1 || !Object.hasOwn(modules, bundle.module)) throw new Error('Unsupported bundle schema/module');
  if (typeof bundle.packageRoot !== 'string' || !bundle.packageRoot) throw new Error('packageRoot is required');
  const input = bundle.input;
  if (!input || !['source-preview', 'released-artifact'].includes(input.kind)) throw new Error('Explicit input kind is required');
  if (input.kind === 'source-preview' && (!sha.test(input.commit ?? '') || !sha.test(input.tree ?? '') || input.repository !== modules[bundle.module].repository)) throw new Error('Source preview requires the registered repository and immutable commit/tree');
  if (input.kind === 'released-artifact' && (typeof input.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(input.version))) throw new Error('Released input requires an exact version');
  if (!Array.isArray(bundle.dependencies ?? []) || (bundle.dependencies ?? []).some((d) => typeof d.name !== 'string' || typeof d.root !== 'string')) throw new Error('Dependencies must be explicit name/root records');
  if (bundle.expectedSnapshot && !/^[0-9a-f]{64}$/.test(bundle.expectedSnapshot)) throw new Error('Invalid expectedSnapshot');
  return modules[bundle.module];
}

export function verifyStagedFiles(acquired, staged, label) {
  if (!Array.isArray(staged)) throw new Error(`Missing staged input evidence: ${label}`);
  const expected = Object.entries(acquired.files).filter(([name]) => /\.(?:[cm]?js|[cm]?ts|json)$/.test(name));
  const actual = new Map();
  for (const row of staged) {
    if (actual.has(row.path) || acquired.files[row.path] !== row.sha256) throw new Error(`Staged bytes disagree with acquired snapshot: ${label}`);
    actual.set(row.path, row.sha256);
  }
  if (actual.size !== expected.length || expected.some(([name, hash]) => actual.get(name) !== hash)) throw new Error(`Staged input coverage mismatch: ${label}`);
}

async function runAnalysis(job) {
  if (Number(process.versions.node.split('.')[0]) !== 22 || Number(process.versions.node.split('.')[1]) < 13) throw new Error('Use the qualified Node 22.13+ toolchain');
  if (![job.packageRoot, ...job.dependencies.map((d) => d.root)].every((root) => within(job.frozenInputRoot, root))) throw new Error('Worker inputs must be frozen inside its scratch run');
  const reads = [toolRoot, path.join(docsRoot, 'node_modules'), job.outputRoot, job.frozenInputRoot];
  if (reads.some((p) => /[*,\n\r]/.test(p))) throw new Error('Unsupported character in analysis read root');
  const args = ['--permission', ...reads.map((root) => `--allow-fs-read=${root}`), `--allow-fs-write=${job.outputRoot}`, path.join(toolRoot, 'analysis-worker.mjs')];
  // No HOME, credential variables, NODE_OPTIONS, package-manager config or checkout credentials.
  const env = { PATH: path.dirname(process.execPath), LANG: 'C.UTF-8', TMPDIR: job.outputRoot };
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: job.outputRoot, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let log = '';
    let ended = false;
    const timeout = setTimeout(() => child.kill('SIGKILL'), 180000);
    const capture = (chunk) => { log += chunk; if (log.length > 1024 * 1024) child.kill('SIGKILL'); };
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    child.on('error', (error) => { clearTimeout(timeout); ended = true; reject(error); });
    child.on('close', async (code, signal) => {
      clearTimeout(timeout);
      if (ended) return;
      try {
        await fs.writeFile(path.join(job.outputRoot, 'analysis.log'), log, { flag: 'wx' });
        if (code !== 0) reject(new Error(`Analysis failed (${signal ?? code}); see analysis.log`));
        else resolve();
      } catch (error) { reject(error); }
    });
    child.stdin.on('error', () => {}); // Process failure is reported by close/error above.
    child.stdin.end(JSON.stringify(job));
  });
  return readJson(path.join(job.outputRoot, 'worker-result.json'));
}

async function freezeFiles(originalRoot, acquired, destination) {
  await fs.mkdir(destination, { recursive: true });
  for (const [name, hash] of Object.entries(acquired.files)) {
    if (!/\.(?:[cm]?js|[cm]?ts|json)$/.test(name)) continue;
    const bytes = await fs.readFile(path.join(originalRoot, name));
    if (digest(bytes) !== hash) throw new Error('Input changed while freezing analysis files');
    const target = path.join(destination, name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes, { flag: 'wx' });
  }
  return destination;
}

export async function inspectBundle(bundle, { out, baseline } = {}) {
  const registration = await readJson(path.join(toolRoot, 'modules.json'));
  const module = validateBundle(bundle, registration.modules);
  const packageRoot = await fs.realpath(bundle.packageRoot);
  const dependencies = await Promise.all((bundle.dependencies ?? []).map(async (d) => ({ ...d, root: await fs.realpath(d.root) })));
  const acquired = await snapshot(packageRoot);
  if (bundle.expectedSnapshot && bundle.expectedSnapshot !== acquired.sha256) throw new Error('Acquired package snapshot changed');
  const packageJson = await readJson(path.join(packageRoot, 'package.json'));
  if (packageJson.name !== module.packageName || (bundle.input.kind === 'released-artifact' && packageJson.version !== bundle.input.version)) throw new Error('Package identity disagrees with the explicit input');
  const dependencyInputs = await Promise.all(dependencies.map(async (d) => ({ name: d.name, root: d.root, package: await readJson(path.join(d.root, 'package.json')), snapshot: await snapshot(d.root) })));
  for (const d of dependencyInputs) if (d.package.name !== d.name) throw new Error('Dependency identity mismatch');
  const output = await createOutput(out, [await fs.realpath(docsRoot), packageRoot, ...dependencies.map((d) => d.root)]);
  const before = await fs.readFile(path.join(docsRoot, module.docsPath), 'utf8');
  const head = execFileSync('git', ['-C', docsRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const tool = await toolIdentity();
  try {
    // Acquire byte-verified copies before credential-free analysis. The worker
    // has no filesystem capability for the originals or excluded input assets.
    const frozenPackage = await freezeFiles(packageRoot, acquired, path.join(output, 'frozen', 'package'));
    const frozenDependencies = [];
    for (const [index, dependency] of dependencyInputs.entries()) {
      const root = await freezeFiles(dependency.root, dependency.snapshot, path.join(output, 'frozen', `dependency-${index}`));
      frozenDependencies.push({ ...dependencies[index], root });
    }
    const analysisOutput = path.join(output, 'analysis-output');
    await fs.mkdir(analysisOutput);
    const extraction = await runAnalysis({ packageRoot: frozenPackage, packageName: module.packageName, outputRoot: analysisOutput, frozenInputRoot: path.join(output, 'frozen'), profile: module.profile, dependencies: frozenDependencies });
    extraction.outputPath = 'analysis-output';
    if (extraction.package?.name !== module.packageName || extraction.package.version !== packageJson.version || (bundle.input.kind === 'released-artifact' && extraction.package.version !== bundle.input.version)) throw new Error('Staged package identity disagrees with the explicit input');
    verifyStagedFiles(acquired, extraction.inputFiles, 'package');
    if (!Array.isArray(extraction.analyzedDependencies) || extraction.analyzedDependencies.length !== dependencyInputs.length) throw new Error('Missing staged dependency evidence');
    for (const [index, dependency] of dependencyInputs.entries()) {
      const staged = extraction.analyzedDependencies[index];
      if (staged.inputIndex !== index || staged.name !== dependency.name || staged.version !== dependency.package.version) throw new Error('Staged dependency identity mismatch');
      verifyStagedFiles(dependency.snapshot, staged.files, `dependency ${index}`);
    }
    if ((await snapshot(packageRoot)).sha256 !== acquired.sha256) throw new Error('Input changed during analysis');
    for (const d of dependencyInputs) if ((await snapshot(d.root)).sha256 !== d.snapshot.sha256) throw new Error('Dependency changed during analysis');
    if (digest(await fs.readFile(path.join(docsRoot, module.docsPath), 'utf8')) !== digest(before)) throw new Error('Authored preimage changed during analysis');
    if (JSON.stringify(await toolIdentity()) !== JSON.stringify(tool)) throw new Error('Trusted tooling changed during analysis');
    const receipt = {
      schemaVersion: 1, module: bundle.module, input: bundle.input, acquired,
      tool,
      identityEvidence: { expectedSnapshotMatched: Boolean(bundle.expectedSnapshot), remoteSourceApproval: 'not-verified-by-inspector', artifactCorrespondence: 'requires-acquisition-evidence' },
      dependencies: dependencyInputs.map((d) => ({ name: d.name, version: d.package.version, root: d.root, sha256: d.snapshot.sha256 })),
      docs: { base: head, path: module.docsPath, preimage: digest(before) }, extraction,
      readiness: { sourceApproval: 'not-evaluated', contentReview: 'pending', publicationBinding: 'pending', docsAccepted: false, deployed: false },
    };
    if (baseline) {
      const old = await readJson(baseline);
      if (old.schemaVersion !== 1 || old.module !== receipt.module || !old.acquired?.files) throw new Error('Baseline receipt schema/module mismatch');
      receipt.change = { scope: 'acquired package bytes; not semantic acceptance', files: compareSnapshots(old.acquired, acquired), authoredPreimageChanged: old.docs?.preimage !== receipt.docs.preimage };
    }
    await fs.writeFile(path.join(output, 'authored-before.md'), before, { flag: 'wx' });
    await writeJson(path.join(output, 'receipt.json'), receipt);
    const changed = receipt.change?.files.map((row) => `- ${row.change}: ${row.file}`).join('\n') ?? 'No baseline supplied. This run cannot claim no change.';
    await fs.writeFile(path.join(output, 'review-packet.md'), `# ${module.packageName}: API-reference review packet\n\nInput: ${bundle.input.kind}. Mechanical extraction: ${extraction.mechanicalState}.\n\nAuthored before: authored-before.md (SHA-256 ${receipt.docs.preimage}).\n\nStock Markdown and raw source/declaration reflections are in this run. They are review evidence; source eligibility, behavior, related guides, private-key/fee/disposal/policy qualifications, incoming anchors and copyable examples need deliberate review. No authored text was replaced.\n\n## Acquired-file changes\n\n${changed}\n\nIdentical signatures cannot close behavior review. Source/version labels and supplied provenance are assertions until their acquisition/approval evidence is qualified.\n\n## Reviewer dispositions required\n\nSelect the affected operation/context; pair its authored fragment, source/type evidence and proposed bounded patch. Record retain/revise/remove/blocked with reasons; close the related-guidance impact scope. Keep published catch-up separate. Source-preview install/version binding and actual released-artifact checks remain pending.\n`, { flag: 'wx' });
    return { output, mechanicalState: extraction.mechanicalState, receipt: path.join(output, 'receipt.json') };
  } catch (error) {
    await writeJson(path.join(output, 'failure.json'), { schemaVersion: 1, status: 'failed', message: error.message });
    throw error;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  const { values } = parseArgs({ args: rest, strict: true, options: Object.fromEntries(['bundle', 'out', 'baseline', 'module', 'review-policy', 'baseline-commit', 'published-baseline', 'state', 'event'].map((key) => [key, { type: 'string' }])) });
  if (!command || command === '--help' || command === 'help') { console.log(help); return; }
  if (command === 'capabilities') {
    console.log(JSON.stringify({ schemaVersion: 1, node: '22.x, at least 22.13', tool: await toolIdentity(), profiles: ['core', 'evm'], commands: ['inspect', 'observe', 'epoch'], output: 'scratch evidence only', automaticWrites: false }));
    return;
  }
  if (!values.out) throw new Error('--out NEW_DIRECTORY is required');
  if (command === 'inspect') {
    if (!values.bundle) throw new Error('--bundle is required');
    console.log(JSON.stringify(await inspectBundle(await readJson(values.bundle), { out: values.out, baseline: values.baseline })));
  } else if (command === 'observe') {
    const { modules } = await readJson(path.join(toolRoot, 'modules.json'));
    if (!Object.hasOwn(modules, values.module)) throw new Error('Select registered --module core|evm');
    const policy = values['review-policy'] ? await readJson(values['review-policy']) : { mode: 'repository-rules' };
    if (values['baseline-commit'] && !sha.test(values['baseline-commit'])) throw new Error('Use an immutable baseline SHA');
    if (values['baseline-commit'] && values['published-baseline']) throw new Error('Select one published baseline input');
    const publishedBaseline = values['published-baseline'] ? await readJson(values['published-baseline']) : values['baseline-commit'] ? { sourceCommit: values['baseline-commit'] } : undefined;
    const { observeSource } = await import('./observe.mjs');
    const result = await observeSource({ ...modules[values.module], reviewPolicy: policy, publishedBaseline });
    const output = await createOutput(values.out, [await fs.realpath(docsRoot)]);
    await writeJson(path.join(output, 'observation.json'), result);
    console.log(JSON.stringify({ output, completeness: result.completeness, errors: result.errors }));
  } else if (command === 'epoch') {
    if (!values.state || !values.event) throw new Error('--state and --event are required');
    const { transitionState } = await import('./candidate.mjs');
    const result = transitionState(await readJson(values.state), await readJson(values.event));
    const output = await createOutput(values.out, [await fs.realpath(docsRoot)]);
    await writeJson(path.join(output, 'candidate.json'), result);
    console.log(JSON.stringify({ output, scope: 'local evidence; remote acceptance requires its own receipt' }));
  } else throw new Error(`Unknown command ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
