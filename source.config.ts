import { execFile as execFileCb } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { tetherSeoFrontmatterSchema } from '@tetherto/docs-seo-schema';
import { z } from "zod";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const execFile = promisify(execFileCb);

async function gitLastModified(filePath: string): Promise<Date | null> {
  const root = process.cwd();
  const relativePath = path.relative(root, filePath);

  const tryGit = async (args: string[]): Promise<Date | null> => {
    try {
      const { stdout } = await execFile('git', args, { cwd: root });
      const value = stdout.trim();
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const fileLog = (target: string) => [
    'log',
    '-1',
    '--follow',
    '--format=%cI',
    '--',
    target,
  ];

  const direct = await tryGit(fileLog(relativePath));
  if (direct) return direct;

  if (relativePath.endsWith('.mdx')) {
    const markdownPath = relativePath.slice(0, -1);
    const previousMarkdown = await tryGit(fileLog(markdownPath));
    if (previousMarkdown) return previousMarkdown;
  }

  return tryGit(['log', '-1', '--format=%cI', 'HEAD']);
}

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema
      .extend({
        titleStyle: z.enum(["code", "text"]).optional(),
      })
      .extend(tetherSeoFrontmatterSchema.shape)
      .passthrough(),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  plugins: [lastModified({ versionControl: gitLastModified })],
  mdxOptions: {
    remarkPlugins: [remarkMath, remarkMdxMermaid],
    rehypePlugins: (v) => [rehypeKatex, ...v],
  },
});
