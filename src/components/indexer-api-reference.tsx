import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReactNode } from 'react';
import { createIndexerReference } from '@/lib/indexer-reference.mjs';
import { IndexerApiReferenceClient } from './indexer-api-reference-client';

export async function IndexerApiReference({ children }: { children: ReactNode }) {
  const [raw, provenance] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/assets/indexer-api/openapi.json'), 'utf8'),
    readFile(path.join(process.cwd(), 'public/assets/indexer-api/openapi.provenance.json'), 'utf8'),
  ]);
  const { operations, server } = createIndexerReference(raw, JSON.parse(provenance));
  return <IndexerApiReferenceClient operations={operations} baseUrl={server}>{children}</IndexerApiReferenceClient>;
}
