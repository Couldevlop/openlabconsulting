'use client';

import type { ReactElement } from 'react';
import { createClientFeature } from '@payloadcms/richtext-lexical/client';
import {
  $getSelection,
  $isRangeSelection,
} from '@payloadcms/richtext-lexical/lexical';

/**
 * Feature Lexical custom : sélecteur d'emoji dans la barre d'outils de
 * l'éditeur richText de l'admin (demande utilisateur — enrichir la saisie).
 *
 * Ajoute un groupe « dropdown » (déclencheur 😊) listant des emojis usuels ;
 * la sélection insère le caractère au curseur. Les emojis sont du texte
 * Unicode standard → rendus tels quels côté public (aucun nœud custom, donc
 * aucun impact sur le rendu `RichText` ni sur les migrations).
 */

interface EmojiDef {
  char: string;
  label: string;
}

// Palette d'emojis pro/édito courants (extensible sans risque).
const EMOJIS: readonly EmojiDef[] = [
  { char: '😀', label: 'Sourire' },
  { char: '🙂', label: 'Content' },
  { char: '🎉', label: 'Fête' },
  { char: '🚀', label: 'Fusée' },
  { char: '✅', label: 'Validé' },
  { char: '❌', label: 'Refusé' },
  { char: '⚠️', label: 'Attention' },
  { char: '💡', label: 'Idée' },
  { char: '🔒', label: 'Sécurité' },
  { char: '📈', label: 'Croissance' },
  { char: '📊', label: 'Données' },
  { char: '🤖', label: 'IA' },
  { char: '🧠', label: 'Cerveau' },
  { char: '🌍', label: 'Afrique' },
  { char: '🇨🇮', label: "Côte d'Ivoire" },
  { char: '⭐', label: 'Étoile' },
  { char: '🔥', label: 'Tendance' },
  { char: '👏', label: 'Bravo' },
  { char: '👉', label: 'Pointeur' },
  { char: '💬', label: 'Discussion' },
  { char: '📌', label: 'Épingle' },
  { char: '🛡️', label: 'Bouclier' },
  { char: '⚡', label: 'Rapide' },
  { char: '💰', label: 'Coût' },
];

function EmojiTrigger(): ReactElement {
  return (
    <span aria-hidden style={{ fontSize: '1rem', lineHeight: 1 }}>
      😊
    </span>
  );
}

const emojiGroup = {
  key: 'emoji',
  type: 'dropdown' as const,
  order: 60,
  ChildComponent: EmojiTrigger,
  items: EMOJIS.map((emoji) => ({
    key: `emoji-${emoji.char}`,
    label: `${emoji.char}  ${emoji.label}`,
    ChildComponent: function EmojiItem(): ReactElement {
      return (
        <span aria-hidden style={{ fontSize: '1.1rem', lineHeight: 1 }}>
          {emoji.char}
        </span>
      );
    },
    onSelect: ({
      editor,
    }: {
      editor: {
        update: (fn: () => void) => void;
      };
    }): void => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(emoji.char);
        }
      });
    },
  })),
};

export const EmojiFeatureClient = createClientFeature({
  toolbarFixed: { groups: [emojiGroup] },
  toolbarInline: { groups: [emojiGroup] },
});
