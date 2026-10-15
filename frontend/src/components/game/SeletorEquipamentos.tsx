import { useEffect, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { Painel } from '../ui/Painel';
import { Botao } from '../ui/Botao';
import { IconeEscudo } from '../icons/Icones';
import { useJogo } from '../../context/GameContext';
import type { Equipamento } from '../../types/jogo';

const rotuloRaridade: Record<Equipamento['raridade'], string> = { comum: 'Comum', raro: 'Raro', epico: 'Épico', lendario: 'Lendário' };
const corRaridade: Record<Equipamento['raridade'], string> = {
  comum: 'var(--color-muted)', raro: 'var(--color-teal)', epico: 'var(--color-violet)', lendario: 'var(--color-gold)',
};
const imagemPorEquipamento: Record<string, string> = {
  'espada-ferro': '/rpg-idle/equipamentos/espada_ferro.svg',
  'espada-lendaria': '/rpg-idle/equipamentos/espada_lendaria.svg',
  'cajado-carvalho': '/rpg-idle/equipamentos/cajado_carvalho.svg',
  'cajado-arcano': '/rpg-idle/equipamentos/cajado_arcano.svg',
  'arco-cacador': '/rpg-idle/equipamentos/arco_cacador.svg',
  'arco-elfico': '/rpg-idle/equipamentos/arco_elfico.svg',
  'armadura-couro': '/rpg-idle/equipamentos/armadura_couro.svg',
  'armadura-placas': '/rpg-idle/equipamentos/armadura_placas.svg',
  'manto-aprendiz': '/rpg-idle/equipamentos/manto_aprendiz.svg',
  'manto-arcano': '/rpg-idle/equipamentos/manto_arcano.svg',
};

export function SeletorEquipamentos() {
  const { jogo, equipar } = useJogo();
  const [equipamentos, setEquipamentos] = useState<Equipamento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [equipandoId, setEquipandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!jogo) return;
    let ativo = true;
    setEquipamentos(null);
    setErro(null);
    gameApi.catalogoEquipamentos(jogo.personagem.classe)
      .then((lista) => { if (ativo) setEquipamentos(lista); })
      .catch(() => { if (ativo) setErro('Não foi possível carregar os equipamentos.'); });
    return () => { ativo = false; };
  }, [jogo?.personagem.classe]);

  if (!jogo) return null;
  const idsEquipados = new Set(jogo.personagem.equipamentos.map((e) => e.id));

  return (
    <Painel titulo="Equipamentos" icone={<IconeEscudo className="h-4 w-4" />}>
      {erro && <p className="text-sm text-crimson" role="alert">{erro}</p>}
      {!erro && !equipamentos && <p className="text-sm text-muted" role="status">Carregando equipamentos…</p>}
      {equipamentos && equipamentos.length === 0 && <p className="text-sm text-muted">Nenhum equipamento disponível para esta classe.</p>}
      {equipamentos && equipamentos.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {equipamentos.map((equipamento) => {
            const equipado = idsEquipados.has(equipamento.id);
            const imagem = imagemPorEquipamento[equipamento.id];
            return (
              <li key={equipamento.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/80 bg-panel-raised/80 p-2.5 transition-colors hover:border-gold/60">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-visible rounded-lg border border-border/70 bg-ink/50">
                  {imagem ? <img src={imagem} alt="" aria-hidden="true" className="h-14 w-14 object-contain" /> : <IconeEscudo className="h-7 w-7 text-muted" aria-hidden="true" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{equipamento.nome}</p>
                  <p className="text-xs" style={{ color: corRaridade[equipamento.raridade] }}>{rotuloRaridade[equipamento.raridade]}</p>
                  <p className="mt-0.5 text-[0.68rem] text-muted">{equipamento.ataque > 0 && `+${equipamento.ataque} ataque`}{equipamento.ataque > 0 && equipamento.defesa > 0 && ' · '}{equipamento.defesa > 0 && `+${equipamento.defesa} defesa`}</p>
                </div>
                <Botao variante="secundaria" tamanho="pequeno" disabled={equipado || equipandoId === equipamento.id} onClick={async () => {
                  setEquipandoId(equipamento.id);
                  try { await equipar(equipamento.id); } finally { setEquipandoId(null); }
                }}>{equipado ? 'Equipado' : equipandoId === equipamento.id ? 'Equipando…' : 'Equipar'}</Botao>
              </li>
            );
          })}
        </ul>
      )}
    </Painel>
  );
}
