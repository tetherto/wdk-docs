import assert from 'node:assert/strict';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { rehypeCode } from 'fumadocs-core/mdx-plugins';
import config from '../../source.config.ts';

const descendants = (node) => [node, ...(node.children ?? []).flatMap(descendants)];
async function render(source) {
  const processor = unified().use(remarkParse).use(remarkRehype)
    .use(rehypeCode, config.mdxOptions.rehypeCodeOptions);
  return descendants(await processor.run(processor.parse(source)));
}

test('plain JSON retains exact text without token spans; other code and default annotations keep highlighting', async () => {
  const raw = JSON.stringify({ token: 'usdt', value: '<script>{literal}</script>', nested: [null, 0.1] }, null, 2);
  const plain = await render(`\`\`\`json plain\n${raw}\n\`\`\``);
  const code = plain.find((node) => node.tagName === 'code');
  assert.deepEqual(code.children, [{ type: 'text', value: raw }]);
  assert.ok(plain.some((node) => node.tagName === 'pre'));

  for (const fence of ['json', 'json title="plain"', 'text plain']) {
    const ordinary = await render(`\`\`\`${fence}\n${raw}\n\`\`\``);
    assert.ok(ordinary.some((node) => node.tagName === 'span'), fence);
  }
  const annotated = await render('```js\nconst value = 1; // [!code highlight]\n```');
  assert.ok(annotated.some((node) => node.properties?.class?.includes('highlighted')));
});
