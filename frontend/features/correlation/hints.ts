export const correlationHint =
  "O quanto os dois sobem e caem nos mesmos dias, de −1 a 1, medido pelos retornos diários. Perto de 1, andam juntos, e um não diversifica o outro (ex.: dois bancos grandes costumam passar de 0,7). Perto de 0, não há relação. Negativa, quando um sobe o outro tende a cair. Para diversificar, quer-se correlação baixa: abaixo de uns 0,3 já ajuda.";

export const returnsHint =
  "Quantos dias entraram na conta: os pregões em que os dois têm fechamento. Com poucos dias, a correlação oscila muito ao acaso; acima de uns 120 (meio ano) ela fica mais confiável.";

export const normalizedHint =
  "As duas séries partindo de 100 no primeiro pregão em comum. Ex.: 120 é 20% acima do início. O gráfico mostra o caminho de cada um, e não a correlação: dois ativos podem terminar no mesmo lugar por caminhos que não andam juntos.";

export function rollingHint(window: number): string {
  return `A mesma correlação recalculada a cada dia, só com os ${window} pregões anteriores. Mostra se a relação mudou com o tempo: se a linha passeia de 0,2 a 0,8, a correlação do período inteiro é a média de fases bem diferentes.`;
}

/** A leitura da correlação em palavras. */
export function describeCorrelation(value: number): string {
  if (value >= 0.7) return "Andam muito juntos: um quase não diversifica o outro.";
  if (value >= 0.3) return "Andam parcialmente juntos: diversificam um pouco.";
  if (value > -0.3) return "Quase sem relação: diversificam bem.";
  if (value > -0.7) return "Tendem a ir em sentidos opostos.";
  return "Andam em sentidos opostos: quando um sobe, o outro costuma cair.";
}

export const matrixHint =
  "Cada célula é a correlação entre o ativo da linha e o da coluna, a mesma dos dois lados da diagonal. Verde forte é perto de +1 (andam juntos), neutro é perto de 0 (sem relação) e vermelho forte é perto de −1 (sentidos opostos). Clique numa célula para ver o par embaixo.";
