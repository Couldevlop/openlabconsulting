// Stub vitest pour l'alias `@payload-config` (résolu en prod par
// Next/Payload via importmap). En tests on n'instancie pas Payload —
// on throw directement pour que le helper `getPublishedCaseStudies`
// emprunte sa branche fallback (FALLBACK_CASE_STUDIES).
throw new Error('payload-config stub: pas de Payload en tests unitaires');
