import type { Metadata } from 'next';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { SITE, alternatesFor } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: `Mentions légales du site ${SITE.url} édité par ${SITE.legalName}.`,
  alternates: alternatesFor('/mentions-legales'),
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage(): React.ReactElement {
  return (
    <main id="main">
      <section className="bg-[var(--color-ol-ivory)] py-24 sm:py-32">
        <Container width="narrow">
          <Eyebrow tone="orange">Mentions légales</Eyebrow>
          <Heading level={1} className="mt-4">
            Informations légales.
          </Heading>

          <div className="prose mt-12 space-y-8 text-[var(--color-ol-graphite)]/85">
            <section>
              <Heading level={2} visualLevel={3}>
                Éditeur du site
              </Heading>
              <p className="mt-3">
                <strong>Raison sociale :</strong> {SITE.legalName}
                <br />
                <strong>Forme juridique :</strong> SARL de droit ivoirien
                <br />
                <strong>RCCM :</strong> {SITE.rccm}
                <br />
                <strong>Siège social :</strong> {SITE.address.streetAddress},{' '}
                {SITE.address.addressLocality}, {SITE.address.addressRegion},{' '}
                {SITE.address.addressCountry}
                <br />
                <strong>Directrice de la publication :</strong> Debora Ahouma,
                CEO
                <br />
                <strong>Contact :</strong>{' '}
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="font-medium text-[var(--color-ol-orange-text)] hover:underline"
                >
                  {SITE.contact.email}
                </a>
                <br />
                <strong>Téléphone :</strong> {SITE.contact.primaryPhone}
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Hébergement
              </Heading>
              <p className="mt-3">
                Le site est hébergé sur un cluster Kubernetes (K3s) opéré par
                OpenLab Consulting sur l’infrastructure{' '}
                <strong>Hetzner Online GmbH</strong>, Industriestr. 25, 91710
                Gunzenhausen, Allemagne. Les données sont physiquement stockées
                dans l’Union européenne, conformément au RGPD.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Propriété intellectuelle
              </Heading>
              <p className="mt-3">
                L’ensemble des contenus présents sur ce site (textes, images,
                logos, marques, vidéos, code source affiché) est la propriété
                exclusive d’OpenLab Consulting ou de ses partenaires concédants.
                Toute reproduction, représentation ou diffusion sans
                autorisation écrite préalable est strictement interdite.
              </p>
              <p className="mt-3">
                Les noms de produits propriétaires <em>NexusRH</em>,{' '}
                <em>NexusERP</em>, <em>SYGESCOM</em>, <em>AgroSense</em>,{' '}
                <em>QualitOS</em>, <em>OpenLab Fraud Shield</em>,{' '}
                <em>OpenLab Smart City</em> et <em>SentinelBTP</em> sont des
                marques d’OpenLab Consulting.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Responsabilité
              </Heading>
              <p className="mt-3">
                OpenLab Consulting s’efforce d’assurer l’exactitude des
                informations publiées sur ce site, mais ne saurait être tenu
                pour responsable des éventuelles erreurs ou omissions. Les liens
                externes pointent vers des sites dont OpenLab Consulting n’a pas
                la maîtrise du contenu.
              </p>
            </section>

            <section>
              <Heading level={2} visualLevel={3}>
                Droit applicable
              </Heading>
              <p className="mt-3">
                Le présent site est soumis au droit ivoirien. Tout litige
                relatif à son utilisation relève de la compétence des tribunaux
                d’Abidjan, sans préjudice des dispositions impératives de
                protection des consommateurs applicables.
              </p>
            </section>
          </div>
        </Container>
      </section>
    </main>
  );
}
