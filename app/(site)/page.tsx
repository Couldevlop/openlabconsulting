import type { Metadata } from 'next';
import { AuditIaCtaServer } from '@/components/sections/AuditIaCtaServer';
import { CasesCarouselServer } from '@/components/sections/CasesCarouselServer';
import { ExpertisesServer } from '@/components/sections/ExpertisesServer';
import { Hero } from '@/components/sections/Hero';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { InsightsServer } from '@/components/sections/InsightsServer';
import { Laboratoire } from '@/components/sections/Laboratoire';
import { Livre } from '@/components/sections/Livre';
import { Manifesto } from '@/components/sections/Manifesto';
import { Reassurance } from '@/components/sections/Reassurance';
import { SolutionsServer } from '@/components/sections/SolutionsServer';
import {
  getHeroContent,
  getManifestoContent,
  getReassuranceContent,
} from '@/lib/cms/site-settings-server';

export const metadata: Metadata = {
  title: 'OpenLab Consulting — IA, R&D et conseil pour l’Afrique francophone',
  description:
    'Cabinet ivoirien d’IA appliquée, R&D produit (NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City) et publication de référence pour l’Afrique francophone.',
};

export default async function HomePage(): Promise<React.ReactElement> {
  const [heroContent, manifestoContent, reassuranceContent] = await Promise.all(
    [getHeroContent(), getManifestoContent(), getReassuranceContent()],
  );
  return (
    <main id="main">
      <Hero background={<HeroBackground />} content={heroContent} />
      <Reassurance content={reassuranceContent} />
      <ExpertisesServer />
      <Laboratoire />
      <CasesCarouselServer />
      <SolutionsServer />
      <Manifesto content={manifestoContent} />
      <Livre />
      <InsightsServer />
      <AuditIaCtaServer />
      {/* §6.11 Footer premium est déjà rendu globalement via app/layout.tsx (P1). */}
    </main>
  );
}
