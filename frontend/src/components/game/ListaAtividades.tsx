import { useState } from 'react';
import { Painel } from '../ui/Painel';
import { IconePergaminho } from '../icons/Icones';
import { CartaoAtividade } from './CartaoAtividade';
import { useJogo } from '../../context/GameContext';

export function ListaAtividades() {
  const { jogo, iniciarAtividade, pararAtividade } = useJogo();
  const [processando, setProcessando] = useState(false);

  if (!jogo) return null;

  async function executar(acao: () => Promise<void>) {
    setProcessando(true);
    try {
      await acao();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Painel titulo="Atividades" icone={<IconePergaminho className="h-4 w-4" />}>
      <div className="flex flex-col gap-3">
        {jogo.atividades.map((atividade) => (
          <CartaoAtividade
            key={atividade.id}
            atividade={atividade}
            processando={processando}
            onIniciar={() => executar(() => iniciarAtividade(atividade.id))}
            onParar={() => executar(() => pararAtividade())}
          />
        ))}
      </div>
    </Painel>
  );
}
