import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WhitepaperDownloadGate } from '@/components/forms/WhitepaperDownloadGate';

describe('WhitepaperDownloadGate', () => {
  it('affiche le compte à rebours pour une date d’ouverture future', () => {
    const future = new Date(Date.now() + 3 * 86400_000).toISOString();
    render(
      <WhitepaperDownloadGate
        slug="donnez-la-parole-a-vos-donnees"
        releaseAt={future}
      />,
    );
    expect(screen.getByTestId('download-countdown')).toBeInTheDocument();
    expect(screen.getByText(/ouvre lundi/i)).toBeInTheDocument();
    // Le formulaire de capture n'est pas encore affiché.
    expect(screen.queryByRole('button', { name: /recevoir/i })).toBeNull();
  });

  it('sans date d’ouverture → pas de compteur (téléchargement libre)', () => {
    render(
      <WhitepaperDownloadGate slug="ia-souveraine-ci-2026" releaseAt={null} />,
    );
    expect(screen.queryByTestId('download-countdown')).toBeNull();
  });
});
