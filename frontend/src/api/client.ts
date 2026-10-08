const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export class ErroApi extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ErroApi';
  }
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ErroApi('Não foi possível conectar ao backend. Verifique se ele está rodando.', 0);
  }

  if (!resposta.ok) {
    let mensagem = `Erro ${resposta.status} ao chamar a API`;
    try {
      const corpo = await resposta.json();
      if (typeof corpo.message === 'string') mensagem = corpo.message;
      else if (Array.isArray(corpo.message)) mensagem = corpo.message.join(', ');
    } catch {
      // corpo sem JSON (ex.: 204) — mantém a mensagem padrão
    }
    throw new ErroApi(mensagem, resposta.status);
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

export const api = {
  get: <T>(caminho: string) => requisitar<T>(caminho),
  post: <T>(caminho: string, corpo?: unknown) =>
    requisitar<T>(caminho, { method: 'POST', body: corpo ? JSON.stringify(corpo) : undefined }),
  delete: <T>(caminho: string) => requisitar<T>(caminho, { method: 'DELETE' }),
};
