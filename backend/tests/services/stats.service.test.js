jest.mock('../../src/db/connection', () => ({ execute: jest.fn() }));

const pool = require('../../src/db/connection');
const service = require('../../src/services/stats.service');

beforeEach(() => jest.clearAllMocks());

describe('stats.service.getDashboard', () => {
  it('agrega KPIs, pipeline por etapa y actividad reciente', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ activeCandidates: 5 }]])
      .mockResolvedValueOnce([[{ openPositions: 3 }]])
      .mockResolvedValueOnce([[{ offersOut: 1 }]])
      .mockResolvedValueOnce([[{ hiredThisMonth: 2 }]])
      .mockResolvedValueOnce([[
        { id: 1, status: 'applied', candidateId: 10, candidateName: 'Ana', seniority: 'mid', skills: '["Angular"]', positionTitle: 'Senior Angular', updatedAt: '' },
        { id: 2, status: 'applied', candidateId: 11, candidateName: 'Luis', seniority: 'junior', skills: null, positionTitle: 'Junior Dev', updatedAt: '' },
        { id: 3, status: 'interview', candidateId: 12, candidateName: 'Eva', seniority: 'senior', skills: '["Node.js"]', positionTitle: 'Lead', updatedAt: '' },
      ]])
      .mockResolvedValueOnce([[
        { id: 3, status: 'interview', candidateName: 'Eva', positionTitle: 'Lead' },
      ]]);

    const data = await service.getDashboard(7);

    expect(data.kpis).toEqual({
      activeCandidates: 5,
      openPositions: 3,
      offersOut: 1,
      hiredThisMonth: 2,
    });

    expect(data.pipeline).toHaveLength(5);
    expect(data.pipeline[0]).toMatchObject({ stage: 'applied', count: 2 });
    expect(data.pipeline[0].items[0].skills).toEqual(['Angular']);
    expect(data.pipeline[0].items[1].skills).toEqual([]);
    expect(data.pipeline[2]).toMatchObject({ stage: 'interview', count: 1 });
    expect(data.pipeline[3].count).toBe(0);

    expect(data.recent).toHaveLength(1);
  });

  it('todos los counts en cero cuando no hay datos', async () => {
    pool.execute
      .mockResolvedValueOnce([[{ activeCandidates: 0 }]])
      .mockResolvedValueOnce([[{ openPositions: 0 }]])
      .mockResolvedValueOnce([[{ offersOut: 0 }]])
      .mockResolvedValueOnce([[{ hiredThisMonth: 0 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]]);

    const data = await service.getDashboard(7);
    expect(data.pipeline.every((s) => s.count === 0)).toBe(true);
    expect(data.recent).toEqual([]);
  });
});
