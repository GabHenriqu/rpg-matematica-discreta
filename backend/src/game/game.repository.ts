import { HttpException, Injectable, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { EstadoJogo } from '../domain/tipos';
import { PostgresRepository } from './postgres.repository';

/**
 * Repositório em memória. Se a variável PERSIST_FILE estiver definida,
 * os jogos também são gravados nesse arquivo JSON (persistência simples).
 */
@Injectable()
export class GameRepository implements OnModuleInit, OnModuleDestroy {
  private readonly jogos = new Map<string, EstadoJogo>();
  private readonly arquivo = process.env.PERSIST_FILE;

  private readonly database?: PostgresRepository;

  constructor() {
    this.database = process.env.DATABASE_URL ? new PostgresRepository(process.env.DATABASE_URL) : undefined;
  }
  private readonly queues = new Map<string, Promise<unknown>>();

  async onModuleDestroy(): Promise<void> { await this.database?.close(); }

  private async storage<T>(operation: () => Promise<T>): Promise<T> {
    try { return await operation(); }
    catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('Armazenamento temporariamente indisponível. Tente novamente.');
    }
  }

  async transaction<T>(id: string, operation: () => Promise<T>): Promise<T> {
    if (this.database) return this.storage(() => this.database!.transaction(operation));
    const previous = this.queues.get(id) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);
    this.queues.set(id, current);
    try { return await current; }
    finally { if (this.queues.get(id) === current) this.queues.delete(id); }
  }

  onModuleInit(): void {
    if (!this.database && this.arquivo && existsSync(this.arquivo)) {
      const dados = JSON.parse(readFileSync(this.arquivo, 'utf8')) as EstadoJogo[];
      dados.forEach((j) => this.jogos.set(j.id, j));
    }
  }

  async find(id: string): Promise<EstadoJogo | undefined> {
    if (this.database) return this.storage(() => this.database!.find(id));
    const jogo = this.jogos.get(id);
    return jogo ? structuredClone(jogo) : undefined;
  }

  async save(estado: EstadoJogo): Promise<void> {
    if (this.database) return this.storage(() => this.database!.save(estado));
    this.jogos.set(estado.id, structuredClone(estado));
    this.persistir();
  }

  async delete(id: string): Promise<boolean> {
    if (this.database) return this.storage(() => this.database!.delete(id));
    const removido = this.jogos.delete(id);
    if (removido) this.persistir();
    return removido;
  }

  private persistir(): void {
    if (!this.arquivo) return;
    mkdirSync(dirname(this.arquivo), { recursive: true });
    writeFileSync(this.arquivo, JSON.stringify([...this.jogos.values()]));
  }
}
