import { useCallback, useEffect, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { Botao } from '../components/ui/Botao';
import { IconeArco, IconeCajado, IconeEspada } from '../components/icons/Icones';
import type { Classe, ConfigClasse, EstadoJogo } from '../types/jogo';

const rotuloPorClasse: Record<Classe, string> = { guerreiro: 'Guerreiro', mago: 'Mago', arqueiro: 'Arqueiro' };
const imagemPorClasse: Record<Classe, string> = {
  guerreiro: '/rpg-idle/personagens/guerreiro.png',
  mago: '/rpg-idle/personagens/mago.png',
  arqueiro: '/rpg-idle/personagens/arqueiro.png',
};
const corPorClasse: Record<Classe, string> = {
  guerreiro: 'var(--color-crimson)',
  mago: 'var(--color-violet)',
  arqueiro: 'var(--color-archer)',
};
const emblemaPorClasse = { guerreiro: IconeEspada, mago: IconeCajado, arqueiro: IconeArco } as const;

export function CriacaoPersonagem({ onCriado }: { onCriado: (jogo: EstadoJogo) => void }) {
  const [classes, setClasses] = useState<ConfigClasse[] | null>(null);
  const [classeEscolhida, setClasseEscolhida] = useState<Classe | null>(null);
  const [nome, setNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [carregandoClasses, setCarregandoClasses] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarClasses = useCallback(async () => {
    setCarregandoClasses(true);
    setErro(null);
    try {
      setClasses(await gameApi.catalogoClasses());
    } catch {
      setErro('Não foi possível carregar as classes. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregandoClasses(false);
    }
  }, []);

  useEffect(() => { void carregarClasses(); }, [carregarClasses]);

  async function criarJogo() {
    if (!classeEscolhida) return;
    setEnviando(true);
    setErro(null);
    try {
      const jogo = await gameApi.criar(classeEscolhida, nome);
      onCriado(jogo);
    } catch {
      setErro('Não foi possível criar o personagem. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="rpg-screen relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div className="relative w-full max-w-5xl">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">Matemática Discreta — Cohort 8</p>
          <svg className="rpg-title-crown rpg-create-title-crown mt-3" viewBox="0 0 40 32" aria-hidden="true"><path d="m5 9 8 7 7-11 7 11 8-7-3 17H8L5 9Z"/><path d="M9 29h22"/></svg>
          <div className="rpg-title-lockup rpg-create-title-lockup mt-1">
            <span className="rpg-title-flourish rpg-title-flourish--left" aria-hidden="true" />
            <h1 className="rpg-title text-5xl font-bold leading-none text-text sm:text-7xl">RPG Idle</h1>
            <span className="rpg-title-flourish rpg-title-flourish--right" aria-hidden="true" />
          </div>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">Escolha uma classe e dê um nome ao seu personagem.</p>
        </header>

        {carregandoClasses && !classes && <p className="py-8 text-center text-sm text-muted" role="status">Carregando classes…</p>}
        {erro && (!classes || classes.length === 0) && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-crimson/40 bg-panel p-6 text-center" role="alert">
            <p className="text-sm text-crimson">{erro}</p>
            <Botao variante="secundaria" onClick={carregarClasses} disabled={carregandoClasses}>{carregandoClasses ? 'Carregando…' : 'Tentar novamente'}</Botao>
          </div>
        )}

        {classes?.length === 0 && !carregandoClasses && !erro && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-panel p-6 text-center" role="status">
            <p className="text-sm text-muted">O catálogo de classes está vazio.</p>
            <Botao variante="secundaria" onClick={carregarClasses}>Tentar novamente</Botao>
          </div>
        )}

        {classes && classes.length > 0 && (
          <section aria-label="Criação do personagem" className="rpg-panel rounded-3xl border border-border p-4 sm:p-7">
            <h2 className="rpg-section-title mb-3 text-center text-lg font-semibold text-text">Escolha seu caminho</h2>
            <div className="rpg-title-divider mb-5" aria-hidden="true" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" role="group" aria-label="Escolha uma classe">
              {classes.map((config) => {
                const selecionada = classeEscolhida === config.classe;
                const cor = corPorClasse[config.classe];
                const Emblema = emblemaPorClasse[config.classe];
                return (
                  <button
                    key={config.classe}
                    type="button"
                    onClick={() => setClasseEscolhida(config.classe)}
                    aria-pressed={selecionada}
                    className="rpg-class-card group relative flex min-h-72 flex-col items-center overflow-hidden rounded-2xl border bg-panel-raised/70 px-4 py-4 text-center focus-visible:outline-offset-4"
                    data-class={config.classe}
                  >
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-25" style={{ background: `radial-gradient(ellipse at 50% 50%, ${cor}, transparent 88%)` }} />
                    <span className="rpg-class-emblem absolute right-4 top-4 z-10" style={{ color: cor }}><Emblema className="h-5 w-5" aria-hidden="true" /></span>
                    <img className="rpg-hero-art relative z-10 h-[168px] max-w-full object-contain sm:h-[184px]" src={imagemPorClasse[config.classe]} alt="" aria-hidden="true" />
                    <span className="rpg-title relative z-10 text-xl font-bold text-text">{rotuloPorClasse[config.classe]}</span>
                    <div className="relative z-10 mt-2 flex flex-wrap justify-center gap-1.5">
                      {config.atributos.map((atributo) => <span key={atributo} className="rounded-full border border-border bg-ink/50 px-2 py-0.5 text-xs text-text">{atributo}</span>)}
                    </div>
                    <p className="relative z-10 mt-2 text-xs tabular-nums text-text">Vida {config.base.vidaMaxima} · Ataque {config.base.ataque} · Defesa {config.base.defesa}</p>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-6 flex max-w-sm flex-col items-center gap-3">
              <label className="w-full text-sm text-muted" htmlFor="nome-personagem">Nome do personagem
                <input id="nome-personagem" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={30} className="rpg-sketch-field mt-2 w-full bg-ink/70 px-4 py-3 text-center text-text placeholder:text-muted focus:outline-none" />
              </label>
              {erro && <p className="text-center text-sm text-crimson" role="alert">{erro}</p>}
              <Botao className="rpg-sketch-button w-full sm:w-auto" disabled={!classeEscolhida || enviando} onClick={criarJogo}>{enviando ? 'Criando…' : 'Começar jornada'}</Botao>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
