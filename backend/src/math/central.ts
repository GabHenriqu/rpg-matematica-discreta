import { PESOS_RARIDADE_EXPLORAR } from '../domain/constantes';
import { Classe, EstadoJogo, SecaoCentralMatematica } from '../domain/tipos';
import { resumoCombinatoria } from './combinatoria';
import { atributosDaClasse, intersecao, uniao } from './conjuntos';
import { calcularProducao } from './producao';
import { probabilidadeAoMenosUmEvento } from './probabilidade';
import { equipamentosCompativeis } from './relacoes';
import { xpNecessario, xpNecessarioRecursivo } from './xp';

/** Monta as 6 seções da Central Matemática: fórmula + resultado ao vivo. */
export function montarCentralMatematica(estado: EstadoJogo): SecaoCentralMatematica[] {
  const { personagem } = estado;
  const ativa = estado.atividades.find((a) => a.ativa) ?? null;
  const taxa = ativa?.taxaPorSegundo ?? 0;
  const combinatoria = resumoCombinatoria();
  const atributosClasse = atributosDaClasse(personagem.classe);
  const outras = Object.values(Classe).filter((c) => c !== personagem.classe);
  const TICKS_EXEMPLO = 10;

  return [
    {
      id: 'funcoes',
      titulo: 'Funções',
      formula: 'produção(t) = taxa × t',
      explicacao: 'A produção é proporcional ao tempo: multiplique a taxa da atividade pelo intervalo considerado.',
      entrada: { atividade: ativa?.nome ?? null, recurso: ativa?.recurso ?? null, taxaPorSegundo: taxa, segundos: 1 },
      resultado: calcularProducao(taxa, 1),
    },
    {
      id: 'inducao',
      titulo: 'Progressão de XP e indução',
      formula: 'XP(1) = 100; XP(n + 1) = XP(n) + 50·n; XP(n) = 100 + 25·n·(n − 1)',
      explicacao: [
        'Proposição: para todo inteiro n ≥ 1, XP(n) = 100 + 25·n·(n − 1).',
        'Caso base (n = 1): a recorrência dá XP(1) = 100; a fórmula fechada também dá 100 + 25·1·(1 − 1) = 100.',
        'Hipótese indutiva: seja k ≥ 1 e suponha XP(k) = 100 + 25·k·(k − 1).',
        'Passo indutivo: pela recorrência, XP(k + 1) = XP(k) + 50·k.',
        'Substituindo a hipótese, XP(k + 1) = 100 + 25·k·(k − 1) + 50·k = 100 + 25·k·(k + 1).',
        'Como k·(k + 1) = (k + 1)·((k + 1) − 1), obtemos XP(k + 1) = 100 + 25·(k + 1)·((k + 1) − 1).',
        'Logo, a fórmula vale para k + 1 e, pelo princípio da indução, para todo inteiro n ≥ 1.',
      ].join('\n'),
      entrada: { nivel: personagem.nivel },
      resultado: {
        recursiva: xpNecessarioRecursivo(personagem.nivel),
        formaFechada: xpNecessario(personagem.nivel),
        xpProximoNivel: xpNecessario(personagem.nivel + 1),
      },
    },
    {
      id: 'conjuntos',
      titulo: 'Conjuntos',
      formula: 'Atributos(classe) = { a | a pertence à classe }',
      explicacao: 'A união reúne atributos presentes em pelo menos uma classe; a interseção reúne os atributos comuns a todas as classes.',
      entrada: { classe: personagem.classe },
      resultado: {
        atributos: atributosClasse,
        uniaoComOutrasClasses: outras.reduce(
          (acc, c) => uniao(acc, atributosDaClasse(c)),
          atributosClasse,
        ),
        intersecaoComOutrasClasses: outras.reduce(
          (acc, c) => intersecao(acc, atributosDaClasse(c)),
          atributosClasse,
        ),
      },
    },
    {
      id: 'relacoes',
      titulo: 'Relações',
      formula: 'R ⊆ Classe × Equipamento;  compatíveis(c) = { e | (c, e) ∈ R }',
      explicacao: 'Um par (classe, equipamento) pertence à relação quando aquela classe pode usar aquele equipamento.',
      entrada: { classe: personagem.classe },
      resultado: equipamentosCompativeis(personagem.classe).map((e) => e.nome),
    },
    {
      id: 'combinatoria',
      titulo: 'Combinatória',
      formula: '|Classes| × |Armas| × |Armaduras|',
      explicacao: 'O total bruto considera todas as escolhas. O total compatível conta apenas combinações em que arma e armadura podem ser usadas pela classe.',
      entrada: {
        classes: combinatoria.classes,
        armas: combinatoria.armas,
        armaduras: combinatoria.armaduras,
      },
      resultado: {
        totalBruto: combinatoria.totalBruto,
        totalCompativel: combinatoria.totalCompativel,
      },
    },
    {
      id: 'probabilidade',
      titulo: 'Probabilidade',
      formula: 'P(comum)=70%, P(raro)=25%, P(lendário)=5%;  P(≥1 raro/lendário em n) = 1 − 0,7ⁿ',
      explicacao: 'Exemplo teórico com 10 tentativas independentes e a mesma distribuição em cada tentativa. Pelo complemento, subtraímos de 1 a chance de obter apenas resultados comuns: 1 − (0,70)¹⁰. A probabilidade não determina o resultado de uma tentativa específica.',
      entrada: {
        pesos: PESOS_RARIDADE_EXPLORAR.map((p) => ({ raridade: p.raridade, peso: p.peso })),
        n: TICKS_EXEMPLO,
      },
      resultado: probabilidadeAoMenosUmEvento(TICKS_EXEMPLO),
    },
  ];
}
