import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Fraunces,
} from 'next/font/google';
import { GeistSans } from 'geist/font/sans';

/**
 * Polices self-hostées — voir CLAUDE.md §3.3.
 * Interdits : Inter, Roboto, Open Sans, Poppins, Montserrat (marqueurs d'AI slop).
 *
 * Chaque police expose une variable CSS injectée sur <html> et consommée
 * dans le @theme Tailwind (app/globals.css) pour exposer les utilitaires
 * font-display / font-body / font-mono / font-editorial.
 */

export const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-src',
  weight: ['400', '500', '600', '700', '800'],
});

export const fontBody = GeistSans;

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-src',
  weight: ['400', '500', '600'],
});

export const fontEditorial = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-editorial-src',
  axes: ['opsz'],
});

export const fontVariables = [
  fontDisplay.variable,
  fontBody.variable,
  fontMono.variable,
  fontEditorial.variable,
].join(' ');
