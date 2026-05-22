import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { SITE } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité d’OpenLab Consulting — RGPD, loi ivoirienne 2013-450, droits utilisateurs, conservation, sous-traitants.',
  alternates: { canonical: '/politique-confidentialite' },
  robots: { index: true, follow: true },
};

export default function PolitiqueConfidentialitePage(): React.ReactElement {
  return (
    <main id="main">
      <section className="bg-[var(--color-ol-ivory)] py-24 sm:py-32">
        <Container width="narrow">
          <Eyebrow tone="orange">Confidentialité</Eyebrow>
          <Heading level={1} className="mt-4">
            Politique de confidentialité.
          </Heading>
          <p className="mt-4 text-sm text-[var(--color-ol-graphite)]/60">
            Dernière mise à jour : mai 2026
          </p>

          <div className="prose mt-12 space-y-8 text-[var(--color-ol-graphite)]/85">
            <section>
              <Heading level={2} visualLevel={3}>
                Cadre juridique
              </Heading>
              <p className="mt-3">OpenLab Consulting respecte :</p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  La <strong>loi ivoirienne n° 2013-450</strong> relative à la
                  protection des données à caractère personnel
                </li>
                <li>
                  Le <strong>Règlement (UE) 2016/679</strong> (RGPD) pour les
                  utilisateurs situés dans l’Union européenne
                </li>
                <li>
                  Le <strong>traité de Malabo</strong> de l’Union africaine sur
                  la cybersécurité et la protection des données
                </li>
              </ul>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Données collectées
              </Heading>
              <p className="mt-3">
                Nous collectons uniquement les données strictement nécessaires
                aux finalités annoncées :
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Formulaire de contact</strong> : nom, email
                  professionnel, organisation, sujet, message
                </li>
                <li>
                  <strong>Audit IA gratuit</strong> : email professionnel +
                  secteur d’activité
                </li>
                <li>
                  <strong>Téléchargement livre blanc</strong> : email
                  professionnel
                </li>
                <li>
                  <strong>Newsletter (à venir)</strong> : email professionnel
                  uniquement
                </li>
                <li>
                  <strong>Statistiques anonymes</strong> via Plausible Analytics
                  (self-hosted, aucun cookie)
                </li>
              </ul>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Conservation
              </Heading>
              <p className="mt-3">
                Les données de prospection commerciale sont conservées 3 ans à
                compter du dernier contact. Les données clients sont conservées
                pendant la durée du contrat puis 5 ans pour les obligations
                comptables. Aucune donnée n’est conservée au-delà de ces durées.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Sous-traitants
              </Heading>
              <p className="mt-3">
                Nous utilisons les sous-traitants suivants, tous établis en
                Union européenne ou conformes à un mécanisme d’adéquation :
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Hetzner Online GmbH</strong> (Allemagne) — hébergement
                  infrastructure
                </li>
                <li>
                  <strong>Resend / Brevo</strong> — envoi email transactionnel
                </li>
                <li>
                  <strong>Anthropic</strong> — service Claude API pour
                  l’assistant IA (anonymisation amont des prompts sensibles)
                </li>
                <li>
                  <strong>Stripe</strong> — paiement livres / formations
                  (PCI-DSS niveau 1)
                </li>
              </ul>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Vos droits
              </Heading>
              <p className="mt-3">
                Conformément au RGPD et à la loi ivoirienne 2013-450, vous
                disposez des droits suivants :
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Accès</strong> : obtenir une copie de vos données
                </li>
                <li>
                  <strong>Rectification</strong> : corriger des informations
                  inexactes
                </li>
                <li>
                  <strong>Effacement</strong> : demander la suppression (droit à
                  l’oubli)
                </li>
                <li>
                  <strong>Portabilité</strong> : recevoir vos données dans un
                  format réutilisable
                </li>
                <li>
                  <strong>Opposition</strong> : refuser la prospection
                  commerciale
                </li>
                <li>
                  <strong>Limitation</strong> : geler temporairement le
                  traitement
                </li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, écrivez à{' '}
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="font-medium text-[var(--color-ol-orange)] hover:underline"
                >
                  {SITE.contact.email}
                </a>
                . Réponse sous 30 jours.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Cookies
              </Heading>
              <p className="mt-3">
                Le site n’utilise <strong>aucun cookie de traçage</strong>.
                L’outil de statistiques (Plausible Analytics) est self-hosted
                par OpenLab et ne pose pas de cookie, ne collecte aucune donnée
                personnelle, et ne nécessite pas de bandeau de consentement.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Contact DPO
              </Heading>
              <p className="mt-3">
                La directrice de la publication, Debora Ahouma, exerce la
                fonction de DPO. Vous pouvez la contacter à{' '}
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="font-medium text-[var(--color-ol-orange)] hover:underline"
                >
                  {SITE.contact.email}
                </a>
                . En cas de litige non résolu, vous pouvez saisir l’
                <strong>ARTCI</strong> (Côte d’Ivoire) ou la{' '}
                <strong>CNIL</strong> (France).
              </p>
            </section>

            <section>
              <p className="text-sm text-[var(--color-ol-graphite)]/65">
                Pour les mentions légales complètes, voir{' '}
                <Link
                  href="/mentions-legales"
                  className="font-medium text-[var(--color-ol-orange)] hover:underline"
                >
                  /mentions-legales
                </Link>
                .
              </p>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}
