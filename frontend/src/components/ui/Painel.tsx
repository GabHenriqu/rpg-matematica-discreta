import type { ReactNode } from 'react';

interface Props {
  titulo?: string;
  icone?: ReactNode;
  acento?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Painel({ titulo, icone, acento = 'var(--color-gold)', acao, children, className = '' }: Props) {
  return (
    <section className={`rpg-panel rounded-2xl border border-border bg-panel p-4 sm:p-5 ${className}`}>
      {titulo && (
        <header className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icone && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-panel-raised" style={{ color: acento }}>
                {icone}
              </span>
            )}
            <h2 className="rpg-section-title truncate text-base font-bold text-text sm:text-lg">{titulo}</h2>
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}
