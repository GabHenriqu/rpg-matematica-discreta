import { IconePergaminho } from '../icons/Icones';
import { Painel } from '../ui/Painel';
import type { Evento } from '../../types/jogo';

const corPorTipo: Record<Evento['tipo'], string> = {
  informativo: 'var(--color-border)',
  raro: 'var(--color-teal)',
  lendario: 'var(--color-gold)',
};

export function DiarioEventos({ eventos }: { eventos: Evento[] }) {
  return (
    <Painel titulo="Crônica" icone={<IconePergaminho className="h-4 w-4" />}>
      {eventos.length === 0 ? (
        <p className="text-sm text-muted">Nenhum evento ainda. Inicie uma atividade para começar a crônica.</p>
      ) : (
        <ul className="cronica flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {eventos.map((evento) => (
            <li
              key={evento.id}
              className="rounded-md border-l-2 bg-panel-raised px-3 py-2 text-sm"
              style={{ borderColor: corPorTipo[evento.tipo] }}
            >
              <p className="text-text">{evento.mensagem}</p>
              <p className="mt-0.5 text-xs text-muted">
                {new Date(evento.momento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Painel>
  );
}
