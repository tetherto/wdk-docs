'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { revealIndexerReference } from '@/lib/indexer-reference-navigation';
import '@scalar/api-reference-react/style.css';

const ApiReference = dynamic(
  () => import('@scalar/api-reference-react').then((module) => module.ApiReferenceReact),
  { ssr: false, loading: () => <p role="status">Loading API reference. The text reference is available.</p> },
);

class ReferenceBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    return this.state.failed
      ? <p role="status">The interactive reference could not load. Use the text reference.</p>
      : this.props.children;
  }
}

export function IndexerApiReferenceClient({ operations, children }: {
  operations: { anchor: string; method: string; endpoint: string; summary: string; document: Record<string, unknown> }[];
  children: ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const fallback = useRef<HTMLDetailsElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(operations[0].anchor);
  const operation = operations.find((item) => item.anchor === selected) ?? operations[0];
  const reveal = useCallback(() => revealIndexerReference(window.location.href), []);
  useEffect(() => {
    reveal();
    window.addEventListener('hashchange', reveal);
    window.addEventListener('popstate', reveal);
    return () => {
      window.removeEventListener('hashchange', reveal);
      window.removeEventListener('popstate', reveal);
    };
  }, [reveal]);

  return (
    <>
      <p>
        <a href="/assets/indexer-api/openapi.json">Download OpenAPI</a>{' · '}
        <a href="/assets/indexer-api/openapi.provenance.json">Snapshot provenance</a>{' · '}
        <Link href="/tools/indexer-api/get-started/">Request an API key</Link>
      </p>
      <p>
        Replace placeholders in the cURL templates before running. For requests with a body, save your
        payload in <code>request.json</code>. Response examples illustrate the schema and are not captured API responses.
      </p>
      <details ref={fallback} data-indexer-reference open className="mt-8">
        <summary className="cursor-pointer font-medium">{loaded ? 'Text reference and complete schemas' : 'Text reference and complete schemas (available while the viewer loads)'}</summary>
        {children}
      </details>
      <label htmlFor="indexer-operation" className="mt-6 mb-2 block font-medium">Choose an endpoint</label>
      <select id="indexer-operation" className="indexer-operation w-full rounded-md border bg-fd-background px-3 py-2 pr-10" value={selected}
        onChange={(event) => {
          if (operations.some((item) => item.anchor === event.target.value)) setSelected(event.target.value);
        }}>
        {operations.map((item) => <option key={item.anchor} value={item.anchor}>
          {item.method.toUpperCase()} {item.endpoint} - {item.summary}
        </option>)}
      </select>
      <div className="not-prose min-w-0 indexer-api-viewer">
        <ReferenceBoundary key={`${operation.anchor}-${resolvedTheme}`} onError={() => { if (fallback.current) fallback.current.open = true; }}>
          <ApiReference
            configuration={{
              content: operation.document,
              forceDarkModeState: resolvedTheme === 'dark' ? 'dark' : 'light',
              hideDarkModeToggle: true,
              showSidebar: false,
              hideSearch: true,
              defaultOpenAllTags: true,
              hideTestRequestButton: true,
              hideClientButton: true,
              agent: { disabled: true },
              telemetry: false,
              withDefaultFonts: false,
              showDeveloperTools: 'never',
              persistAuth: false,
              documentDownloadType: 'none',
              urlRouting: false,
              generateOperationSlug: () => operation.anchor,
              generateTagSlug: () => operation.anchor,
              hiddenClients: true,
              defaultHttpClient: { targetKey: 'custom', clientKey: 'bash' },
              onLoaded: () => {
                if (!loaded) {
                  if (!reveal() && fallback.current && fallback.current.getBoundingClientRect().top >= 0
                    && !fallback.current.contains(window.document.activeElement)) fallback.current.open = false;
                  setLoaded(true);
                }
              },
              customFetch: async () => {
                throw new Error('Request execution is disabled in this reference.');
              },
            }}
          />
        </ReferenceBoundary>
      </div>
    </>
  );
}
