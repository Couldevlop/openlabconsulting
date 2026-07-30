'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactElement } from 'react';

/**
 * Compteur des rapports en attente, affiché en permanence dans la
 * navigation du back-office.
 *
 * Deuxième des trois signaux d'alerte, et le seul qui ne dépende d'aucun
 * transport externe : il reste visible même quand l'email est en panne.
 * C'est exactement le scénario qui a rendu le dispositif muet pendant
 * trois semaines en juillet 2026.
 */
export default function PendingReportsBadge(): ReactElement | null {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const query =
      'limit=0&depth=0&where[status][in]=brouillon-ia,en-revue,echec-generation';

    fetch(`/api/audit-reports?${query}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { totalDocs?: number } | null) => setCount(d?.totalDocs ?? 0))
      .catch(() => setCount(0));

    return () => controller.abort();
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/admin/collections/audit-reports?where[status][in]=brouillon-ia,en-revue,echec-generation"
      style={{
        display: 'block',
        margin: '0 0 12px',
        padding: '8px 12px',
        borderRadius: 6,
        background: '#d94800',
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {count === 1 ? '1 rapport à valider' : `${count} rapports à valider`}
    </Link>
  );
}
