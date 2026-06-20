import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

const base = {
  enabled: true,
  message: 'Flash info OpenCacao',
  linkLabel: 'Découvrir',
  linkHref: '/insights/opencacao',
};

describe('AnnouncementBanner', () => {
  it('ne rend rien quand désactivé', () => {
    const { container } = render(
      <AnnouncementBanner content={{ ...base, enabled: false }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('ne rend rien sans message', () => {
    const { container } = render(
      <AnnouncementBanner content={{ ...base, message: '   ' }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('affiche le message + un lien interne', () => {
    render(<AnnouncementBanner content={base} />);
    expect(screen.getByTestId('announcement-banner').textContent).toContain(
      'Flash info OpenCacao',
    );
    const link = screen.getByRole('link', { name: /Découvrir/ });
    expect(link.getAttribute('href')).toBe('/insights/opencacao');
  });

  it('lien externe https → target _blank + rel noopener', () => {
    render(
      <AnnouncementBanner
        content={{
          ...base,
          linkHref: 'https://opencacao.openlabconsulting.com',
        }}
      />,
    );
    const link = screen.getByRole('link', { name: /Découvrir/ });
    expect(link.getAttribute('href')).toBe(
      'https://opencacao.openlabconsulting.com',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('assainit un lien dangereux (javascript:) → pas de lien, message conservé', () => {
    render(
      <AnnouncementBanner
        content={{ ...base, linkHref: 'javascript:alert(1)' }}
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByTestId('announcement-banner').textContent).toContain(
      'Flash info OpenCacao',
    );
  });

  it('sans href → message seul, aucun lien', () => {
    render(<AnnouncementBanner content={{ ...base, linkHref: '' }} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
