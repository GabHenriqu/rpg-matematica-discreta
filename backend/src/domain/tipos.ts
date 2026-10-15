/**
 * Modelo de dados único do grupo (TDD, Seção 4).
 * Este arquivo pode ser copiado para o front (React/TS) para tipar as respostas da API.
 */

export enum Classe {
  GUERREIRO = 'guerreiro',
  MAGO = 'mago',
  ARQUEIRO = 'arqueiro',
}

export enum Raridade {
  COMUM = 'comum',
  RARO = 'raro',
  EPICO = 'epico',
  LENDARIO = 'lendario',
}

export enum TipoEquipamento {
  ARMA = 'arma',
  ARMADURA = 'armadura',
}

export enum TipoRecurso {
  OURO = 'ouro',
  XP = 'xp',
  ITEM = 'item',
}

export enum TipoEvento {
  INFORMATIVO = 'informativo',
  RARO = 'raro',
  LENDARIO = 'lendario',
  DROP = 'drop',
}

export interface ContadoresDrops {
  comum: number;
  raro: number;
  lendario: number;
}

export interface Equipamento {
  id: string;
  nome: string;
  tipo: TipoEquipamento;
  ataque: number;
  defesa: number;
  raridade: Raridade;
}

export interface Atributos {
  vidaMaxima: number;
  ataque: number;
  defesa: number;
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
  /** id da atividade em andamento, ou null */
  atividadeAtualId: string | null;
}

export interface Atividade {
  id: string;
  nome: string;
  recurso: TipoRecurso;
  taxaPorSegundo: number;
  ativa: boolean;
  desbloqueada: boolean;
  /** Nível mínimo do personagem para desbloquear a atividade */
  nivelDesbloqueio: number;
}

export interface Recursos {
  ouro: number;
  /** XP acumulado (total) */
  xp: number;
  itens: number;
}

export interface Evento {
  id: string;
  /** ISO 8601 */
  momento: string;
  mensagem: string;
  tipo: TipoEvento;
}

export interface EstadoJogo {
  id: string;
  criadoEm: string;
  /** Instante (ms epoch) até o qual o tempo já foi processado */
  ultimoTick: number;
  personagem: Personagem;
  atividades: Atividade[];
  recursos: Recursos;
  /** Mais recente primeiro; no máximo 5 */
  eventos: Evento[];
  /** Drops encontrados por raridade (migrado automaticamente em saves antigos). */
  contadoresDrops: ContadoresDrops;
  /** Segundos ativos acumulados até o próximo drop; faixa 0..4. */
  segundosParaProximoDrop: number;
}

export interface ResultadoTick {
  estado: EstadoJogo;
  novosEventos: Evento[];
}

export interface SecaoCentralMatematica {
  id: 'funcoes' | 'inducao' | 'conjuntos' | 'relacoes' | 'combinatoria' | 'probabilidade';
  titulo: string;
  formula: string;
  explicacao: string;
  entrada: Record<string, unknown>;
  resultado: unknown;
}
