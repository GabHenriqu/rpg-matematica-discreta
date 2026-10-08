/**
 * Modelo de dados espelhando 1:1 `src/domain/tipos.ts` do backend (TDD, Seção 4).
 * Mantenha este arquivo sincronizado se o backend mudar algum campo.
 */

export type Classe = 'guerreiro' | 'mago' | 'arqueiro';

export type Raridade = 'comum' | 'raro' | 'epico' | 'lendario';

export type TipoEquipamento = 'arma' | 'armadura';

export type TipoRecurso = 'ouro' | 'xp' | 'item';

export type TipoEvento = 'informativo' | 'raro' | 'lendario';

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;
  ataque: number;
  defesa: number;
  raridade: Raridade;
}

export interface Personagem {
  nome: string;
  classe: Classe;
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
  vidaAtual: number;
  vidaMaxima: number;
  ataque: number;
  defesa: number;
  equipamentos: Equipamento[];
  atividadeAtualId: string | null;
}

export interface Atividade {
  id: string;
  nome: string;
  recurso: TipoRecurso;
  taxaPorSegundo: number;
  ativa: boolean;
  desbloqueada: boolean;
  nivelDesbloqueio: number;
}

export interface Recursos {
  ouro: number;
  xp: number;
  itens: number;
  limiteItens: number;
}

export interface Evento {
  id: string;
  momento: string;
  mensagem: string;
  tipo: TipoEvento;
}

export interface EstadoJogo {
  id: string;
  criadoEm: string;
  ultimoTick: number;
  personagem: Personagem;
  atividades: Atividade[];
  recursos: Recursos;
  eventos: Evento[];
}

export interface RespostaTick {
  estado: EstadoJogo;
  segundosProcessados: number;
  novosEventos: Evento[];
}

export interface SecaoCentralMatematica {
  id: 'funcoes' | 'inducao' | 'conjuntos' | 'relacoes' | 'combinatoria' | 'probabilidade';
  titulo: string;
  formula: string;
  entrada: Record<string, unknown>;
  resultado: unknown;
}

export interface ConfigClasse {
  classe: Classe;
  atributos: string[];
  base: { vidaMaxima: number; ataque: number; defesa: number };
  crescimento: { vidaMaxima: number; ataque: number; defesa: number };
}
