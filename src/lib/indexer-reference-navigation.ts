const REFERENCE_PATH = '/tools/indexer-api/api-reference';

export function resolveIndexerReferenceTarget(
  href: string,
  currentHref: string,
  knownIds: ReadonlySet<string>,
): string | null {
  try {
    const current = new URL(currentHref);
    const target = new URL(href, current);
    if (current.origin !== target.origin
      || current.pathname.replace(/\/$/, '') !== REFERENCE_PATH
      || target.pathname.replace(/\/$/, '') !== REFERENCE_PATH) return null;
    const id = decodeURIComponent(target.hash.slice(1));
    if (id && knownIds.has(id)) return id;
    // Scalar prefixes operation permalinks with its tag namespace.
    const operation = id.startsWith('tag/') ? id.slice(id.lastIndexOf('/') + 1) : '';
    return /^(?:get|post|put|patch|delete|head|options|trace)-apiv1/.test(operation)
      && knownIds.has(operation) ? operation : null;
  } catch {
    return null;
  }
}

// Scalar keeps its own IDs; existing bookmarks and search results use the text reference.
export function revealIndexerReference(href: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const reference = document.querySelector<HTMLDetailsElement>('details[data-indexer-reference]');
  if (!reference) return false;
  const targets = new Map(Array.from(reference.querySelectorAll<HTMLElement>('[id]'), (node) => [node.id, node]));
  const id = resolveIndexerReferenceTarget(href, window.location.href, new Set(targets.keys()));
  const target = id ? targets.get(id) : undefined;
  if (!target) return false;
  for (let parent: HTMLElement | null = target; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') (parent as HTMLDetailsElement).open = true;
    if (parent === reference) break;
  }
  target.scrollIntoView({ block: 'start', behavior: 'auto' });
  return true;
}
