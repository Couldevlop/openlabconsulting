import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ICON_KEYS, ICON_MAP, DynamicIcon, isIconKey } from '@/lib/icon-map';

describe('lib/icon-map', () => {
  it('ICON_KEYS couvre les 7 clés attendues', () => {
    expect([...ICON_KEYS].sort()).toEqual(
      [
        'users',
        'badge-check',
        'building',
        'scan-search',
        'fuel',
        'sprout',
        'radar',
      ].sort(),
    );
  });

  it('chaque clé du registre pointe vers un composant', () => {
    for (const key of ICON_KEYS) {
      expect(ICON_MAP[key]).toBeDefined();
    }
  });

  it('isIconKey valide les clés connues et rejette les inconnues', () => {
    expect(isIconKey('users')).toBe(true);
    expect(isIconKey('inexistant')).toBe(false);
    expect(isIconKey(42)).toBe(false);
    expect(isIconKey(null)).toBe(false);
  });

  it('DynamicIcon rend un SVG pour une clé connue', () => {
    const { container } = render(<DynamicIcon name="users" aria-hidden />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('DynamicIcon rend null pour une clé inconnue', () => {
    const { container } = render(<DynamicIcon name="inexistant" />);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.firstChild).toBeNull();
  });
});
