import Link from 'next/link';
import { Scale } from 'lucide-react';
import type { ReactNode } from 'react';

const LEGAL_PAGE = '/resources/legal';

type LegalNoteProps =
  | { kind: 'community' }
  | { kind: 'community-rows' }
  | { kind: 'service'; provider: string; terms: string };

const linkClass = 'underline underline-offset-2 hover:text-fd-foreground';

function LegalLink({ section }: { section: string }) {
  return (
    <Link href={`${LEGAL_PAGE}#${section}`} className={linkClass}>
      Legal and Disclaimers
    </Link>
  );
}

/**
 * One discreet line that points to the Legal and Disclaimers page.
 * The full notices live on that page, so their wording changes in one place.
 */
export function LegalNote(props: LegalNoteProps) {
  let body: ReactNode;

  if (props.kind === 'service') {
    body = (
      <>
        Calls the {props.provider} API, subject to{' '}
        <a href={props.terms} className={linkClass} target="_blank" rel="noopener noreferrer">
          {props.provider}&apos;s terms
        </a>
        . See <LegalLink section="third-party-services" />.
      </>
    );
  } else if (props.kind === 'community-rows') {
    body = (
      <>
        Rows marked Community are maintained independently by third-party contributors. See{' '}
        <LegalLink section="community-modules" />.
      </>
    );
  } else {
    body = (
      <>
        Community module, maintained independently by third-party contributors. See{' '}
        <LegalLink section="community-modules" />.
      </>
    );
  }

  return (
    <div role="note" className="my-4 flex items-start gap-2 text-sm text-fd-muted-foreground">
      <Scale className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{body}</span>
    </div>
  );
}
