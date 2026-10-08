import { api } from './client';
import type {
  Classe,
  ConfigClasse,
  Equipamento,
  Atividade,
  Evento,
  EstadoJogo,
  RespostaTick,
  SecaoCentralMatematica,
} from '../types/jogo';

export const gameApi = {
  criar: (classe: Classe, nome: string) =>
    api.post<EstadoJogo>('/games', { classe, nome: nome.trim() || undefined }),

  obter: (id: string) => api.get<EstadoJogo>(`/games/${id}`),

  remover: (id: string) => api.delete<void>(`/games/${id}`),

  tick: (id: string) => api.post<RespostaTick>(`/games/${id}/tick`),

  iniciarAtividade: (id: string, atividadeId: string) =>
    api.post<EstadoJogo>(`/games/${id}/atividades/${atividadeId}/iniciar`),

  pararAtividade: (id: string) => api.post<EstadoJogo>(`/games/${id}/atividades/parar`),

  equipar: (id: string, equipamentoId: string) =>
    api.post<EstadoJogo>(`/games/${id}/equipamentos`, { equipamentoId }),

  eventos: (id: string) => api.get<Evento[]>(`/games/${id}/eventos`),

  centralMatematica: (id: string) =>
    api.get<SecaoCentralMatematica[]>(`/games/${id}/central-matematica`),

  catalogoClasses: () => api.get<ConfigClasse[]>('/catalogo/classes'),

  catalogoEquipamentos: (classe: Classe) =>
    api.get<Equipamento[]>(`/catalogo/equipamentos?classe=${classe}`),

  catalogoAtividades: () => api.get<Atividade[]>('/catalogo/atividades'),
};
