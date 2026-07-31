import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Démarrage du planificateur de tâches au boot du serveur.
 *
 * Sans ce hook, le planificateur n'était initialisé qu'à la première
 * requête touchant Payload : après un redémarrage de pod, un rapport
 * déjà en file attendait indéfiniment. Constaté en production.
 */

const getPayload = vi.fn(async (_opts: { cron?: boolean }) => ({}));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({ getPayload }));

const originalRuntime = process.env.NEXT_RUNTIME;

beforeEach(() => {
  getPayload.mockClear();
  Object.assign(process.env, { NEXT_RUNTIME: 'nodejs' });
  delete process.env.NEXT_PHASE;
  delete process.env.PAYLOAD_DISABLE_JOBS;
});

afterEach(() => {
  if (originalRuntime === undefined) delete process.env.NEXT_RUNTIME;
  else process.env.NEXT_RUNTIME = originalRuntime;
});

describe('register', () => {
  it('démarre le planificateur dans le runtime Node', async () => {
    const { register } = await import('@/instrumentation');
    await register();

    expect(getPayload).toHaveBeenCalledWith(
      expect.objectContaining({ cron: true }),
    );
  });

  it('ne fait rien dans le runtime Edge', async () => {
    Object.assign(process.env, { NEXT_RUNTIME: 'edge' });
    const { register } = await import('@/instrumentation');
    await register();

    expect(getPayload).not.toHaveBeenCalled();
  });

  it('ne fait rien pendant la construction', async () => {
    Object.assign(process.env, { NEXT_PHASE: 'phase-production-build' });
    const { register } = await import('@/instrumentation');
    await register();

    expect(getPayload).not.toHaveBeenCalled();
  });

  it('respecte la coupure explicite de la file', async () => {
    Object.assign(process.env, { PAYLOAD_DISABLE_JOBS: 'true' });
    const { register } = await import('@/instrumentation');
    await register();

    expect(getPayload).not.toHaveBeenCalled();
  });

  it('n’empêche pas le serveur de démarrer si Payload échoue', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getPayload.mockRejectedValueOnce(new Error('base indisponible'));

    const { register } = await import('@/instrumentation');
    await expect(register()).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
