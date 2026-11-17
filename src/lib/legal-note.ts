export const LEGAL_PAGE = '/resources/legal';

export type LegalNoteProps = {
  kind: 'community' | 'community-skill' | 'community-rows' | 'community-marked' | 'service';
  /** Provider the module is built around, with a link to its terms. */
  provider?: string;
  terms?: string;
  /** Second provider, for modules that depend on two services. */
  provider2?: string;
  terms2?: string;
  /** "uses" for protocols that are not an API. Defaults to "Calls the X API". */
  mode?: 'calls' | 'uses';
};

export type LegalNotePart = string | { text: string; href: string };

function providerParts(props: LegalNoteProps): LegalNotePart[] {
  const { provider, terms, provider2, terms2 } = props;
  if (!provider || !terms) return [];

  const first = { text: `${provider}'s terms`, href: terms };
  if (provider2 && terms2) {
    return [
      `Uses ${provider} and ${provider2}, subject to `,
      first,
      ' and ',
      { text: `${provider2}'s terms`, href: terms2 },
      '. ',
    ];
  }

  const lead =
    props.kind === 'service' && props.mode !== 'uses' ? `Calls the ${provider} API` : `Uses ${provider}`;
  return [`${lead}, subject to `, first, '. '];
}

/**
 * The wording of a legal note, as text and links.
 * The page component and the Markdown export both render from this.
 */
export function legalNoteParts(props: LegalNoteProps): LegalNotePart[] {
  const legal = (section: string): LegalNotePart => ({
    text: 'Legal and Disclaimers',
    href: `${LEGAL_PAGE}#${section}`,
  });

  if (props.kind === 'service') {
    return [...providerParts(props), 'See ', legal('third-party-services'), '.'];
  }
  if (props.kind === 'community-rows') {
    return [
      'Rows marked Community are maintained independently by third-party contributors. See ',
      legal('community-modules'),
      '.',
    ];
  }
  if (props.kind === 'community-skill') {
    return [
      'Community skill, maintained independently by a third-party contributor. See ',
      legal('community-modules'),
      '.',
    ];
  }
  if (props.kind === 'community-marked') {
    return [
      'Modules marked Community are maintained independently by third-party contributors. See ',
      legal('community-modules'),
      '.',
    ];
  }
  return [
    'Community module, maintained independently by third-party contributors. ',
    ...providerParts(props),
    'See ',
    legal('community-modules'),
    '.',
  ];
}

const TAG = /<LegalNote\s+([^>]*?)\/>/g;
const ATTRIBUTE = /(\w+)="([^"]*)"/g;

/** Replaces `<LegalNote />` tags in exported Markdown with the sentence they render. */
export function expandLegalNotes(markdown: string): string {
  return markdown.replace(TAG, (_tag, attributes: string) => {
    const props = Object.fromEntries(
      [...attributes.matchAll(ATTRIBUTE)].map((match) => [match[1], match[2]]),
    ) as LegalNoteProps;

    return legalNoteParts(props)
      .map((part) => (typeof part === 'string' ? part : `[${part.text}](${part.href})`))
      .join('');
  });
}
