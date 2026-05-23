#!/usr/bin/env node
/**
 * Génère un PDF stub minimal valide pour le livre blanc « IA souveraine
 * en Côte d'Ivoire 2026 ». Sert de placeholder téléchargeable depuis
 * `/livres-blancs/ia-souveraine-ci-2026/merci` en attendant le PDF
 * éditorial final.
 *
 * Construit à la main (PDF 1.4, 1 page A4, fonte Helvetica standard)
 * pour rester sans dépendance npm. ~1 ko, valide pour tous les readers.
 *
 * Usage : `node scripts/generate-whitepaper-stub.mjs`
 * Output : `public/whitepapers/ia-souveraine-ci-2026.pdf`
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const lines = [
  ["L'IA souveraine en Cote d'Ivoire", 28, 760],
  ['Feuille de route pratique pour les dirigeants en 2026', 14, 730],
  ['Document en cours de redaction.', 12, 690],
  ['Vous serez notifie par email des sa sortie officielle.', 11, 660],
  ['En attendant, contactez infos@openlabconsulting.com', 11, 640],
  ['ou prenez RDV pour un audit IA gratuit sur', 11, 620],
  ['https://www.openlabconsulting.com/audit-ia', 11, 600],
  ['OpenLab Consulting SARL - Abidjan, Cote d Ivoire', 9, 80],
];

function escapePdfString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

let content = '';
for (const [text, size, y] of lines) {
  if (!text) continue;
  content += `BT /F1 ${size} Tf 70 ${y} Td (${escapePdfString(text)}) Tj ET\n`;
}

const streamBytes = Buffer.byteLength(content, 'binary');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${streamBytes} >>\nstream\n${content}endstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
];

let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
const xref = [0];
objects.forEach((body, i) => {
  xref.push(Buffer.byteLength(pdf, 'binary'));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xrefStart = Buffer.byteLength(pdf, 'binary');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i++) {
  pdf += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
pdf += `startxref\n${xrefStart}\n%%EOF\n`;

const outPath = 'public/whitepapers/ia-souveraine-ci-2026.pdf';
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, pdf, 'binary');
// eslint-disable-next-line no-console -- script CLI, sortie stdout attendue
console.log(`Wrote ${Buffer.byteLength(pdf, 'binary')} bytes to ${outPath}`);
