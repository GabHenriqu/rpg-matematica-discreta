import { IconeBolsa, IconeFagulha, IconeMoeda } from '../icons/Icones';
import type { Recursos } from '../../types/jogo';

interface Props {
  recursos: Recursos;
}

function Contador({
  icone,
  valor,
  rotulo,
  cor,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
  cor: string;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-panel-raised px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ color: cor }}>
        {icone}
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold tabular-nums text-text">{valor}</p>
        <p className="text-xs text-muted">{rotulo}</p>
      </div>
    </div>
  );
}

export function BarraRecursos({ recursos }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Contador icone={<IconeMoeda className="h-6 w-6" />} valor={recursos.ouro.toLocaleString('pt-BR')} rotulo="Ouro" cor="var(--color-gold)" />
      <Contador icone={<IconeFagulha className="h-6 w-6" />} valor={recursos.xp.toLocaleString('pt-BR')} rotulo="Experiência acumulada" cor="var(--color-violet)" />
      <Contador
        icone={<IconeBolsa className="h-6 w-6" />}
        valor={`${recursos.itens}/${recursos.limiteItens}`}
        rotulo="Itens"
        cor="var(--color-teal)"
      />
    </div>
  );
}
