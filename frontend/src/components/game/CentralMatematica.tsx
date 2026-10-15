import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { gameApi } from '../../api/gameApi';
import { Painel } from '../ui/Painel';
import { Botao } from '../ui/Botao';
import { IconeFagulha } from '../icons/Icones';
import type { SecaoCentralMatematica } from '../../types/jogo';

const numeroPtBr = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const iconePorTopico: Record<SecaoCentralMatematica['id'], string> = {
  funcoes: '/rpg-idle/icones/funcoes.png',
  inducao: '/rpg-idle/icones/inducao.png',
  conjuntos: '/rpg-idle/icones/conjuntos.png',
  relacoes: '/rpg-idle/icones/relacoes.png',
  combinatoria: '/rpg-idle/icones/combinatoria.png',
  probabilidade: '/rpg-idle/icones/probabilidade.png',
};
const rotuloRaridade: Record<string, string> = { comum: 'comum', raro: 'raro', epico: 'épico', lendario: 'lendário' };
const rotuloClasse: Record<string, string> = { guerreiro: 'Guerreiro', mago: 'Mago', arqueiro: 'Arqueiro' };
const rotuloAtributo: Record<string, string> = { vidaMaxima: 'vida máxima', ataque: 'ataque', defesa: 'defesa' };

function formatarValor(valor: unknown): string {
  if (typeof valor === 'number') return numeroPtBr.format(valor);
  if (Array.isArray(valor)) return valor.map(formatarValor).join(', ') || 'conjunto vazio';
  if (valor && typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>)
      .map(([chave, item]) => `${rotuloAtributo[chave] ?? chave}: ${formatarValor(item)}`)
      .join(' · ');
  }
  return valor == null ? 'indisponível' : String(valor);
}

function formatarEntrada(secao: SecaoCentralMatematica): string[] {
  const entrada = secao.entrada;
  switch (secao.id) {
    case 'funcoes':
      return [
        `Atividade: ${formatarValor(entrada.atividade)}`,
        `Recurso produzido: ${formatarValor(entrada.recurso)}`,
        `Taxa: ${formatarValor(entrada.taxaPorSegundo)} ${formatarValor(entrada.recurso)} por segundo`,
        `Intervalo considerado: ${formatarValor(entrada.segundos)} segundo`,
      ];
    case 'inducao':
      return [`Nível considerado: ${formatarValor(entrada.nivel)}`];
    case 'conjuntos':
    case 'relacoes':
      return [`Classe considerada: ${rotuloClasse[String(entrada.classe)] ?? formatarValor(entrada.classe)}`];
    case 'combinatoria':
      return [`Classes: ${formatarValor(entrada.classes)}`, `Armas: ${formatarValor(entrada.armas)}`, `Armaduras: ${formatarValor(entrada.armaduras)}`];
    case 'probabilidade': {
      const pesos = Array.isArray(entrada.pesos) ? entrada.pesos as Array<{ raridade: string; peso: number }> : [];
      const distribuicao = pesos.map(({ raridade, peso }) => `${rotuloRaridade[raridade] ?? raridade} ${numeroPtBr.format(peso)}%`).join(', ');
      return [
        `Distribuição por tentativa: ${distribuicao || 'indisponível'}`,
        `Exemplo: ${formatarValor(entrada.n)} tentativas independentes`,
      ];
    }
  }
  return [];
}

function formatarResultado(secao: SecaoCentralMatematica): string[] {
  const resultado = secao.resultado;
  switch (secao.id) {
    case 'funcoes':
      return [`Produção no intervalo: ${formatarValor(resultado)} ${formatarValor(secao.entrada.recurso)}`];
    case 'inducao': {
      const valores = resultado as Record<string, unknown>;
      return [
        `XP pela recorrência: ${formatarValor(valores.recursiva)} XP`,
        `XP pela fórmula fechada: ${formatarValor(valores.formaFechada)} XP`,
        `XP previsto para o próximo nível, XP(n + 1): ${formatarValor(valores.xpProximoNivel)} XP`,
      ];
    }
    case 'conjuntos': {
      const valores = resultado as Record<string, unknown>;
      return [
        `Atributos da classe: ${formatarValor(valores.atributos)}`,
        `União das classes: ${formatarValor(valores.uniaoComOutrasClasses)}`,
        `Interseção das classes: ${formatarValor(valores.intersecaoComOutrasClasses)}`,
      ];
    }
    case 'relacoes':
      return [`Equipamentos compatíveis: ${formatarValor(resultado)}`];
    case 'combinatoria': {
      const valores = resultado as Record<string, unknown>;
      return [`Combinações sem restrições: ${formatarValor(valores.totalBruto)}`, `Combinações compatíveis: ${formatarValor(valores.totalCompativel)}`];
    }
    case 'probabilidade':
      return [`Chance de ao menos um resultado raro ou lendário em ${formatarValor(secao.entrada.n)} tentativas: ${numeroPtBr.format(Number(resultado) * 100)}%`];
  }
  return [];
}

