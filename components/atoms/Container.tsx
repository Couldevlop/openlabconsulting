import type { HTMLAttributes, ReactElement } from 'react';
import { cn } from '@/lib/cn';

type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav';
}

const widthMap: Record<ContainerWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

export function Container({
  width = 'default',
  as: Tag = 'div',
  className,
  children,
  ...rest
}: ContainerProps): ReactElement {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-6 sm:px-8 lg:px-10',
        widthMap[width],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
