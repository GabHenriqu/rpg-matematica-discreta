import { IconeArco, IconeCajado, IconeEscudo, IconeEspada } from '../icons/Icones';
import { Painel } from '../ui/Painel';
import { BarraProgresso } from '../ui/BarraProgresso';
import { DiscoNivel } from '../ui/DiscoNivel';
import type { Personagem } from '../../types/jogo';

const iconePorClasse = { guerreiro: IconeEspada, mago: IconeCajado, arqueiro: IconeArco } as const;
const rotuloPorClasse = { guerreiro: 'Guerreiro', mago: 'Mago', arqueiro: 'Arqueiro' } as const;
const imagemPorClasse = {
  guerreiro: '/rpg-idle/personagens/guerreiro.png',
  mago: '/rpg-idle/personagens/mago.png',
  arqueiro: '/rpg-idle/personagens/arqueiro.png',
} as const;
const corPorClasse = {
  guerreiro: 'var(--color-crimson)',
  mago: 'var(--color-violet)',
  arqueiro: 'var(--color-archer)',
} as const;

function LinhaAtributo({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-b-0">
      <span className="text-muted">{rotulo}</span>
      <span className="font-medium tabular-nums text-text">{valor}</span>
    </div>
  );
}

export function PainelPersonagem({ personagem }: { personagem: Personagem }) {
  const Icone = iconePorClasse[personagem.classe];
  const cor = corPorClasse[personagem.classe];

  return (
    <Painel className="xl:sticky xl:top-5">
      <div className="rpg-hero-frame -mx-4 -mt-4 mb-4 flex h-48 items-end justify-center overflow-hidden border-b border-border/70 bg-gradient-to-b from-panel-raised to-panel sm:-mx-5 sm:-mt-5 sm:h-56" data-class={personagem.classe}>
        <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(ellipse at 50% 75%, ${cor}, transparent 68%)` }} />
        <img className="rpg-hero-art relative z-10 max-h-[176px] max-w-[192px] object-contain object-bottom" src={imagemPorClasse[personagem.classe]} alt="" aria-hidden="true" />
        <div className="absolute right-3 top-3 z-20 rounded-full border border-border bg-ink/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: cor }}>
          <Icone className="mr-1 inline-block h-3 w-3 align-[-2px]" aria-hidden="true" />{rotuloPorClasse[personagem.classe]}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DiscoNivel nivel={personagem.nivel} xpAtual={personagem.xpAtual} xpProximoNivel={personagem.xpProximoNivel} />
        <div className="min-w-0">
          <h1 className="rpg-title break-words text-xl font-bold leading-tight text-text">{personagem.nome}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Icone className="h-4 w-4" /> {rotuloPorClasse[personagem.classe]}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted"><span>Experiência</span><span className="tabular-nums">{personagem.xpAtual}/{personagem.xpProximoNivel} XP</span></div>
          <BarraProgresso rotulo="Progresso de experiência" valor={personagem.xpAtual} maximo={personagem.xpProximoNivel} cor="var(--color-violet)" altura="sm" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted"><span>Vida</span><span className="tabular-nums">{personagem.vidaAtual}/{personagem.vidaMaxima}</span></div>
          <BarraProgresso rotulo="Vida do personagem" valor={personagem.vidaAtual} maximo={personagem.vidaMaxima} cor="var(--color-crimson)" altura="sm" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 rounded-xl border border-border/70 bg-ink/30 px-3">
        <LinhaAtributo rotulo="Ataque" valor={personagem.ataque} />
        <LinhaAtributo rotulo="Defesa" valor={personagem.defesa} />
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><IconeEscudo className="h-3.5 w-3.5" /> Equipamentos</p>
        {personagem.equipamentos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted">Nenhum equipamento ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {personagem.equipamentos.map((equipamento) => (
              <li key={equipamento.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-panel-raised px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{equipamento.nome}</span>
                <span className="shrink-0 text-xs text-muted">{equipamento.ataque > 0 && `+${equipamento.ataque} atq`}{equipamento.ataque > 0 && equipamento.defesa > 0 && ' · '}{equipamento.defesa > 0 && `+${equipamento.defesa} def`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Painel>
  );
}
