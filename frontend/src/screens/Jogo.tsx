import { gameApi } from '../api/gameApi';
import { useJogo } from '../context/GameContext';
import { Botao } from '../components/ui/Botao';
import { BarraRecursos } from '../components/game/BarraRecursos';
import { ListaAtividades } from '../components/game/ListaAtividades';
import { PainelPersonagem } from '../components/game/PainelPersonagem';
import { SeletorEquipamentos } from '../components/game/SeletorEquipamentos';
import { CentralMatematica } from '../components/game/CentralMatematica';
import { DiarioEventos } from '../components/game/DiarioEventos';

export function Jogo({ jogoId, onReiniciar }: { jogoId: string; onReiniciar: () => void }) {
  const { status, jogo, erro, recarregar } = useJogo();

  if (status === 'carregando' && !jogo) {
    return <main className="rpg-screen flex min-h-screen items-center justify-center"><p className="text-muted" role="status">Carregando jornada…</p></main>;
  }

  if (status === 'erro') {
    return (
      <main className="rpg-screen flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-crimson" role="alert">{erro}</p>
        <Botao onClick={recarregar}>Tentar novamente</Botao>
      </main>
    );
  }

  if (!jogo) return null;

  async function reiniciar() {
    if (!window.confirm('Isso apaga o progresso deste personagem. Continuar?')) return;
    await gameApi.remover(jogoId);
    onReiniciar();
  }

  return (
    <main className="rpg-screen relative overflow-hidden">
      <div className="relative mx-auto max-w-[1720px] px-3 py-5 sm:px-6 sm:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-gold">Matemática Discreta · Cohort 8</p>
            <div className="rpg-title-lockup rpg-title-lockup--compact mt-1">
              <svg className="rpg-title-crown" viewBox="0 0 40 32" aria-hidden="true"><path d="m5 9 8 7 7-11 7 11 8-7-3 17H8L5 9Z"/><path d="M9 29h22"/></svg>
              <h1 className="rpg-title text-2xl font-bold text-text sm:text-3xl">RPG Idle</h1>
            </div>
            <div className="rpg-title-divider rpg-title-divider--compact" aria-hidden="true" />
          </div>
          <nav aria-label="Links do jogo" className="flex items-center gap-2">
            <a href="https://github.com/GabHenriqu/rpg-matematica-discreta" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-panel-raised/70 px-3 py-2 text-xs font-semibold text-text transition-colors hover:border-gold hover:text-gold focus-visible:outline-offset-4 sm:text-sm">
              GitHub do projeto <span aria-hidden="true">↗</span>
            </a>
            <Botao variante="perigo" tamanho="pequeno" onClick={reiniciar}>Reiniciar jornada</Botao>
          </nav>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(230px,0.9fr)_minmax(360px,1.65fr)] xl:grid-cols-[minmax(240px,0.9fr)_minmax(420px,1.75fr)_minmax(300px,1.1fr)] xl:gap-5">
          <aside className="min-w-0"><PainelPersonagem personagem={jogo.personagem} /></aside>

          <section className="flex min-w-0 flex-col gap-4 sm:gap-5" aria-label="Recursos e ações">
            <BarraRecursos recursos={jogo.recursos} />
            <ListaAtividades />
            <SeletorEquipamentos />
          </section>

          <aside className="flex min-w-0 flex-col gap-4 sm:gap-5 xl:col-start-3 xl:row-start-1">
            <CentralMatematica jogoId={jogoId} />
            <DiarioEventos eventos={jogo.eventos} contadoresDrops={jogo.contadoresDrops} />
          </aside>
        </div>
      </div>
    </main>
  );
}
