import type { JsonLdGraph } from '@tetherto/docs-seo-core';

export type DocsJsonLdProps = {
  data: JsonLdGraph;
};

export function DocsJsonLd({ data }: DocsJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
