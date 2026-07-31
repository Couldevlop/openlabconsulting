import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { AuditReportSections } from './types';

/**
 * Rendu PDF du rapport d'audit.
 *
 * `@react-pdf/renderer` plutôt qu'un rendu par navigateur sans tête :
 * aucun Chromium à embarquer dans une image distroless.
 *
 * Mise en page sobre, polices intégrées au moteur pour ne pas dépendre
 * de fichiers externes. L'orange reste un accent (filets, intitulés),
 * jamais une grande surface pleine.
 */

const NIGHT = '#1a1d24';
const GRAPHITE = '#5b6170';
const ORANGE = '#d94800';
const MIST = '#e3e5ea';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 11,
    color: NIGHT,
    lineHeight: 1.55,
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: ORANGE,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: { fontSize: 22, marginBottom: 6 },
  meta: { fontSize: 9, color: GRAPHITE, marginBottom: 28 },
  h2: { fontSize: 13, marginTop: 22, marginBottom: 8, color: NIGHT },
  rule: {
    borderTopWidth: 2,
    borderTopColor: ORANGE,
    width: 44,
    marginBottom: 14,
  },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  step: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: MIST,
  },
  stepHorizon: {
    fontSize: 8,
    color: ORANGE,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  stepTitle: { fontSize: 11, marginBottom: 2 },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 8,
    color: GRAPHITE,
    borderTopWidth: 1,
    borderTopColor: MIST,
    paddingTop: 8,
  },
});

function paragraphs(text: string): ReactElement[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => (
      <Text key={i} style={styles.paragraph}>
        {line}
      </Text>
    ));
}

export async function renderReportPdf(args: {
  sections: AuditReportSections;
  organization: string;
  generatedOn: Date;
}): Promise<Buffer> {
  const { sections, organization, generatedOn } = args;
  const date = generatedOn.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const doc = (
    <Document title={sections.title} author="OpenLab Consulting">
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>OpenLab Consulting · Audit IA</Text>
        <Text style={styles.title}>{sections.title}</Text>
        <Text style={styles.meta}>
          {organization} · {date}
        </Text>

        <Text style={styles.h2}>Synthèse</Text>
        <View style={styles.rule} />
        {paragraphs(sections.synthesis)}

        <Text style={styles.h2}>Votre situation</Text>
        <View style={styles.rule} />
        {paragraphs(sections.situation)}

        <Text style={styles.h2}>Ce que nous recommandons</Text>
        <View style={styles.rule} />
        {paragraphs(sections.recommendation)}

        <Text style={styles.h2}>Feuille de route</Text>
        <View style={styles.rule} />
        {sections.roadmap.map((step, i) => (
          <View key={i} style={styles.step} wrap={false}>
            <Text style={styles.stepHorizon}>{step.horizon}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text>{step.body}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Prochaines étapes</Text>
        <View style={styles.rule} />
        {paragraphs(sections.nextSteps)}

        <Text style={styles.footer} fixed>
          OpenLab Consulting SARL · RCCM CI-ABJ-03-2022-B13-03239 · Abidjan,
          Cocody, Riviera Faya Lauriers 8 · infos@openlabconsulting.com
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
