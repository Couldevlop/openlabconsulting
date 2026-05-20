import type { Metadata } from 'next';
import { AuditIaCta } from '@/components/sections/AuditIaCta';
import { CasesCarousel } from '@/components/sections/CasesCarousel';
import { Expertises } from '@/components/sections/Expertises';
import { Hero } from '@/components/sections/Hero';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { Insights } from '@/components/sections/Insights';
import { Laboratoire } from '@/components/sections/Laboratoire';
import { Livre } from '@/components/sections/Livre';
import { Manifesto } from '@/components/sections/Manifesto';
import { Reassurance } from '@/components/sections/Reassurance';
import { Solutions } from '@/components/sections/Solutions';

export const metadata: Metadata = {
  title: 'OpenLab Consulting — IA, R&D et conseil pour l’Afrique francophone',
  description:
    'Cabinet ivoirien d’IA appliquée, R&D produit (NexusRH, NexusERP, SYGESCOM, AgroSense, QualitOS, Fraud Shield, Smart City) et publication de référence pour l’Afrique francophone.',
};

export default function HomePage(): React.ReactElement {
  return (
    <main id="main">
      <Hero background={<HeroBackground />} />
      <Reassurance />
      <Expertises />
      <Laboratoire />
      <CasesCarousel />
      <Solutions />
      <Manifesto />
      <Livre />
      <Insights />
      <AuditIaCta />
      {/* §6.11 Footer premium est déjà rendu globalement via app/layout.tsx (P1). */}
    </main>
  );
}
