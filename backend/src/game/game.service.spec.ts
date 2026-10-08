import { ConflictException, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Classe, Raridade, TipoEvento } from '../domain/tipos';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';
import { Clock, RandomService } from './runtime';

class RelogioFalso extends Clock {
  t = 1_000_000;
  now() {
    return this.t;
  }
  avancar(segundos: number) {
    this.t += segundos * 1000;
  }
}

class AleatorioFalso extends RandomService {
  valores: number[] = [];
  next() {
    return this.valores.length ? this.valores.shift()! : 0; // 0 => comum
  }
}

async function criar() {
  const relogio = new RelogioFalso();
  const aleatorio = new AleatorioFalso();
  const service = new GameService(new GameRepository(), relogio, aleatorio);
  const jogo = await service.criar({ classe: Classe.GUERREIRO, nome: 'Teste' });
  return { relogio, aleatorio, service, id: jogo.id };
}

describe('GameService', () => {
  const databaseUrl = process.env.DATABASE_URL;
  beforeAll(() => { delete process.env.DATABASE_URL; });
  afterAll(() => {
    if (databaseUrl !== undefined) process.env.DATABASE_URL = databaseUrl;
  });
  it('cria personagem de nível 1 com 3 atividades', async () => {
    const { service, id } = await criar();
    const j = await service.obter(id);
    expect(j.personagem).toMatchObject({ classe: 'guerreiro', nivel: 1, xpAtual: 0, xpProximoNivel: 100 });
    expect(j.atividades.map((a) => a.id)).toEqual(['cacar', 'treinar', 'explorar']);
    expect(j.atividades.map((a) => a.desbloqueada)).toEqual([true, true, false]);
  });

  it('sem atividade ativa não produz nada', async () => {
    const { service, relogio, id } = await criar();
    relogio.avancar(30);
    const r = await service.tick(id);
    expect(r.estado.recursos).toMatchObject({ ouro: 0, xp: 0, itens: 0 });
  });

  it('Caçar produz 3 ouro/s', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'cacar');
    relogio.avancar(10);
    const r = await service.tick(id);
    expect(r.segundosProcessados).toBe(10);
    expect(r.estado.recursos.ouro).toBe(30);
  });

  it('tick repetido no mesmo instante não gera produção extra (sem "relógios" duplicados)', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'cacar');
    relogio.avancar(5);
    await service.tick(id);
    const r2 = await service.tick(id);
    const r3 = await service.tick(id);
    expect(r2.segundosProcessados).toBe(0);
    expect(r3.estado.recursos.ouro).toBe(15);
  });

  it('Treinar sobe de nível (100 XP = 20s) e desbloqueia Explorar', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'treinar');
    relogio.avancar(20);
    const r = await service.tick(id);
    expect(r.estado.personagem).toMatchObject({ nivel: 2, xpAtual: 0, xpProximoNivel: 150, vidaAtual: 132, ataque: 12 });
    expect(r.estado.atividades.find((a) => a.id === 'explorar')!.desbloqueada).toBe(true);
    expect(r.estado.recursos.xp).toBe(100);
    expect(r.novosEventos.map((e) => e.mensagem)).toEqual([
      'Subiu para o nível 2!',
      'Atividade "Explorar" desbloqueada',
    ]);
  });

  it('sobe vários níveis de uma vez (ganho offline)', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'treinar');
    relogio.avancar(200); // 1000 XP: 100+150+250+400 = 900 => nível 5, sobram 100
    const r = await service.tick(id);
    expect(r.estado.personagem).toMatchObject({ nivel: 5, xpAtual: 100 });
  });

  it('Explorar bloqueada até o nível 2', async () => {
    const { service, id } = await criar();
    await expect(service.iniciarAtividade(id, 'explorar')).rejects.toThrow(ConflictException);
  });

  it('Explorar: sorteio raro/lendário gera evento e bônus de itens; comum não gera evento', async () => {
    const { service, relogio, aleatorio, id } = await criar();
    await service.iniciarAtividade(id, 'treinar');
    relogio.avancar(20);
    await service.tick(id); // nível 2
    await service.iniciarAtividade(id, 'explorar');
    aleatorio.valores = [0.1, 0.8, 0.99]; // comum, raro, lendário
    relogio.avancar(3);
    const r = await service.tick(id);
    // 3 itens produzidos + 1 (raro) + 3 (lendário)
    expect(r.estado.recursos.itens).toBe(7);
    expect(r.novosEventos.map((e) => e.tipo)).toEqual([TipoEvento.RARO, TipoEvento.LENDARIO]);
  });

  it('limite de itens é respeitado', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'treinar');
    relogio.avancar(20);
    await service.tick(id);
    await service.iniciarAtividade(id, 'explorar');
    relogio.avancar(100);
    expect((await service.tick(id)).estado.recursos.itens).toBe(20);
  });

  it('event log guarda só os 5 mais recentes', async () => {
    const { service, id } = await criar();
    for (let i = 0; i < 4; i++) {
      await service.iniciarAtividade(id, 'cacar');
      await service.pararAtividade(id);
    }
    const eventos = await service.eventos(id);
    expect(eventos).toHaveLength(5);
    expect(eventos[0].mensagem).toBe('Parou a atividade "Caçar"');
  });

  it('equipar respeita a relação de compatibilidade e recalcula atributos', async () => {
    const { service, id } = await criar();
    await expect(service.equipar(id, 'cajado-arcano')).rejects.toThrow(BadRequestException);
    await expect(service.equipar(id, 'nao-existe')).rejects.toThrow(NotFoundException);
    await service.equipar(id, 'espada-ferro');
    await service.equipar(id, 'armadura-placas');
    let p = (await service.obter(id)).personagem;
    expect(p).toMatchObject({ ataque: 15, defesa: 16 });
    // trocar a arma substitui a anterior
    await service.equipar(id, 'espada-lendaria');
    p = (await service.obter(id)).personagem;
    expect(p.equipamentos).toHaveLength(2);
    expect(p).toMatchObject({ ataque: 25, defesa: 16 });
    expect(p.equipamentos.some((e) => e.raridade === Raridade.LENDARIO)).toBe(true);
  });

  it('central matemática tem as 6 seções', async () => {
    const { service, id } = await criar();
    const secoes = await service.centralMatematica(id);
    expect(secoes.map((s) => s.id)).toEqual([
      'funcoes', 'inducao', 'conjuntos', 'relacoes', 'combinatoria', 'probabilidade',
    ]);
  });

  it('jogo inexistente => 404', async () => {
    const { service } = await criar();
    await expect(service.obter('x')).rejects.toThrow(NotFoundException);
  });
  it('ticks simultâneos processam o tempo uma única vez', async () => {
    const { service, relogio, id } = await criar();
    await service.iniciarAtividade(id, 'cacar');
    relogio.avancar(10);
    const ticks = await Promise.all(Array.from({ length: 20 }, () => service.tick(id)));
    expect(ticks.reduce((total, tick) => total + tick.segundosProcessados, 0)).toBe(10);
    expect((await service.obter(id)).recursos.ouro).toBe(30);
  });

  it('falha no armazenamento é 503 e não usa memória como fallback', async () => {
    const repo = new GameRepository();
    const database = { find: jest.fn().mockRejectedValue(new Error('connection refused')) };
    Object.assign(repo, { database });
    await expect(repo.find('00000000-0000-0000-0000-000000000001')).rejects.toThrow(ServiceUnavailableException);
    expect(database.find).toHaveBeenCalledTimes(1);
  });

});
