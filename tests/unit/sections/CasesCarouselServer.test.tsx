import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CasesCarouselServer } from '@/components/sections/CasesCarouselServer';

/**
 * Test du Server Component qui interroge Payload puis délègue au
 * CasesCarousel client. En tests, Payload est stub → fallback
 * activé → carrousel rendu avec FALLBACK_CASE_STUDIES.
 */
describe('CasesCarouselServer (server component)', () => {
  it('rend le carrousel avec le data-testid', async () => {
    const element = await CasesCarouselServer();
    render(element);
    expect(screen.getByTestId('cases-carousel')).toBeInTheDocument();
  });
});
