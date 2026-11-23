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
  /**
   * What the reader takes from the providers, such as "pricing information".
   * Switches a service note to "If you choose to use X ..., you must review the applicable terms".
   */
  use?: string;
  /** Names of the linked terms, such as "Market Data Terms". Default to "terms". */
  termsName?: string;
  terms2Name?: string;
};

export type LegalNotePart = string | { text: string; href: string };

function choiceParts(props: LegalNoteProps): LegalNotePart[] {
  const { provider, terms, provider2, terms2, use } = props;
  if (!provider || !terms || !use) return [];

  const first = { text: `${provider}'s ${props.termsName ?? 'terms'}`, href: terms };
  const lead = (names: string) =>
    `If you choose to use ${names} ${use}, you must review the applicable terms and satisfy yourself that your use is compliant (`;
  if (provider2 && terms2) {
    return [
      lead(`${provider} or ${provider2}`),
      first,
      ' and ',
      { text: `${provider2}'s ${props.terms2Name ?? 'terms'}`, href: terms2 },
      '). ',
    ];
  }
  return [lead(provider), first, '). '];
}

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

  if (props.kind === 'service' && props.use) {
    return [...choiceParts(props), 'See also ', legal('third-party-services'), '.'];
  }
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

export function legalNoteMarkdown(props: LegalNoteProps): string {
  return legalNoteParts(props)
    .map((part) => (typeof part === 'string' ? part : `[${part.text}](${part.href})`))
    .join('');
}
