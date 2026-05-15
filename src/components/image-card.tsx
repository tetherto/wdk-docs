import Link from 'next/link';
import type { HTMLAttributes, ReactNode } from 'react';

interface ImageCardProps {
  title: string;
  image: string;
  imageLight?: string;
  imageDark?: string;
  href?: string;
  children?: ReactNode;
}

export function ImageCard({ title, image, imageLight, imageDark, href, children }: ImageCardProps) {
  const hasVariants = imageLight && imageDark;

  const imgCls = 'w-full h-full object-cover';

  const img = hasVariants ? (
    <>
      <img src={imageLight} alt="" className={`${imgCls} dark:hidden`} />
      <img src={imageDark} alt="" className={`hidden ${imgCls} dark:block`} />
    </>
  ) : (
    <img src={image} alt="" className={imgCls} />
  );

  const content = (
    <>
      <div className="aspect-[4/3] overflow-hidden bg-fd-muted/60">
        {img}
      </div>
      <div className="p-4">
        <div className="font-semibold text-fd-foreground">{title}</div>
        {children && (
          <div className="mt-1 text-sm text-fd-muted-foreground">{children}</div>
        )}
      </div>
    </>
  );

  const cls =
    'not-prose overflow-hidden rounded-lg border border-fd-border bg-fd-card transition-colors hover:bg-fd-accent/50';

  if (href) {
    return <Link href={href} className={cls}>{content}</Link>;
  }
  return <div className={cls}>{content}</div>;
}

interface ImageCardsProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3;
}

export function ImageCards({ columns = 3, children, className, ...props }: ImageCardsProps) {
  const gridCols = columns === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`not-prose grid gap-4 ${gridCols} ${className ?? ''}`} {...props}>
      {children}
    </div>
  );
}
