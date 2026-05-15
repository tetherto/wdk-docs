import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: '/',
      title: (
        <span className="inline-flex items-center text-fd-foreground">
          <span className="inline-flex h-[40px] w-[180px] shrink-0 items-center">
            <img
              src="/assets/branding/wdk-logo-light.png"
              alt="WDK logo"
              width={180}
              height={40}
              className="h-[40px] w-[180px] object-contain object-left dark:hidden"
            />
            <img
              src="/assets/branding/wdk-logo-dark.png"
              alt="WDK logo"
              width={180}
              height={40}
              className="hidden h-[40px] w-[180px] object-contain object-left dark:block"
            />
          </span>
          <span className="sr-only">WDK documentation</span>
        </span>
      ),
    },
  };
}
