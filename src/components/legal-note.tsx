import Link from 'next/link';
import { Scale } from 'lucide-react';

import { legalNoteParts, type LegalNoteProps } from '@/lib/legal-note';

const linkClass = 'underline underline-offset-2 hover:text-fd-foreground';

/**
 * One discreet line that points to the Legal and Disclaimers page.
 * The full notices live on that page, so their wording changes in one place.
 */
export function LegalNote(props: LegalNoteProps) {
  return (
    <div role="note" className="my-4 flex items-start gap-2 text-sm text-fd-muted-foreground">
      <Scale className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        {legalNoteParts(props).map((part, index) => {
          if (typeof part === 'string') return part;
          return part.href.startsWith('/') ? (
            <Link key={index} href={part.href} className={linkClass}>
              {part.text}
            </Link>
          ) : (
            <a key={index} href={part.href} className={linkClass} target="_blank" rel="noopener noreferrer">
              {part.text}
            </a>
          );
        })}
      </span>
    </div>
  );
}
