interface Props {
  nivel: number;
  xpAtual: number;
  xpProximoNivel: number;
}

/**
 * O elemento memorável do painel: um dial circular (bússola de progresso)
 * mostrando o avanço de XP até o próximo nível, com o nível em destaque no centro.
 */
export function DiscoNivel({ nivel, xpAtual, xpProximoNivel }: Props) {
  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const progresso = xpProximoNivel > 0 ? Math.min(1, xpAtual / xpProximoNivel) : 0;
  const offset = circunferencia * (1 - progresso);

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="var(--color-panel-raised)" strokeWidth={6} />
        <circle
          cx="50"
          cy="50"
          r={raio}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl font-semibold leading-none text-text">{nivel}</span>
        <span className="mt-1 text-[0.65rem] tracking-wide text-muted">nível</span>
      </div>
    </div>
  );
}
