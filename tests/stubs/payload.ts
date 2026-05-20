// Stub vitest pour `payload`. Évite de charger le vrai package
// (Postgres adapter, sharp, IO Node) pendant la suite de tests.
// `getPayload` throw immédiatement → le helper attrape et utilise
// FALLBACK_CASE_STUDIES.
export async function getPayload(): Promise<never> {
  throw new Error('payload stub: pas de Payload en tests unitaires');
}
