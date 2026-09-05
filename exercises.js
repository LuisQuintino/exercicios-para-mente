// Catálogo de exercícios. Para adicionar um novo exercício, basta acrescentar
// um novo objeto a este array com um id único e a lista de campos do formulário.
const EXERCISES = [
  {
    id: "registro-pensamentos",
    nome: "Registro de Pensamentos",
    categoria: "TCC",
    descricao:
      "Exercício clássico da Terapia Cognitivo-Comportamental para identificar e reavaliar pensamentos automáticos ligados a uma emoção incômoda.",
    campos: [
      { id: "data", label: "Data", type: "date", required: true },
      { id: "situacao", label: "Situação (o que aconteceu)", type: "textarea", required: true },
      { id: "emocao", label: "Emoção sentida", type: "text", required: true },
      { id: "intensidadeAntes", label: "Intensidade da emoção antes (0-100)", type: "number", min: 0, max: 100 },
      { id: "pensamentoAutomatico", label: "Pensamento automático", type: "textarea", required: true },
      { id: "evidenciasFavor", label: "Evidências a favor do pensamento", type: "textarea" },
      { id: "evidenciasContra", label: "Evidências contra o pensamento", type: "textarea" },
      { id: "pensamentoAlternativo", label: "Pensamento alternativo / equilibrado", type: "textarea" },
      { id: "intensidadeDepois", label: "Intensidade da emoção depois (0-100)", type: "number", min: 0, max: 100 },
      { id: "notas", label: "Notas adicionais", type: "textarea" },
    ],
  },
  {
    id: "associacao-livre",
    nome: "Associação Livre",
    categoria: "Psicanálise",
    descricao:
      "Exercício clássico da psicanálise: registre livremente o que vier à mente a partir de uma palavra, imagem ou sonho, sem filtrar ou julgar o conteúdo.",
    campos: [
      { id: "data", label: "Data", type: "date", required: true },
      { id: "disparador", label: "Palavra, imagem ou sonho de partida", type: "text", required: true },
      { id: "fluxo", label: "Fluxo de associações (escreva sem se censurar)", type: "textarea", required: true },
      { id: "temasRecorrentes", label: "Temas ou repetições que percebeu", type: "textarea" },
      { id: "notas", label: "Notas adicionais", type: "textarea" },
    ],
  },
];
