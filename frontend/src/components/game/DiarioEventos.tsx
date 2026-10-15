import { IconePergaminho } from '../icons/Icones';
import { Painel } from '../ui/Painel';
import type { Evento } from '../../types/jogo';

const corPorTipo: Record<Evento['tipo'], string> = { informativo: 'var(--color-border)', raro: 'var(--color-teal)', lendario: 'var(--color-gold)', drop: 'var(--color-gold)' };
const rotuloPorTipo: Record<Evento['tipo'], string> = { informativo: 'Relato', raro: 'Raro', lendario: 'Lendário', drop: 'Drops' };

export function DiarioEventos({ eventos, contadoresDrops }: { eventos: Evento[]; contadoresDrops: { comum: number; raro: number; lendario: number } }) {
  return (
    <Painel titulo="Crônica" icone={<img src="/rpg-idle/icones/cronica.png" alt="" aria-hidden="true" className="h-6 w-6 object-contain" />}>
      <div aria-label="Drops encontrados por raridade" className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-panel-raised/60 p-2 text-center">
        <p className="text-xs text-text"><span className="block text-[0.62rem] uppercase tracking-wider text-muted">Comuns</span>{contadoresDrops.comum}</p>
        <p className="text-xs text-teal"><span className="block text-[0.62rem] uppercase tracking-wider text-muted">Raros</span>{contadoresDrops.raro}</p>
        <p className="text-xs text-gold"><span className="block text-[0.62rem] uppercase tracking-wider text-muted">Lendários</span>{contadoresDrops.lendario}</p>
      </div>
      {eventos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-panel-raised/40 px-4 py-5 text-center">
          <IconePergaminho className="mx-auto mb-2 h-6 w-6 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">Nenhum evento ainda. Inicie uma atividade para começar a crônica.</p>
        </div>
      ) : (
        <ol aria-label="Eventos recentes" className="cronica flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          {eventos.map((evento) => (
            <li key={evento.id} className="relative rounded-r-lg border-l-2 bg-panel-raised/80 px-3 py-2.5" style={{ borderColor: corPorTipo[evento.tipo] }}>
              <div className="mb-1 flex items-center justify-between gap-2"><span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em]" style={{ color: corPorTipo[evento.tipo] }}>{rotuloPorTipo[evento.tipo]}</span><time className="text-[0.68rem] tabular-nums text-muted" dateTime={new Date(evento.momento).toISOString()}>{new Date(evento.momento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time></div>
              <p className="text-sm leading-relaxed text-text">{evento.mensagem}</p>
            </li>
          ))}
        </ol>
      )}
    </Painel>
  );
}
