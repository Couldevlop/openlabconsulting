import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuditIaCtaServer } from '@/components/sections/AuditIaCtaServer';

/**
 * Wrapper server async : Payload étant stubbé (throw) en tests, il
 * emprunte le fallback de `getAuditIaCtaContent` et délègue à AuditIaCta.
 */
describe('AuditIaCtaServer', () => {
  it('rend la section AuditIaCta avec le contenu fallback', async () => {
    render(await AuditIaCtaServer());
    expect(screen.getByTestId('audit-ia-cta')).toBeInTheDocument();
  });
});
