import type { Metadata } from 'next';
import { CasClient } from '@/components/sections/CasClient';
import { Expertises } from '@/components/sections/Expertises';
import { Hero } from '@/components/sections/Hero';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { Laboratoire } from '@/components/sections/Laboratoire';
import { Reassurance } from '@/components/sections/Reassurance';

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
      <CasClient />
      {/* §6 sections 6-10 arrivent dans les features feat/p2-* successives. */}
    </main>
  );
}
