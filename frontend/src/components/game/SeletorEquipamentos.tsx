import { useEffect, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { Painel } from '../ui/Painel';
import { Botao } from '../ui/Botao';
import { IconeEscudo } from '../icons/Icones';
import { useJogo } from '../../context/GameContext';
import type { Equipamento } from '../../types/jogo';

const rotuloRaridade: Record<Equipamento['raridade'], string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
};

const corRaridade: Record<Equipamento['raridade'], string> = {
  comum: 'var(--color-muted)',
  raro: 'var(--color-teal)',
  epico: 'var(--color-violet)',
  lendario: 'var(--color-gold)',
};

export function SeletorEquipamentos() {
  const { jogo, equipar } = useJogo();
  const [equipamentos, setEquipamentos] = useState<Equipamento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [equipandoId, setEquipandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!jogo) return;
    let ativo = true;
    gameApi
      .catalogoEquipamentos(jogo.personagem.classe)
      .then((lista) => ativo && setEquipamentos(lista))
      .catch(() => ativo && setErro('Não foi possível carregar os equipamentos.'));
    return () => {
      ativo = false;
    };
  }, [jogo?.personagem.classe]);

  if (!jogo) return null;
  const idsEquipados = new Set(jogo.personagem.equipamentos.map((e) => e.id));

  return (
    <Painel titulo="Equipamentos disponíveis" icone={<IconeEscudo className="h-4 w-4" />}>
      {erro && <p className="text-sm text-crimson">{erro}</p>}
      {!erro && !equipamentos && <p className="text-sm text-muted">Carregando equipamentos…</p>}
      {equipamentos && (
        <ul className="flex flex-col gap-2">
          {equipamentos.map((equipamento) => {
            const equipado = idsEquipados.has(equipamento.id);
            return (
              <li
                key={equipamento.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-panel-raised px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{equipamento.nome}</p>
                  <p className="text-xs" style={{ color: corRaridade[equipamento.raridade] }}>
                    {rotuloRaridade[equipamento.raridade]}
                    {equipamento.ataque > 0 && ` · +${equipamento.ataque} atq`}
                    {equipamento.defesa > 0 && ` · +${equipamento.defesa} def`}
                  </p>
                </div>
                <Botao
                  variante="secundaria"
                  tamanho="pequeno"
                  disabled={equipado || equipandoId === equipamento.id}
                  onClick={async () => {
                    setEquipandoId(equipamento.id);
                    await equipar(equipamento.id);
                    setEquipandoId(null);
                  }}
                >
                  {equipado ? 'Equipado' : 'Equipar'}
                </Botao>
              </li>
            );
          })}
        </ul>
      )}
    </Painel>
  );
}
