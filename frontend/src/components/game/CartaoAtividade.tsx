import { IconeBolsa, IconeCadeado, IconeFagulha, IconeMoeda } from '../icons/Icones';
import { Botao } from '../ui/Botao';
import type { Atividade } from '../../types/jogo';

const iconePorRecurso = { ouro: IconeMoeda, xp: IconeFagulha, item: IconeBolsa } as const;
const corPorRecurso = { ouro: 'var(--color-gold)', xp: 'var(--color-violet)', item: 'var(--color-teal)' } as const;
const rotuloPorRecurso = { ouro: 'ouro', xp: 'XP', item: 'item(ns)' } as const;

interface Props { atividade: Atividade; processando: boolean; onIniciar: () => void; onParar: () => void; }

export function CartaoAtividade({ atividade, processando, onIniciar, onParar }: Props) {
  const Icone = iconePorRecurso[atividade.recurso];
  const cor = corPorRecurso[atividade.recurso];

  if (!atividade.desbloqueada) {
    return (
      <article className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-panel-raised/40 px-3 py-3 opacity-75 sm:gap-4 sm:px-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-ink/50 text-muted"><IconeCadeado className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><p className="font-semibold text-text">{atividade.nome}</p><p className="text-xs text-muted">Desbloqueia no nível {atividade.nivelDesbloqueio}</p></div>
        <span className="rounded-full border border-border px-2 py-1 text-[0.65rem] uppercase tracking-wider text-muted">Bloqueada</span>
      </article>
    );
  }

  return (
    <article className="flex flex-wrap items-center gap-3 rounded-xl border bg-gradient-to-r from-panel-raised/90 to-panel-raised/40 px-3 py-3 transition-colors sm:flex-nowrap sm:gap-4 sm:px-4" style={{ borderColor: atividade.ativa ? cor : 'var(--color-border)' }}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70" style={{ color: cor, backgroundColor: `color-mix(in srgb, ${cor} 14%, transparent)` }}>
        <Icone className="h-5 w-5" aria-hidden="true" />
        {atividade.ativa && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full ring-2 ring-panel" style={{ backgroundColor: cor }} aria-label="Atividade ativa" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{atividade.nome}{atividade.ativa && <span className="ml-2 text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: cor }}>Em andamento</span>}</p>
        <p className="mt-0.5 text-xs text-muted">{atividade.id === "explorar" ? "Encontra 1 item a cada 5 segundos" : `Produz ${atividade.taxaPorSegundo} ${rotuloPorRecurso[atividade.recurso]} por segundo`}</p>
      </div>
      {atividade.ativa ? <Botao variante="secundaria" tamanho="pequeno" onClick={onParar} disabled={processando}>Parar</Botao> : <Botao variante="primaria" tamanho="pequeno" onClick={onIniciar} disabled={processando}>Iniciar</Botao>}
    </article>
  );
}
