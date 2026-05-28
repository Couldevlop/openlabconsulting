import type { Metadata } from 'next';
import { AuditIaCtaServer } from '@/components/sections/AuditIaCtaServer';
import { CasesCarouselServer } from '@/components/sections/CasesCarouselServer';
import { Expertises } from '@/components/sections/Expertises';
import { Hero } from '@/components/sections/Hero';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { InsightsServer } from '@/components/sections/InsightsServer';
import { Laboratoire } from '@/components/sections/Laboratoire';
import { Livre } from '@/components/sections/Livre';
import { Manifesto } from '@/components/sections/Manifesto';
import { Methodologie } from '@/components/sections/Methodologie';
import { Reassurance } from '@/components/sections/Reassurance';
import { Solutions } from '@/components/sections/Solutions';
import {
  getHeroContent,
  getManifestoContent,
  getMethodologieContent,
} from '@/lib/cms/site-settings-server';

export const metadata: Metadata = {
  title: 'OpenLab Consulting — IA, R&D et conseil pour l’Afrique francophone',
  description:
    'Cabinet ivoirien d’IA appliquée, R&D produit (NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City) et publication de référence pour l’Afrique francophone.',
};

export default async function HomePage(): Promise<React.ReactElement> {
  const [heroContent, manifestoContent, methodologieContent] =
    await Promise.all([
      getHeroContent(),
      getManifestoContent(),
      getMethodologieContent(),
    ]);
  return (
    <main id="main">
      <Hero background={<HeroBackground />} content={heroContent} />
      <Reassurance />
      <Expertises />
      <Methodologie content={methodologieContent} />
      <Laboratoire />
      <CasesCarouselServer />
      <Solutions />
      <Manifesto content={manifestoContent} />
      <Livre />
      <InsightsServer />
      <AuditIaCtaServer />
      {/* §6.11 Footer premium est déjà rendu globalement via app/layout.tsx (P1). */}
    </main>
  );
}
