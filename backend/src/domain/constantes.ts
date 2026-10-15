import { Raridade } from './tipos';

/** Indução: XP(1) = 100 e XP(n+1) = XP(n) + 50·n */
export const XP_INICIAL = 100;
export const INCREMENTO_XP = 50;

export const MAX_EVENTOS = 5;

/** Teto de tempo processado por chamada de tick (ganho offline máximo: 8h) */
export const MAX_SEGUNDOS_POR_TICK = 8 * 60 * 60;
export const SEGUNDOS_POR_DROP = 5;

export const ID_ATIVIDADE_EXPLORAR = 'explorar';

/**
 * Probabilidade: pesos do sorteio da atividade "Explorar" (70% / 25% / 5%).
 * Cada sorteio gera exatamente um item; a raridade define a categoria.
 */
export const PESOS_RARIDADE_EXPLORAR: ReadonlyArray<{ raridade: Raridade; peso: number }> = [
  { raridade: Raridade.COMUM, peso: 70 },
  { raridade: Raridade.RARO, peso: 25 },
  { raridade: Raridade.LENDARIO, peso: 5 },
];
