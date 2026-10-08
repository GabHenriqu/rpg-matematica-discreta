import type { ReactNode } from 'react';

interface Props {
  titulo?: string;
  icone?: ReactNode;
  acento?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card base do sistema: painel com borda fina, cantos suaves, sem sombra/gradiente decorativos. */
export function Painel({ titulo, icone, acento = 'var(--color-gold)', acao, children, className = '' }: Props) {
  return (
    <section className={`rounded-2xl border border-border bg-panel p-5 ${className}`}>
      {titulo && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icone && (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ color: acento, backgroundColor: 'color-mix(in srgb, ' + acento + ' 16%, transparent)' }}
              >
                {icone}
              </span>
            )}
            <h2 className="font-display text-lg font-semibold text-text">{titulo}</h2>
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}
