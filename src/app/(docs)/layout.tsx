import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { customTree, navTabs } from '@/lib/custom-tree';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { FaGithub, FaDiscord } from 'react-icons/fa6';
import { ContentFirstSidebar } from '@/components/content-first-sidebar';

export default function Layout({ children }: LayoutProps<'/'>) {

  const linkItems: LinkItemType[] = [
    { type: 'main', text: 'Changelog', url: '/overview/changelog' },
    { type: 'main', text: 'Support', url: '/overview/support' },
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
      sidebar={{ enabled: false }}
      tabs={navTabs}
      tabMode="top"
      tree={{
          name: 'docs',
          children: customTree
        }}
      links={linkItems}
      >
      {children}
      <ContentFirstSidebar />
    </DocsLayout>
  );
}
