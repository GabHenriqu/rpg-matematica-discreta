import { IconeBolsa, IconeCadeado, IconeFagulha, IconeMoeda } from '../icons/Icones';
import { Botao } from '../ui/Botao';
import type { Atividade } from '../../types/jogo';

const iconePorRecurso = {
  ouro: IconeMoeda,
  xp: IconeFagulha,
  item: IconeBolsa,
} as const;

const corPorRecurso = {
  ouro: 'var(--color-gold)',
  xp: 'var(--color-violet)',
  item: 'var(--color-teal)',
} as const;

const rotuloPorRecurso = { ouro: 'ouro', xp: 'XP', item: 'item(ns)' } as const;

interface Props {
  atividade: Atividade;
  processando: boolean;
  onIniciar: () => void;
  onParar: () => void;
}

export function CartaoAtividade({ atividade, processando, onIniciar, onParar }: Props) {
  const Icone = iconePorRecurso[atividade.recurso];
  const cor = corPorRecurso[atividade.recurso];

  if (!atividade.desbloqueada) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-panel-raised/50 px-4 py-4 opacity-70">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted">
          <IconeCadeado className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-text">{atividade.nome}</p>
          <p className="text-xs text-muted">Desbloqueia no nível {atividade.nivelDesbloqueio}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-4 rounded-xl border bg-panel-raised px-4 py-4 transition-colors"
      style={{ borderColor: atividade.ativa ? cor : 'var(--color-border)' }}
    >
      <span
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ color: cor, backgroundColor: 'color-mix(in srgb, ' + cor + ' 18%, transparent)' }}
      >
        <Icone className="h-5 w-5" />
        {atividade.ativa && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full"
            style={{ backgroundColor: cor }}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text">{atividade.nome}</p>
        <p className="text-xs text-muted">
          produz {atividade.taxaPorSegundo} {rotuloPorRecurso[atividade.recurso]} por segundo
        </p>
      </div>
      {atividade.ativa ? (
        <Botao variante="secundaria" tamanho="pequeno" onClick={onParar} disabled={processando}>
          Parar
        </Botao>
      ) : (
        <Botao variante="primaria" tamanho="pequeno" onClick={onIniciar} disabled={processando}>
          Iniciar
        </Botao>
      )}
    </div>
  );
}
