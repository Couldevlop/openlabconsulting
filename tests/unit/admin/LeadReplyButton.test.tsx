import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// État de formulaire injectable, lu par le mock de `useFormFields`.
const h = vi.hoisted(() => ({
  fields: {} as Record<string, { value?: unknown }>,
}));

vi.mock('@payloadcms/ui', () => ({
  useFormFields: (selector: (args: [typeof h.fields, () => void]) => unknown) =>
    selector([h.fields, () => undefined]),
}));

import LeadReplyButton from '@/components/admin/LeadReplyButton';

describe('LeadReplyButton', () => {
  beforeEach(() => {
    h.fields = {};
  });

  it("ne rend rien tant qu'aucun email n'est présent", () => {
    const { container } = render(<LeadReplyButton />);
    expect(container.firstChild).toBeNull();
  });

  it('rend un lien mailto pré-rempli (destinataire + Re:objet + amorce nommée)', () => {
    h.fields = {
      email: { value: 'client@example.com' },
      name: { value: 'Awa' },
      subject: { value: 'Demande de devis' },
    };
    render(<LeadReplyButton />);

    const link = screen.getByRole('link', { name: /répondre par email/i });
    const href = link.getAttribute('href') ?? '';
    expect(href).toMatch(/^mailto:client@example\.com\?/);

    const decoded = decodeURIComponent(href);
    expect(decoded).toContain('Re: Demande de devis');
    expect(decoded).toContain('Bonjour Awa,');
    expect(decoded).toContain('OpenLab Consulting');
  });

  it('retombe sur un objet et une amorce génériques sans nom ni objet', () => {
    h.fields = { email: { value: 'anon@example.com' } };
    render(<LeadReplyButton />);

    const href =
      screen
        .getByRole('link', { name: /répondre par email/i })
        .getAttribute('href') ?? '';
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain('Votre message — OpenLab Consulting');
    expect(decoded).toContain('Bonjour,');
  });

  it("encode l'objet pour éviter toute injection d'en-têtes (OWASP A03)", () => {
    h.fields = {
      email: { value: 'x@example.com' },
      subject: { value: 'a\nBcc: evil@x.com' },
    };
    render(<LeadReplyButton />);

    const href =
      screen
        .getByRole('link', { name: /répondre par email/i })
        .getAttribute('href') ?? '';
    // Le saut de ligne brut ne doit pas apparaître dans l'URL (il est encodé).
    expect(href).not.toContain('\n');
    expect(href).toContain('%0A');
  });
});
