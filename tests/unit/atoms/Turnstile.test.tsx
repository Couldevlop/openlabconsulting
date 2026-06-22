import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Turnstile } from '@/components/atoms/Turnstile';
import { TurnstileSiteKeyProvider } from '@/components/atoms/TurnstileSiteKeyProvider';

/**
 * Turnstile — dans jsdom, on teste les deux branches : sans sitekey
 * (placeholder dev) et avec sitekey (widget cible Cloudflare).
 * Le script externe n'est pas chargé dans jsdom (pas d'attachement
 * DOM réel à `document.head.appendChild` qui résout, mais c'est OK :
 * notre useEffect catch silencieux).
 */
describe('Turnstile atom', () => {
  const originalKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    } else {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalKey;
    }
  });

  describe('Sans sitekey (mode dev)', () => {
    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    });

    it('rend un placeholder « CAPTCHA désactivé »', () => {
      render(<Turnstile />);
      expect(
        screen.getByTestId('turnstile-dev-placeholder'),
      ).toBeInTheDocument();
      expect(screen.getByText(/CAPTCHA désactivé/i)).toBeInTheDocument();
    });

    it('accepte une className custom', () => {
      const { container } = render(<Turnstile className="custom-cls" />);
      expect(container.querySelector('.custom-cls')).not.toBeNull();
    });
  });

  describe('Avec sitekey', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key';
    });

    it('rend le widget container avec data-testid turnstile-widget', () => {
      render(<Turnstile action="contact" />);
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });

    it('accepte les props action / theme / appearance sans throw', () => {
      render(<Turnstile action="audit-ia" theme="dark" appearance="execute" />);
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });
  });

  describe('Avec provider de contexte (clé runtime)', () => {
    beforeEach(() => {
      // Le contexte doit primer sur la variable build, dans les deux sens.
      delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    });

    it('rend le widget depuis la clé du provider (sans NEXT_PUBLIC_*)', () => {
      render(
        <TurnstileSiteKeyProvider siteKey="0x4AAAAAADYMb5YX1caTT8cP">
          <Turnstile action="contact" />
        </TurnstileSiteKeyProvider>,
      );
      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
    });

    it('provider à null → placeholder même si NEXT_PUBLIC_* est défini', () => {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'build-key';
      render(
        <TurnstileSiteKeyProvider siteKey={null}>
          <Turnstile action="contact" />
        </TurnstileSiteKeyProvider>,
      );
      expect(
        screen.getByTestId('turnstile-dev-placeholder'),
      ).toBeInTheDocument();
    });
  });
});