export function CentralMatematica({ jogoId }: { jogoId: string }) {
  const [secoes, setSecoes] = useState<SecaoCentralMatematica[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [expandida, setExpandida] = useState(false);
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set(['funcoes']));
  const fecharRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const focoAnterior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let ativo = true;
    async function buscar() {
      try {
        const dados = await gameApi.centralMatematica(jogoId);
        if (ativo) { setSecoes(dados); setErro(null); }
      } catch {
        if (ativo) setErro('Não foi possível carregar a Central Matemática.');
      }
    }
    void buscar();
    const intervalo = window.setInterval(buscar, 3000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, [jogoId]);

  useEffect(() => {
    if (!expandida) return;
    focoAnterior.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    fecharRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      focoAnterior.current?.focus();
    };
  }, [expandida]);

  function alternarSecao(id: string, aberto: boolean) {
    setAbertos((atual) => {
      const proximo = new Set(atual);
      if (aberto) proximo.add(id); else proximo.delete(id);
      return proximo;
    });
  }

  function alternarTodas() {
    if (abertos.size === (secoes?.length ?? 0)) setAbertos(new Set());
    else setAbertos(new Set(secoes?.map((secao) => secao.id) ?? []));
  }

  function navegarPara(id: SecaoCentralMatematica['id']) {
    setAbertos((atual) => new Set(atual).add(id));
    window.requestAnimationFrame(() => {
      document.getElementById(`central-matematica-${jogoId}-${id}-detalhe`)
        ?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  function prenderFoco(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') { event.preventDefault(); setExpandida(false); return; }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const alvos = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), summary, [href], input, [tabindex]:not([tabindex="-1"])'));
    if (alvos.length === 0) return;
    const primeiro = alvos[0];
    const ultimo = alvos[alvos.length - 1];
    if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo.focus(); }
    else if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus(); }
  }

  function renderSecoes() {
    return secoes?.map((secao) => {
      const aberto = abertos.has(secao.id);
      const idConteudo = `central-matematica-${jogoId}-${secao.id}`;
      return (
        <details key={secao.id} id={`${idConteudo}-detalhe`} className="formula rounded-xl border border-border/80 bg-panel-raised/70 p-3 sm:p-4" open={aberto} onToggle={(event) => alternarSecao(secao.id, event.currentTarget.open)}>
          <summary aria-expanded={aberto} aria-controls={idConteudo} className="flex min-h-11 items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-offset-4">
            <span className="flex min-w-0 items-center gap-3">
              <img src={iconePorTopico[secao.id]} alt="" aria-hidden="true" className="h-8 w-8 shrink-0 object-contain" />
              <span className="text-sm font-semibold text-text sm:text-base">{secao.titulo}</span>
            </span>
            <span className="chevron text-lg text-gold" aria-hidden="true">›</span>
          </summary>
          <div id={idConteudo} className="mt-3 border-t border-border/70 pt-3">
            <p className="break-words font-mono text-xs leading-relaxed text-gold-soft sm:text-sm">{secao.formula}</p>
            <ul className="mt-3 flex flex-col gap-1 text-xs leading-relaxed text-muted sm:text-sm">
              {formatarEntrada(secao).map((linha, indice) => <li key={`${secao.id}-entrada-${indice}`}>{linha}</li>)}
            </ul>
            <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-text/85 sm:text-sm">{secao.explicacao}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm leading-relaxed text-text">
              {formatarResultado(secao).map((linha, indice) => <li key={`${secao.id}-resultado-${indice}`}>{linha}</li>)}
            </ul>
          </div>
        </details>
      );
    });
  }

  const conteudo = secoes && <div className="flex flex-col gap-2.5">{renderSecoes()}</div>;
  const portal = expandida && createPortal(
    <div className="rpg-math-backdrop fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpandida(false); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="central-expandida-titulo" onKeyDown={prenderFoco} className="rpg-math-dialog flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col rounded-2xl p-4 sm:max-h-[calc(100dvh-2.5rem)] sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Caderno de estudo</p><h2 id="central-expandida-titulo" className="rpg-section-title mt-1 text-xl font-bold text-text sm:text-2xl">Central Matemática</h2></div>
          <div className="flex items-center gap-2">
            <Botao variante="secundaria" tamanho="pequeno" onClick={alternarTodas}>{abertos.size === (secoes?.length ?? 0) ? 'Recolher todos' : 'Expandir todos'}</Botao>
            <button ref={fecharRef} type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs text-text hover:bg-panel-raised" aria-label="Fechar Central Matemática" onClick={() => setExpandida(false)}>Fechar</button>
          </div>
        </header>
        {erro && <p className="mb-3 text-sm text-crimson" role="status">{erro} Tentando novamente…</p>}
        {!secoes && !erro && <p className="text-sm text-muted" role="status">Calculando…</p>}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav aria-label="Tópicos da Central Matemática" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:pb-0">
            {secoes?.map((secao) => (
              <button key={secao.id} type="button" onClick={() => navegarPara(secao.id)} className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-panel-raised/70 px-3 py-2 text-left text-xs text-text hover:border-gold/60 focus-visible:outline-offset-2 lg:w-full">
                <img src={iconePorTopico[secao.id]} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
                <span>{secao.titulo}</span>
              </button>
            ))}
          </nav>
          <div className="min-h-0 overflow-y-auto pr-1">{conteudo}</div>
        </div>
      </section>
    </div>, document.body,
  );

  return (
    <>
      <Painel titulo="Central Matemática" icone={<IconeFagulha className="h-4 w-4" />} acao={<Botao variante="secundaria" tamanho="pequeno" onClick={() => setExpandida(true)}>Expandir</Botao>}>
        {erro && <p className="mb-3 text-sm text-crimson" role="status">{erro} Tentando novamente…</p>}
        {!secoes && !erro && <p className="text-sm text-muted" role="status">Calculando…</p>}
        {!expandida && conteudo}
      </Painel>
      {portal}
    </>
  );
}
