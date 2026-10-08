import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primaria' | 'secundaria' | 'perigo';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: 'padrao' | 'pequeno';
  children: ReactNode;
}

const variantes: Record<Variante, string> = {
  primaria: 'bg-gold text-ink-deep hover:bg-gold-soft border border-transparent',
  secundaria: 'bg-transparent text-text border border-border hover:bg-panel-raised',
  perigo: 'bg-transparent text-crimson border border-crimson/40 hover:bg-crimson/10',
};

export function Botao({ variante = 'primaria', tamanho = 'padrao', className = '', disabled, children, ...resto }: Props) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        tamanho === 'padrao' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        variantes[variante],
        className,
      ].join(' ')}
      {...resto}
    >
      {children}
    </button>
  );
}
