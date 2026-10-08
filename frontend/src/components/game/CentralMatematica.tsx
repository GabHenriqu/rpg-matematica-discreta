import { useEffect, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { Painel } from '../ui/Painel';
import { IconeFagulha } from '../icons/Icones';
import type { SecaoCentralMatematica } from '../../types/jogo';

function formatarResultado(valor: unknown): string {
  if (typeof valor === 'number') {
    return Number.isInteger(valor) ? valor.toLocaleString('pt-BR') : valor.toFixed(4);
  }
  if (Array.isArray(valor)) return valor.length ? valor.join(', ') : '—';
  if (valor && typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>)
      .map(([chave, v]) => `${chave}: ${formatarResultado(v)}`)
      .join(' · ');
  }
  return String(valor);
}

function formatarEntrada(entrada: Record<string, unknown>): string {
  return Object.entries(entrada)
    .map(([chave, v]) => `${chave} = ${Array.isArray(v) ? v.join(', ') : formatarResultado(v)}`)
    .join(' · ');
}

/**
 * Central Matemática do TDD: conecta cada seção (funções, indução, conjuntos,
 * relações, combinatória, probabilidade) ao estado real do jogo, atualizando
 * a cada poucos segundos — sem recalcular no front, só exibindo o que o
 * backend já calculou.
 */
export function CentralMatematica({ jogoId }: { jogoId: string }) {
  const [secoes, setSecoes] = useState<SecaoCentralMatematica[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    async function buscar() {
      try {
        const dados = await gameApi.centralMatematica(jogoId);
        if (ativo) setSecoes(dados);
      } catch {
        if (ativo) setErro('Não foi possível carregar a Central Matemática.');
      }
    }
    buscar();
    const intervalo = window.setInterval(buscar, 3000);
    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [jogoId]);

  return (
    <Painel titulo="Central Matemática" icone={<IconeFagulha className="h-4 w-4" />}>
      {erro && <p className="text-sm text-crimson">{erro}</p>}
      {!erro && !secoes && <p className="text-sm text-muted">Calculando…</p>}
      {secoes && (
        <div className="flex flex-col gap-1.5">
          {secoes.map((secao, indice) => (
            <details key={secao.id} className="formula group rounded-lg border border-border/70 bg-panel-raised px-3 py-2" open={indice === 0}>
              <summary className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text">{secao.titulo}</span>
                <span className="chevron text-muted">›</span>
              </summary>
              <p className="mt-2 break-words font-mono text-xs text-gold-soft">{secao.formula}</p>
              <p className="mt-1.5 text-xs text-muted">{formatarEntrada(secao.entrada)}</p>
              <p className="mt-1.5 text-sm text-text">{formatarResultado(secao.resultado)}</p>
            </details>
          ))}
        </div>
      )}
    </Painel>
  );
}
