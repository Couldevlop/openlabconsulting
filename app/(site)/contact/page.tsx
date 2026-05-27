import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
import { ContactForm } from '@/components/forms/ContactForm';
import { SITE } from '@/lib/seo/site';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Joindre OpenLab Consulting : bureau Abidjan Cocody, email, téléphone CI + FR, formulaire de contact.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage(): React.ReactElement {
  return (
    <main id="main">
      <section
        aria-labelledby="contact-title"
        className="bg-[var(--color-ol-ivory)] py-24 sm:py-32"
      >
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
            {/* Pitch + coordonnées */}
            <div>
              <Eyebrow tone="orange">Contact</Eyebrow>
              <Heading id="contact-title" level={1} className="mt-4">
                Parlons de votre{' '}
                <span className="text-[var(--color-ol-orange-text)]">
                  projet IA
                </span>
                .
              </Heading>
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-ol-graphite)]/80">
                Pour un audit IA, une démo produit, une intervention en
                conférence ou un partenariat universitaire — utilisez le canal
                qui vous convient. Réponse sous 24 h ouvrées.
              </p>

              <ul className="mt-10 space-y-6">
                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <Mail width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Email général
                    </p>
                    <a
                      href={`mailto:${SITE.contact.email}`}
                      className="mt-1 inline-block text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange-text)]"
                    >
                      {SITE.contact.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <Mail width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Commercial
                    </p>
                    <a
                      href={`mailto:${SITE.contact.salesEmail}`}
                      className="mt-1 inline-block text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange-text)]"
                    >
                      {SITE.contact.salesEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <Phone width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Téléphone
                    </p>
                    <p className="mt-1">
                      <a
                        href={`tel:${SITE.contact.primaryPhone.replace(/\s/g, '')}`}
                        className="text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange-text)]"
                      >
                        {SITE.contact.primaryPhone}
                      </a>
                      <span className="text-[var(--color-ol-graphite)]/70">
                        {' '}
                        · Côte d’Ivoire
                      </span>
                    </p>
                    <p className="mt-1">
                      <a
                        href={`tel:${SITE.contact.secondaryPhone.replace(/\s/g, '')}`}
                        className="text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange-text)]"
                      >
                        {SITE.contact.secondaryPhone}
                      </a>
                      <span className="text-[var(--color-ol-graphite)]/70">
                        {' '}
                        · France
                      </span>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange-text)]"
                  >
                    <MapPin width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Bureau
                    </p>
                    <address className="mt-1 text-lg font-medium text-[var(--color-ol-night)] not-italic">
                      {SITE.address.streetAddress}
                      <br />
                      {SITE.address.addressLocality},{' '}
                      {SITE.address.addressRegion}
                      <br />
                      Côte d’Ivoire
                    </address>
                  </div>
                </li>
              </ul>
            </div>

            {/* Formulaire — AJAX, Zod, Turnstile, rate limit Redis (P10). */}
            <div>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
