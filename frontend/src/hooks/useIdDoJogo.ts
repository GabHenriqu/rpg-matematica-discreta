import { useCallback, useState } from 'react';

const CHAVE = 'rpgIdleJogoId';

/** Guarda o id do jogo atual no localStorage, para retomar a partida ao reabrir a página. */
export function useIdDoJogo() {
  const [jogoId, setJogoIdState] = useState<string | null>(() => localStorage.getItem(CHAVE));

  const definirJogoId = useCallback((id: string) => {
    localStorage.setItem(CHAVE, id);
    setJogoIdState(id);
  }, []);

  const limparJogoId = useCallback(() => {
    localStorage.removeItem(CHAVE);
    setJogoIdState(null);
  }, []);

  return { jogoId, definirJogoId, limparJogoId };
}
