import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { ErroApi } from '../api/client';
import { gameApi } from '../api/gameApi';
import type { EstadoJogo, Evento } from '../types/jogo';

type Status = 'carregando' | 'pronto' | 'erro';

interface Estado {
  status: Status;
  jogo: EstadoJogo | null;
  erro: string | null;
  ultimosEventos: Evento[];
}

type Acao =
  | { tipo: 'CARREGANDO' }
  | { tipo: 'JOGO_ATUALIZADO'; jogo: EstadoJogo; novosEventos?: Evento[] }
  | { tipo: 'ERRO'; mensagem: string };

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'CARREGANDO':
      return { ...estado, status: 'carregando', erro: null };
    case 'JOGO_ATUALIZADO':
      return {
        status: 'pronto',
        jogo: acao.jogo,
        erro: null,
        ultimosEventos: acao.novosEventos ?? [],
      };
    case 'ERRO':
      return { ...estado, status: 'erro', erro: acao.mensagem };
  }
}

interface ContextoJogo extends Estado {
  iniciarAtividade: (atividadeId: string) => Promise<void>;
  pararAtividade: () => Promise<void>;
  equipar: (equipamentoId: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

const Contexto = createContext<ContextoJogo | null>(null);

interface Props {
  jogoId: string;
  onJogoNaoEncontrado: () => void;
  children: ReactNode;
}

/**
 * Dono do estado do jogo: carrega o estado, expõe as ações (iniciar/parar/
 * equipar) e mantém o game loop rodando (1 tick por segundo) enquanto a aba
 * estiver visível. O servidor calcula o tempo decorrido, então ticks perdidos
 * (aba em segundo plano) são recuperados automaticamente no próximo tick.
 */
export function GameProvider({ jogoId, onJogoNaoEncontrado, children }: Props) {
  const [estado, dispatch] = useReducer(reducer, {
    status: 'carregando',
    jogo: null,
    erro: null,
    ultimosEventos: [],
  });
  const emVooRef = useRef(false);

  const tratarErro = useCallback(
    (erro: unknown) => {
      if (erro instanceof ErroApi && erro.status === 404) {
        onJogoNaoEncontrado();
        return;
      }
      const mensagem = erro instanceof Error ? erro.message : 'Erro inesperado';
      dispatch({ tipo: 'ERRO', mensagem });
    },
    [onJogoNaoEncontrado],
  );

  const carregar = useCallback(async () => {
    dispatch({ tipo: 'CARREGANDO' });
    try {
      const jogo = await gameApi.obter(jogoId);
      dispatch({ tipo: 'JOGO_ATUALIZADO', jogo });
    } catch (erro) {
      tratarErro(erro);
    }
  }, [jogoId, tratarErro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Game loop: 1 tick por segundo. Ignora ticks sobrepostos e pausa com a aba oculta.
  useEffect(() => {
    const intervalo = window.setInterval(async () => {
      if (emVooRef.current || document.visibilityState !== 'visible') return;
      emVooRef.current = true;
      try {
        const { estado: jogo, novosEventos } = await gameApi.tick(jogoId);
        dispatch({ tipo: 'JOGO_ATUALIZADO', jogo, novosEventos });
      } catch (erro) {
        tratarErro(erro);
      } finally {
        emVooRef.current = false;
      }
    }, 1000);
    return () => window.clearInterval(intervalo);
  }, [jogoId, tratarErro]);

  const iniciarAtividade = useCallback(
    async (atividadeId: string) => {
      try {
        const jogo = await gameApi.iniciarAtividade(jogoId, atividadeId);
        dispatch({ tipo: 'JOGO_ATUALIZADO', jogo });
      } catch (erro) {
        tratarErro(erro);
      }
    },
    [jogoId, tratarErro],
  );

  const pararAtividade = useCallback(async () => {
    try {
      const jogo = await gameApi.pararAtividade(jogoId);
      dispatch({ tipo: 'JOGO_ATUALIZADO', jogo });
    } catch (erro) {
      tratarErro(erro);
    }
  }, [jogoId, tratarErro]);

  const equipar = useCallback(
    async (equipamentoId: string) => {
      try {
        const jogo = await gameApi.equipar(jogoId, equipamentoId);
        dispatch({ tipo: 'JOGO_ATUALIZADO', jogo });
      } catch (erro) {
        tratarErro(erro);
      }
    },
    [jogoId, tratarErro],
  );

  return (
    <Contexto.Provider value={{ ...estado, iniciarAtividade, pararAtividade, equipar, recarregar: carregar }}>
      {children}
    </Contexto.Provider>
  );
}

export function useJogo(): ContextoJogo {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useJogo precisa estar dentro de <GameProvider>');
  return contexto;
}
