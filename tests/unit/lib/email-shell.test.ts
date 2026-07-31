import { beforeEach, describe, expect, it } from 'vitest';
import { shell } from '@/lib/email-core';

/**
 * Gabarit HTML commun à tous les emails transactionnels.
 *
 * Le logo est référencé par URL absolue plutôt qu'attaché en ligne :
 * les deux transports (API ZeptoMail et SMTP) l'acceptent tel quel, et
 * le fichier reste unique, servi par le site.
 */

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe('shell', () => {
  it('affiche le logo en URL absolue', () => {
    const html = shell('Titre', '<p>Corps</p>');

    expect(html).toContain('src="https://openlabconsulting.com/OPENLAB.png"');
    expect(html).toContain('alt="OpenLab Consulting"');
  });

  it('suit l’URL du site configurée', () => {
    Object.assign(process.env, {
      NEXT_PUBLIC_SITE_URL: 'https://preprod.openlabconsulting.com',
    });

    expect(shell('T', '')).toContain(
      'src="https://preprod.openlabconsulting.com/OPENLAB.png"',
    );
  });

  it('ne double jamais la barre oblique', () => {
    Object.assign(process.env, {
      NEXT_PUBLIC_SITE_URL: 'https://openlabconsulting.com/',
    });

    expect(shell('T', '')).not.toContain('.com//OPENLAB.png');
  });

  it('conserve le titre échappé et le corps fourni', () => {
    const html = shell('Rapport <script>', '<p>Corps unique</p>');

    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<p>Corps unique</p>');
  });
});
