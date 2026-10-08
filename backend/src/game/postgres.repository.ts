import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, PoolClient } from 'pg';
import { EstadoJogo } from '../domain/tipos';

/** Compartilha partidas entre instâncias e serializa alterações por partida. */
export class PostgresRepository {
  private readonly pool: Pool;
  private readonly context = new AsyncLocalStorage<PoolClient>();
  private ready?: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 10000 });
    this.pool.on('error', () => { /* Falhas nas operações são tratadas pelo repositório. */ });
  }

  private async initialize(): Promise<void> {
    if (!this.ready) {
      this.ready = (async () => {
        const client = await this.pool.connect();
        try {
          await client.query('BEGIN');
          await client.query('SELECT pg_advisory_xact_lock(824731901)');
          await client.query('CREATE TABLE IF NOT EXISTS rpg_games (id UUID PRIMARY KEY, estado JSONB NOT NULL)');
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK').catch(() => undefined);
          throw error;
        } finally {
          client.release();
        }
      })().catch((error) => { this.ready = undefined; throw error; });
    }
    await this.ready;
  }

  async find(id: string): Promise<EstadoJogo | undefined> {
    await this.initialize();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return undefined;
    const client = this.context.getStore();
    const result = await (client ?? this.pool).query(
      'SELECT estado FROM rpg_games WHERE id = $1' + (client ? ' FOR UPDATE' : ''), [id],
    );
    return result.rows[0]?.estado;
  }

  async save(estado: EstadoJogo): Promise<void> {
    await this.initialize();
    await (this.context.getStore() ?? this.pool).query(
      'INSERT INTO rpg_games (id, estado) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado',
      [estado.id, JSON.stringify(estado)],
    );
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize();
    const result = await (this.context.getStore() ?? this.pool).query('DELETE FROM rpg_games WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async transaction<T>(operation: () => Promise<T>): Promise<T> {
    await this.initialize();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.context.run(client, operation);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> { await this.pool.end(); }
}
