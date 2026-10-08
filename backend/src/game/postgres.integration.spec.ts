import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Classe } from '../domain/tipos';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';
import { Clock, RandomService } from './runtime';

// Opt-in: nunca usa automaticamente as credenciais de produção.
const connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const integration = process.env.RUN_DATABASE_TESTS === '1' && connectionString ? describe : describe.skip;
integration('Postgres entre instâncias independentes', () => {
  jest.setTimeout(45000);
  let first: GameRepository;
  let second: GameRepository;
  let a: GameService;
  let b: GameService;
  let time = 1000000;
  const ids: string[] = [];
  beforeAll(() => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = connectionString;
    first = new GameRepository();
    second = new GameRepository();
    if (previous === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous;
    const clock = { now: () => time } as Clock;
    a = new GameService(first, clock, new RandomService());
    b = new GameService(second, clock, new RandomService());
  });
  afterAll(async () => {
    try { for (const id of ids) await first.delete(id); }
    finally { await Promise.all([first.onModuleDestroy(), second.onModuleDestroy()]); }
  });
  it('compartilha criação e serializa ticks e ações sem duplicar recursos', async () => {
    const game = await a.criar({ classe: Classe.GUERREIRO, nome: 'Integration' });
    ids.push(game.id);
    expect((await b.obter(game.id)).id).toBe(game.id);
    await a.iniciarAtividade(game.id, 'cacar');
    time += 10000;
    const ticks = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? a : b).tick(game.id)));
    expect(ticks.reduce((sum, tick) => sum + tick.segundosProcessados, 0)).toBe(10);
    expect((await b.obter(game.id)).recursos.ouro).toBe(30);
    time += 5000;
    await Promise.all([a.tick(game.id), b.equipar(game.id, 'espada-ferro')]);
    const updated = await a.obter(game.id);
    expect(updated.recursos.ouro).toBe(45);
    expect(updated.personagem.equipamentos.map(e => e.id)).toContain('espada-ferro');
    await expect(first.transaction(game.id, async () => {
      const state = (await first.find(game.id))!;
      state.recursos.ouro = 999;
      await first.save(state);
      throw new Error('rollback');
    })).rejects.toThrow(ServiceUnavailableException);
    expect((await b.obter(game.id)).recursos.ouro).toBe(45);
    await a.remover(game.id);
    await expect(b.obter(game.id)).rejects.toThrow(NotFoundException);
  });
});
