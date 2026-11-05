import { createElement, type ReactNode } from 'react';
import type { Node } from 'fumadocs-core/page-tree';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { resolveIcon } from '@/lib/resolveIcon';
import { buildTree } from '@/lib/nav/build.mjs';
import disposition from '@/lib/nav/disposition.mjs';

// The site's navigation. To change where something appears, edit src/lib/nav/disposition.mjs.
// To add or rename pages inside a module, edit src/lib/nav/inventory.mjs.

const STATUS_LABELS: Record<string, string> = {
  community: 'Community',
  deprecated: 'Deprecated',
  alpha: 'Alpha',
};

function label(name: string, status?: string): ReactNode {
  if (!status) return name;
  return createElement(
    'span',
    { className: 'inline-flex items-center gap-1.5' },
    name,
    createElement(
      'span',
      { className: 'rounded border px-1 py-px text-[0.625rem] font-medium leading-none text-fd-muted-foreground' },
      STATUS_LABELS[status],
    ),
  );
}

type PlainNode = {
  type: 'page' | 'folder' | 'separator';
  name: string;
  url?: string;
  icon?: string;
  status?: string;
  root?: boolean;
  landing?: string;
  defaultOpen?: boolean;
  index?: { name: string; url: string; type: 'page' };
  children?: PlainNode[];
};

function toNode(node: PlainNode): Node {
  const { icon, status, children, ...rest } = node;
  return {
    ...rest,
    name: label(node.name, status),
    ...(icon ? { icon: resolveIcon(icon) } : {}),
    ...(children ? { children: children.map(toNode) } : {}),
  } as Node;
}

export const customTree: Node[] = (buildTree(disposition) as PlainNode[]).map(toNode);

export const navTabs = getLayoutTabs({ name: 'docs', children: customTree }).map((tab) => {
  const landing = (tab.$folder as { landing?: string } | undefined)?.landing;
  return landing ? { ...tab, url: landing } : tab;
});
