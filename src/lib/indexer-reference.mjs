import { curlTemplate, validateReference } from '../../scripts/indexer-openapi.mjs';
import { operationAnchors } from './indexer-operation-anchor.mjs';

export function createIndexerReference(raw, provenance) {
  const { document, operations, server } = validateReference(raw, provenance);
  const anchors = operationAnchors(operations);
  // Presentation metadata only. The original contract and its exported definitions stay untouched.
  const reference = structuredClone(document);
  reference.servers = [{ url: server }];
  for (const operation of operations) {
    reference.paths[operation.endpoint][operation.method]['x-codeSamples'] = [{
      lang: 'bash', label: 'cURL template', source: curlTemplate(operation, server),
    }];
  }
  return {
    document: reference,
    operations: operations.map(({ method, endpoint, operation }, index) => ({
      method, endpoint, summary: operation.summary, anchor: anchors[index],
      document: {
        ...reference,
        tags: reference.tags?.filter((tag) => operation.tags?.includes(tag.name)),
        paths: { [endpoint]: {
          ...(reference.paths[endpoint].parameters && { parameters: reference.paths[endpoint].parameters }),
          [method]: reference.paths[endpoint][method],
        } },
      },
    })),
  };
}
