import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { customTree } from '@/lib/custom-tree';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { FaGithub, FaDiscord } from 'react-icons/fa6';

export default function Layout({ children }: LayoutProps<'/'>) {

  const linkItems: LinkItemType[] = [
    {
      type: 'icon',
      url: 'https://github.com/tetherto/wdk',
      icon: <FaGithub />,
      label: 'GitHub',
      text: 'GitHub',
      external: true,
    },
    {
      type: 'icon',
      url: 'https://discord.gg/arYXDhHB2w',
      icon: <FaDiscord />,
      label: 'Discord',
      text: 'Discord',
      external: true,
    },
  ];

  return (
    <DocsLayout
      {...baseOptions()}
      tree={{
          name: 'docs',
          children: customTree
        }}
      links={linkItems}
      >
      {children}
    </DocsLayout>
  );
}
