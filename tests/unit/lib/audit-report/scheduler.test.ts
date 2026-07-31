import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Amorce du planificateur de tâches.
 *
 * Payload n'initialise son planificateur qu'avec `cron: true`, et son
 * instanciation est paresseuse : sans amorce, un rapport mis en file
 * avant tout trafic attend indéfiniment. Constaté en production.
 */

const getPayload = vi.fn(async (_opts: { cron?: boolean }) => ({}));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({ getPayload }));

const { ensureJobSchedulerStarted, __resetSchedulerForTests } =
  await import('@/lib/audit-report/scheduler-server');

beforeEach(() => {
  getPayload.mockClear();
  getPayload.mockResolvedValue({});
  delete process.env.PAYLOAD_DISABLE_JOBS;
  __resetSchedulerForTests();
});

describe('ensureJobSchedulerStarted', () => {
  it('démarre le planificateur avec cron activé', async () => {
    await ensureJobSchedulerStarted();

    expect(getPayload).toHaveBeenCalledWith(
      expect.objectContaining({ cron: true }),
    );
  });

  it('ne démarre qu’une fois, quelle que soit la fréquence des sondes', async () => {
    await ensureJobSchedulerStarted();
    await ensureJobSchedulerStarted();
    await ensureJobSchedulerStarted();

    expect(getPayload).toHaveBeenCalledTimes(1);
  });

  it('respecte la coupure explicite de la file', async () => {
    Object.assign(process.env, { PAYLOAD_DISABLE_JOBS: 'true' });
    await ensureJobSchedulerStarted();

    expect(getPayload).not.toHaveBeenCalled();
  });

  it('réessaie au passage suivant si la base est indisponible', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getPayload.mockRejectedValueOnce(new Error('base indisponible'));

    await ensureJobSchedulerStarted();
    expect(spy).toHaveBeenCalled();

    // L'échec ne doit pas condamner le planificateur pour la durée de vie
    // du pod : la sonde suivante retente.
    await ensureJobSchedulerStarted();
    expect(getPayload).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('ne propage jamais l’échec à l’appelant', async () => {
    getPayload.mockRejectedValueOnce(new Error('boom'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(ensureJobSchedulerStarted()).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
