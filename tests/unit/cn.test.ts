import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/cn';

describe('cn()', () => {
  it('concatène plusieurs classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filtre les valeurs falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('merge les conflits Tailwind (twMerge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm font-medium', 'text-lg')).toBe('font-medium text-lg');
  });

  it('accepte les objets et tableaux conditionnels', () => {
    expect(cn('a', { b: true, c: false }, ['d', 'e'])).toBe('a b d e');
  });
});
