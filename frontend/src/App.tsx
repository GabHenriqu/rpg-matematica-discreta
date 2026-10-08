import { useIdDoJogo } from './hooks/useIdDoJogo';
import { GameProvider } from './context/GameContext';
import { CriacaoPersonagem } from './screens/CriacaoPersonagem';
import { Jogo } from './screens/Jogo';

export default function App() {
  const { jogoId, definirJogoId, limparJogoId } = useIdDoJogo();

  if (!jogoId) {
    return <CriacaoPersonagem onCriado={(jogo) => definirJogoId(jogo.id)} />;
  }

  return (
    <GameProvider jogoId={jogoId} onJogoNaoEncontrado={limparJogoId}>
      <Jogo jogoId={jogoId} onReiniciar={limparJogoId} />
    </GameProvider>
  );
}
