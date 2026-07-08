import { source } from '@/lib/source';

export const dynamic = 'force-static';
export const revalidate = false;

function formatPageMarkdown(page: ReturnType<typeof source.getPages>[number]) {
  const title = page.data.title?.trim() || page.url;
  const body = page.data.getText('processed');

  return body.then((content) => {
    const trimmed = content.trim();
    const heading = `# ${title} (${page.url})`;

    return trimmed.length > 0 ? `${heading}\n\n${trimmed}\n` : `${heading}\n`;
  });
}

export async function GET() {
  const entries = await Promise.all(
    source.getPages().map(async (page) => ({
      url: page.url,
      slugs: page.slugs,
      content: await formatPageMarkdown(page),
    })),
  );

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
