import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Couverture des chemins Payload et MinIO de `store-server`.
 *
 * Ces fonctions sont la seule frontière du pipeline avec la base et le
 * stockage : leurs branches d'échec sont précisément celles qui, mal
 * gérées, font disparaître un rapport en silence.
 */

const find = vi.fn();
const create = vi.fn();
const update = vi.fn();
const findByID = vi.fn();
const queue = vi.fn();
const s3send = vi.fn();

const getPayload = vi.fn(async (_opts: { cron?: boolean }) => ({
  find,
  create,
  update,
  findByID,
  jobs: { queue },
}));
vi.mock('@payload-config', () => ({ default: {} }));
vi.mock('payload', () => ({ getPayload }));
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = s3send;
  },
  PutObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
  GetObjectCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}));

const store = await import('@/lib/audit-report/store-server');

beforeEach(() => {
  for (const m of [find, create, update, findByID, queue, s3send])
    m.mockReset();
});

describe('initialisation de Payload', () => {
  it('demande le démarrage du planificateur', async () => {
    // Sans `cron: true`, Payload n'appelle jamais `_initializeCrons` :
    // les tâches s'empilent en file sans être exécutées, en silence.
    // Constaté en production le 2026-07-31.
    find.mockResolvedValueOnce({ docs: [] });
    await store.listPendingReports();

    expect(getPayload).toHaveBeenCalledWith(
      expect.objectContaining({ cron: true }),
    );
  });
});

describe('dépôt et lecture du PDF', () => {
  it('dépose le PDF sous la clé dérivée de l’identifiant', async () => {
    s3send.mockResolvedValueOnce({});
    const key = await store.putReportPdf('42', Buffer.from('%PDF'));

    expect(key).toBe('audit-reports/42.pdf');
    expect(s3send).toHaveBeenCalledTimes(1);
  });

  it('refuse un identifiant qui tenterait de sortir du préfixe', async () => {
    await expect(
      store.putReportPdf('../secrets', Buffer.from('x')),
    ).rejects.toThrow(/invalide/);
    expect(s3send).not.toHaveBeenCalled();
  });

  it('relit le PDF déposé', async () => {
    s3send.mockResolvedValueOnce({
      Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) },
    });
    const pdf = await store.getReportPdf('audit-reports/42.pdf');

    expect(pdf?.length).toBe(3);
  });

  it('renvoie null si l’objet est absent du bucket', async () => {
    s3send.mockRejectedValueOnce(new Error('NoSuchKey'));
    expect(await store.getReportPdf('audit-reports/42.pdf')).toBeNull();
  });

  it('renvoie null si le corps de la réponse est vide', async () => {
    s3send.mockResolvedValueOnce({ Body: undefined });
    expect(await store.getReportPdf('audit-reports/42.pdf')).toBeNull();
  });
});

describe('createDraftReport : chemins d’échec', () => {
  it('renvoie null quand Payload est indisponible', async () => {
    find.mockRejectedValueOnce(new Error('base indisponible'));

    const out = await store.createDraftReport({
      leadId: 18,
      title: 'T',
      sections: {
        title: 'T',
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
        nextSteps: 'N',
      },
      generatedBy: 'squelette',
    });

    expect(out).toBeNull();
  });

  it('enregistre le statut d’échec quand la génération a échoué', async () => {
    find.mockResolvedValueOnce({ docs: [] });
    create.mockResolvedValueOnce({ id: 7 });

    await store.createDraftReport({
      leadId: 18,
      title: 'T',
      sections: {
        title: 'T',
        synthesis: 'S',
        situation: 'Si',
        recommendation: 'R',
        roadmap: [{ title: 'a', horizon: 'b', body: 'c' }],
        nextSteps: 'N',
      },
      generatedBy: 'squelette',
      generationError: 'modèle indisponible',
    });

    expect(create.mock.calls[0]?.[0].data).toMatchObject({
      status: 'echec-generation',
      generationError: 'modèle indisponible',
    });
  });
});

