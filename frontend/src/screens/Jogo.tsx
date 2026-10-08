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
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Carregando jornada…</p>
      </main>
    );
  }

  if (status === 'erro') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-crimson">{erro}</p>
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text">RPG Idle</h1>
        <Botao variante="perigo" tamanho="pequeno" onClick={reiniciar}>
          Reiniciar jogo
        </Botao>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <PainelPersonagem personagem={jogo.personagem} />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-6">
          <BarraRecursos recursos={jogo.recursos} />
          <ListaAtividades />
          <SeletorEquipamentos />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          <CentralMatematica jogoId={jogoId} />
          <DiarioEventos eventos={jogo.eventos} />
        </div>
      </div>
    </main>
  );
}
