/** @param {string} method @param {string} endpoint */
export function operationAnchor(method, endpoint) {
  return `${method.toLowerCase()}-${endpoint.toLowerCase().replaceAll('/', '').replace(/[{}]/g, '')}`;
}

export function operationAnchors(operations) {
  const used = new Set();
  return operations.map(({ method, endpoint }) => {
    const base = operationAnchor(method, endpoint);
    let anchor = base;
    let suffix = 0;
    while (used.has(anchor)) anchor = `${base}-${++suffix}`;
    used.add(anchor);
    return anchor;
  });
}