describe('queueReportGeneration', () => {
  it('met la génération en file avec les réponses', async () => {
    queue.mockResolvedValueOnce({});
    await store.queueReportGeneration({
      leadId: '18',
      organization: 'Banque X',
      jobTitle: 'DSI',
      answers: { maturity: 'pilote', sector: 'banque-assurance' },
    });

    expect(queue).toHaveBeenCalledWith(
      expect.objectContaining({ task: 'generateAuditReport' }),
    );
  });

  it('n’enfile rien sans identifiant de lead', async () => {
    await store.queueReportGeneration({ leadId: null, answers: {} });
    expect(queue).not.toHaveBeenCalled();
  });

  it('reste silencieux pour le visiteur si la file est indisponible', async () => {
    queue.mockRejectedValueOnce(new Error('file HS'));
    await expect(
      store.queueReportGeneration({ leadId: '18', answers: {} }),
    ).resolves.toBeUndefined();
  });

  it('remplace les champs absents par des chaînes vides', async () => {
    queue.mockResolvedValueOnce({});
    await store.queueReportGeneration({ leadId: '18', answers: {} });

    expect(queue.mock.calls[0]?.[0].input).toMatchObject({
      organization: '',
      jobTitle: '',
    });
  });
});

describe('findReportForDownload', () => {
  it('renvoie le rapport avec ses valeurs par défaut', async () => {
    findByID.mockResolvedValueOnce({ id: 42, status: 'envoye' });

    expect(await store.findReportForDownload('42')).toEqual({
      id: '42',
      status: 'envoye',
      pdfKey: null,
      downloadCount: 0,
    });
  });

  it('renvoie null sans bruit sur identifiant inconnu', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    findByID.mockRejectedValueOnce(
      new Error('The requested resource was not found.'),
    );

    expect(await store.findReportForDownload('999')).toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('journalise une panne réelle', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    findByID.mockRejectedValueOnce(new Error('connexion refusée'));

    expect(await store.findReportForDownload('42')).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('incrementDownloadCount', () => {
  it('incrémente à partir de la valeur lue', async () => {
    update.mockResolvedValueOnce({});
    await store.incrementDownloadCount('42', 4);

    expect(update.mock.calls[0]?.[0].data).toEqual({ downloadCount: 5 });
  });

  it('n’interrompt pas le téléchargement si l’écriture échoue', async () => {
    update.mockRejectedValueOnce(new Error('verrou'));
    await expect(
      store.incrementDownloadCount('42', 0),
    ).resolves.toBeUndefined();
  });
});

describe('listPendingReports et markReminded', () => {
  it('projette les rapports en attente avec le nom de l’organisation', async () => {
    find.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          createdAt: '2026-07-30T00:00:00.000Z',
          remindedAt: null,
          lead: { organization: 'Banque X' },
        },
        {
          id: 2,
          createdAt: '2026-07-30T01:00:00.000Z',
          lead: 18,
        },
      ],
    });

    const out = await store.listPendingReports();

    expect(out[0]).toMatchObject({ id: '1', organization: 'Banque X' });
    expect(out[1]).toMatchObject({
      id: '2',
      organization: 'organisation non précisée',
      remindedAt: null,
    });
  });

  it('renvoie une liste vide si la lecture échoue', async () => {
    find.mockRejectedValueOnce(new Error('base HS'));
    expect(await store.listPendingReports()).toEqual([]);
  });

  it('horodate la relance', async () => {
    update.mockResolvedValueOnce({});
    await store.markReminded('42');

    expect(update.mock.calls[0]?.[0].data.remindedAt).toEqual(
      expect.any(String),
    );
  });

  it('n’échoue pas si l’horodatage est impossible', async () => {
    update.mockRejectedValueOnce(new Error('verrou'));
    await expect(store.markReminded('42')).resolves.toBeUndefined();
  });
});

describe('markReportSent : cas limites', () => {
  it('ne tente pas d’avancer un lead absent', async () => {
    update.mockResolvedValueOnce({ id: 42 });

    expect(
      await store.markReportSent('42', { pdfKey: 'k', validatedBy: 1 }),
    ).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('reste vrai même si l’avancement du lead échoue', async () => {
    update
      .mockResolvedValueOnce({ id: 42, lead: { id: 18 } })
      .mockRejectedValueOnce(new Error('lead verrouillé'));

    expect(
      await store.markReportSent('42', { pdfKey: 'k', validatedBy: 1 }),
    ).toBe(true);
  });
});
