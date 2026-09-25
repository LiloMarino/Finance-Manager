export const netHint =
  "Todo valor é o líquido, o que caiu na conta. No JCP e no rendimento de ETF, a corretora já descontou os 15% de IR retido na fonte: R$ 1,00 bruto chega como R$ 0,85.";

export const dividendYieldHint =
  "Dividend yield: quanto o ativo pagou nos últimos 12 meses, por unidade, dividido pelo preço de hoje. Ex.: R$ 6 pagos por um ativo que vale R$ 100 dá 6%. Diz quanto ele rende para quem compra hoje. Compare com o CDI do mesmo período: abaixo dele, o provento sozinho rende menos que a renda fixa.";

export const yieldOnCostHint =
  "Yield on cost: o mesmo valor pago nos últimos 12 meses, dividido pelo preço médio que você pagou. Ex.: R$ 6 sobre um PM de R$ 80 dá 7,5%. Diz quanto o ativo rende sobre o seu dinheiro. Quando o ativo valorizou desde a compra, o yield on cost fica acima do dividend yield.";

export function recentHint(months: number): string {
  return `O total recebido nos últimos ${months} meses, até hoje.`;
}
