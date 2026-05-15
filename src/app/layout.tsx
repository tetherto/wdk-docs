import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { Provider } from "./provider";
import 'katex/dist/katex.css';
import { getDocsSeoConfig } from '@/lib/seo-config';

const inter = Inter({
  subsets: ['latin'],
});

const { metadataBase } = getDocsSeoConfig();
const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-M8RR2ZBL';

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'WDK by Tether',
    template: '%s | WDK',
  },
  description: 'Official documentation for the Wallet Development Kit (WDK) by Tether.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.className}>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
