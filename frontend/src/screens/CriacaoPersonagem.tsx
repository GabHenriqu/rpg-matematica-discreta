import { useEffect, useState } from 'react';
import { gameApi } from '../api/gameApi';
import { Botao } from '../components/ui/Botao';
import { IconeArco, IconeCajado, IconeEspada } from '../components/icons/Icones';
import type { Classe, ConfigClasse, EstadoJogo } from '../types/jogo';

const iconePorClasse = { guerreiro: IconeEspada, mago: IconeCajado, arqueiro: IconeArco } as const;
const rotuloPorClasse: Record<Classe, string> = { guerreiro: 'Guerreiro', mago: 'Mago', arqueiro: 'Arqueiro' };

export function CriacaoPersonagem({ onCriado }: { onCriado: (jogo: EstadoJogo) => void }) {
  const [classes, setClasses] = useState<ConfigClasse[] | null>(null);
  const [classeEscolhida, setClasseEscolhida] = useState<Classe | null>(null);
  const [nome, setNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    gameApi
      .catalogoClasses()
      .then(setClasses)
      .catch(() => setErro('Não foi possível conectar ao backend. Verifique se ele está rodando em http://localhost:3000.'));
  }, []);

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16">
      <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">RPG Idle</h1>
      <p className="mt-3 max-w-md text-center text-muted">
        Escolha uma classe e dê um nome ao seu personagem. A jornada continua sozinha enquanto você não está olhando.
      </p>

      {erro && !classes && <p className="mt-8 text-sm text-crimson">{erro}</p>}

      {classes && (
        <>
          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {classes.map((config) => {
              const Icone = iconePorClasse[config.classe];
              const selecionada = classeEscolhida === config.classe;
              return (
                <button
                  key={config.classe}
                  onClick={() => setClasseEscolhida(config.classe)}
                  className="flex flex-col items-center gap-3 rounded-2xl border bg-panel px-4 py-6 text-left transition-colors"
                  style={{ borderColor: selecionada ? 'var(--color-gold)' : 'var(--color-border)' }}
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      color: selecionada ? 'var(--color-gold)' : 'var(--color-muted)',
                      backgroundColor: 'var(--color-panel-raised)',
                    }}
                  >
                    <Icone className="h-6 w-6" />
                  </span>
                  <span className="font-display text-lg font-semibold text-text">{rotuloPorClasse[config.classe]}</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {config.atributos.map((a) => (
                      <span key={a} className="rounded-full bg-panel-raised px-2 py-0.5 text-xs text-muted">
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs tabular-nums text-muted">
                    vida {config.base.vidaMaxima} · ataque {config.base.ataque} · defesa {config.base.defesa}
                  </p>
                </button>
              );
            })}
          </div>

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={30}
            placeholder="Nome do personagem"
            className="mt-6 w-full max-w-xs rounded-lg border border-border bg-panel-raised px-4 py-2.5 text-center text-text placeholder:text-muted focus:outline-none"
          />

          {erro && <p className="mt-3 text-sm text-crimson">{erro}</p>}

          <Botao className="mt-6" disabled={!classeEscolhida || enviando} onClick={criarJogo}>
            {enviando ? 'Criando…' : 'Começar jornada'}
          </Botao>
        </>
      )}
    </main>
  );
}
