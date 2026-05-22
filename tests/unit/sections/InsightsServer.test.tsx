import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InsightsServer } from '@/components/sections/InsightsServer';

/**
 * Idem CasesCarouselServer : interroge Payload + délègue à Insights
 * client. Stub Payload → fallback hard-codé activé.
 */
describe('InsightsServer (server component)', () => {
  it('rend Insights avec le data-testid', async () => {
    const element = await InsightsServer();
    render(element);
    expect(screen.getByTestId('insights')).toBeInTheDocument();
  });
});
