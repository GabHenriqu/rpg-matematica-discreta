import { IconeArco, IconeCajado, IconeEscudo, IconeEspada } from '../icons/Icones';
import { Painel } from '../ui/Painel';
import { BarraProgresso } from '../ui/BarraProgresso';
import { DiscoNivel } from '../ui/DiscoNivel';
import type { Personagem } from '../../types/jogo';

const iconePorClasse = { guerreiro: IconeEspada, mago: IconeCajado, arqueiro: IconeArco } as const;
const rotuloPorClasse = { guerreiro: 'Guerreiro', mago: 'Mago', arqueiro: 'Arqueiro' } as const;

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

  return (
    <Painel>
      <div className="flex flex-col items-center text-center">
        <DiscoNivel nivel={personagem.nivel} xpAtual={personagem.xpAtual} xpProximoNivel={personagem.xpProximoNivel} />
        <h1 className="mt-2 font-display text-2xl font-semibold text-text">{personagem.nome}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Icone className="h-4 w-4" />
          {rotuloPorClasse[personagem.classe]}
        </p>

        <div className="mt-3 w-full">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Experiência</span>
            <span className="tabular-nums">
              {personagem.xpAtual}/{personagem.xpProximoNivel}
            </span>
          </div>
          <BarraProgresso valor={personagem.xpAtual} maximo={personagem.xpProximoNivel} cor="var(--color-violet)" altura="sm" />
        </div>

        <div className="mt-3 w-full">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Vida</span>
            <span className="tabular-nums">
              {personagem.vidaAtual}/{personagem.vidaMaxima}
            </span>
          </div>
          <BarraProgresso valor={personagem.vidaAtual} maximo={personagem.vidaMaxima} cor="var(--color-crimson)" altura="sm" />
        </div>
      </div>

      <div className="mt-4">
        <LinhaAtributo rotulo="Ataque" valor={personagem.ataque} />
        <LinhaAtributo rotulo="Defesa" valor={personagem.defesa} />
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
          <IconeEscudo className="h-3.5 w-3.5" /> Equipamentos
        </p>
        {personagem.equipamentos.length === 0 ? (
          <p className="text-xs text-muted">Nenhum equipamento ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {personagem.equipamentos.map((equipamento) => (
              <li key={equipamento.id} className="flex items-center justify-between rounded-lg bg-panel-raised px-3 py-1.5 text-sm">
                <span>{equipamento.nome}</span>
                <span className="text-xs text-muted">
                  {equipamento.ataque > 0 && `+${equipamento.ataque} atq`}
                  {equipamento.ataque > 0 && equipamento.defesa > 0 && ' · '}
                  {equipamento.defesa > 0 && `+${equipamento.defesa} def`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Painel>
  );
}
