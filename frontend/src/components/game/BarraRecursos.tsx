import type { ReactNode } from 'react';
import type { Recursos } from '../../types/jogo';

interface Props { recursos: Recursos; }

function Contador({ icone, valor, rotulo, cor }: { icone: ReactNode; valor: string; rotulo: string; cor: string }) {
  return (
    <div className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border/80 bg-gradient-to-br from-panel-raised to-panel px-3 py-3 shadow-inner transition-colors hover:border-gold/40 sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-ink/50" style={{ color: cor }}>{icone}</span>
      <div className="min-w-0"><p className="font-sans text-lg font-bold tabular-nums text-text sm:text-xl">{valor}</p><p className="truncate text-[0.68rem] text-muted sm:text-xs">{rotulo}</p></div>
    </div>
  );
}

export function BarraRecursos({ recursos }: Props) {
  return (
    <section aria-label="Recursos do personagem" className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
      <Contador icone={<img src="/rpg-idle/icones/ouro.svg" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />} valor={recursos.ouro.toLocaleString('pt-BR')} rotulo="Ouro" cor="var(--color-gold)" />
      <Contador icone={<img src="/rpg-idle/icones/xp.svg" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />} valor={recursos.xp.toLocaleString('pt-BR')} rotulo="Experiência acumulada" cor="var(--color-violet)" />
      <Contador icone={<img src="/rpg-idle/icones/inventario.svg" alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />} valor={recursos.itens.toLocaleString('pt-BR')} rotulo="Itens no inventário" cor="var(--color-teal)" />
    </section>
  );
}
