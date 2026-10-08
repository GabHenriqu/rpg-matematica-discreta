import type { SVGProps } from 'react';

/**
 * Ícones de linha desenhados à mão para o RPG Idle — evita o clichê do emoji
 * e mantém a identidade visual (traço fino, currentColor) em todo o app.
 */
type Props = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconeMoeda(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 9.2v5.6M10.3 10.4c0-.7.7-1.2 1.7-1.2s1.7.5 1.7 1.1c0 1.6-3.4.9-3.4 2.5 0 .6.7 1.1 1.7 1.1s1.7-.5 1.7-1.2" />
    </svg>
  );
}

export function IconeFagulha(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c.6 3 1.9 5.9 3.8 7.8 1.9 1.9 4.8 3.2 7.7 3.7-3 .6-5.9 1.9-7.7 3.8-1.9 1.9-3.2 4.8-3.8 7.7-.5-3-1.8-5.9-3.7-7.7-1.9-1.9-4.8-3.2-7.8-3.8 3-.5 5.9-1.8 7.8-3.7 1.9-1.9 3.2-4.8 3.7-7.8Z" />
    </svg>
  );
}

export function IconeBolsa(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M8.5 8.5 9.6 4h4.8l1.1 4.5" />
      <path d="M6 8.5h12l1.2 10a2 2 0 0 1-2 2.2H6.8a2 2 0 0 1-2-2.2L6 8.5Z" />
      <path d="M9.5 11.5c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5" />
    </svg>
  );
}

export function IconeEspada(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 3.5 20.5 9.5 11 19l-3.5.5.5-3.5Z" />
      <path d="M9 15l-3 3M3.5 20.5l2-2" />
      <path d="M12.8 5.8l5.4 5.4" />
    </svg>
  );
}

export function IconeCajado(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2V21" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export function IconeArco(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5c-3 3-3 13.9 0 17" />
      <path d="M7 3.5 20 12 7 20.5" />
    </svg>
  );
}

export function IconeEscudo(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6Z" />
    </svg>
  );
}

export function IconeCadeado(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function IconePergaminho(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5h9a2.5 2.5 0 0 1 2.5 2.5v11.5H8.5A2.5 2.5 0 0 1 6 16V4.5Z" />
      <path d="M17.5 18.5a2.5 2.5 0 0 1-2.5-2.5V6" />
      <path d="M9 9h6M9 12.5h6" />
    </svg>
  );
}
