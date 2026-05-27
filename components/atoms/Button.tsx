import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactElement,
} from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: 'button';
    href?: never;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: 'a';
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantMap: Record<ButtonVariant, string> = {
  // Texte blanc sur orange vif (#ff5a00) = 3.12:1 → échec WCAG AA. On pose le
  // fond sur orange foncé (#cc4800 → blanc = 4.66:1) et on assombrit au survol.
  // L'orange vif reste réservé aux accents non-textuels (§3.2, §4.7).
  primary:
    'bg-[var(--color-ol-orange-dark)] text-white hover:bg-[var(--color-ol-orange-ink)] active:bg-[var(--color-ol-orange-ink)]',
  secondary:
    'bg-[var(--color-ol-night)] text-white hover:bg-[var(--color-ol-navy)] active:bg-[var(--color-ol-navy)]',
  ghost:
    'bg-transparent text-[var(--color-ol-night)] hover:bg-[var(--color-ol-mist)] active:bg-[var(--color-ol-mist)]',
};

const sizeMap: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-12 px-6 text-base sm:text-lg',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-200 ease-[var(--ease-ol)] disabled:cursor-not-allowed disabled:opacity-50';

export function Button(props: ButtonProps): ReactElement {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = cn(base, variantMap[variant], sizeMap[size], className);

  if (props.as === 'a') {
    const {
      as: _as,
      variant: _v,
      size: _s,
      className: _c,
      children: _ch,
      ...anchorProps
    } = props;
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const {
    as: _as,
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    ...buttonProps
  } = props;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
