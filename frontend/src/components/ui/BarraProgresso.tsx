interface Props {
  valor: number;
  maximo: number;
  cor?: string;
  altura?: 'sm' | 'md';
}

export function BarraProgresso({ valor, maximo, cor = 'var(--color-gold)', altura = 'md' }: Props) {
  const percentual = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0;
  return (
    <div
      className={`w-full overflow-hidden rounded-full border border-border bg-panel-raised ${altura === 'md' ? 'h-2.5' : 'h-1.5'}`}
      role="progressbar"
      aria-valuenow={Math.round(percentual)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${percentual}%`, backgroundColor: cor }}
      />
    </div>
  );
}
