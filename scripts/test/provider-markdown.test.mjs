import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import { frontmatter } from 'fumadocs-core/content/md/frontmatter';
import { visit } from 'unist-util-visit';

function codeBlocks(markdown) {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(markdown);
  const blocks = [];
  visit(tree, 'code', ({ lang, meta, value }) => {
    blocks.push({ lang, meta, value });
  });
  return blocks;
}

async function processedMarkdown(content) {
  // Same serializer enabled by source.config.ts's includeProcessedMarkdown.
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkLLMs, { _data: true });
  const file = { value: content, data: {} };
  await processor.run(processor.parse(content), file);
  return file.data.markdown;
}

test('processed Markdown keeps both labeled provider variants and their complete examples', async () => {
  const content = [
    '<ProviderSelector>',
    '',
    '## Configure the Wallet',
    '',
    '<ProviderContent value="candide">',
    '',
    '**Candide**',
    '',
    '```javascript title="Candide setup"',
    "import Wallet from '@tetherto/wdk-wallet-evm-erc-4337'",
    "const candideWallet = new Wallet(seedPhrase, { bundlerUrl: 'https://api.candide.dev/public/v3/1' })",
    '```',
    '',
    '</ProviderContent>',
    '',
    '<ProviderContent value="pimlico">',
    '',
    '**Pimlico**',
    '',
    '```javascript title="Pimlico setup"',
    "import Wallet from '@tetherto/wdk-wallet-evm-erc-4337'",
    'const pimlicoWallet = new Wallet(seedPhrase, { bundlerUrl: process.env.PIMLICO_URL })',
    '```',
    '',
    '</ProviderContent>',
    '',
    '## Get an Account',
    '',
    '```javascript',
    'const account = await wallet.getAccount(0)',
    '```',
    '',
    '</ProviderSelector>',
  ].join('\n');

  const markdown = await processedMarkdown(content);
  assert.match(markdown, /\*\*Candide\*\*/);
  assert.match(markdown, /\*\*Pimlico\*\*/);
  assert.deepEqual(codeBlocks(markdown), codeBlocks(content));
  assert.match(markdown, /## Configure the Wallet/);
  assert.match(markdown, /## Get an Account/);
});

for (const module of ['wallet-evm-erc-4337', 'wallet-evm-7702-gasless']) {
  test(`${module} Markdown contains every source code block from both provider paths`, async () => {
    const file = new URL(`../../content/docs/sdk/wallet-modules/${module}/guides/get-started.mdx`, import.meta.url);
    const { content } = frontmatter(await fs.readFile(file, 'utf8'));
    const markdown = await processedMarkdown(content);

    assert.match(markdown, /\*\*Candide\*\*/);
    assert.match(markdown, /\*\*Pimlico\*\*/);
    assert.deepEqual(codeBlocks(markdown), codeBlocks(content));
  });
}
