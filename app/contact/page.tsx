import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Heading } from '@/components/atoms/Heading';
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
                <span className="text-[var(--color-ol-orange)]">projet IA</span>
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
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
                  >
                    <Mail width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Email général
                    </p>
                    <a
                      href={`mailto:${SITE.contact.email}`}
                      className="mt-1 inline-block text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange)]"
                    >
                      {SITE.contact.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
                  >
                    <Mail width={20} height={20} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs tracking-widest text-[var(--color-ol-graphite)]/60 uppercase">
                      Commercial
                    </p>
                    <a
                      href={`mailto:${SITE.contact.salesEmail}`}
                      className="mt-1 inline-block text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange)]"
                    >
                      {SITE.contact.salesEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
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
                        className="text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange)]"
                      >
                        {SITE.contact.primaryPhone}
                      </a>
                      <span className="text-[var(--color-ol-graphite)]/55">
                        {' '}
                        · Côte d’Ivoire
                      </span>
                    </p>
                    <p className="mt-1">
                      <a
                        href={`tel:${SITE.contact.secondaryPhone.replace(/\s/g, '')}`}
                        className="text-lg font-medium text-[var(--color-ol-night)] hover:text-[var(--color-ol-orange)]"
                      >
                        {SITE.contact.secondaryPhone}
                      </a>
                      <span className="text-[var(--color-ol-graphite)]/55">
                        {' '}
                        · France
                      </span>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-ol-orange)]/10 text-[var(--color-ol-orange)]"
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

            {/* Formulaire */}
            <div>
              <form
                method="post"
                action="/api/contact"
                aria-label="Formulaire de contact"
                className="rounded-lg border border-[var(--color-ol-mist)] bg-white p-8 shadow-sm"
              >
                <Heading level={2} visualLevel={3}>
                  Écrire à l’équipe.
                </Heading>
                <p className="mt-2 text-sm text-[var(--color-ol-graphite)]/65">
                  La pipeline d’envoi (validation Zod + Resend + rate limit
                  Redis) est branchée en P8 / P10. Pour l’instant, écris-nous
                  directement à{' '}
                  <a
                    href={`mailto:${SITE.contact.email}`}
                    className="font-medium text-[var(--color-ol-orange)] underline-offset-2 hover:underline"
                  >
                    {SITE.contact.email}
                  </a>
                  .
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Nom complet
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Email pro
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Organisation
                    </span>
                    <input
                      name="organization"
                      type="text"
                      autoComplete="organization"
                      className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Sujet
                    </span>
                    <select
                      name="subject"
                      defaultValue=""
                      required
                      className="min-h-11 rounded-md border border-[var(--color-ol-mist)] bg-white px-4 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>
                        Choisir un sujet…
                      </option>
                      <option value="audit-ia">Audit IA gratuit</option>
                      <option value="demo-produit">Démo produit</option>
                      <option value="conference">
                        Conférence / intervention
                      </option>
                      <option value="partenariat">
                        Partenariat universitaire
                      </option>
                      <option value="presse">Presse</option>
                      <option value="autre">Autre</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                    <span className="font-medium text-[var(--color-ol-night)]">
                      Message
                    </span>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="resize-y rounded-md border border-[var(--color-ol-mist)] bg-white px-4 py-3 text-base text-[var(--color-ol-night)] focus:border-[var(--color-ol-orange)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ol-orange)] focus-visible:ring-offset-2"
                    />
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[var(--color-ol-graphite)]/55">
                    Vos données restent en interne chez OpenLab. RGPD UE + loi
                    ivoirienne 2013-450.
                  </p>
                  <Button type="submit" variant="primary" size="md">
                    Envoyer le message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
