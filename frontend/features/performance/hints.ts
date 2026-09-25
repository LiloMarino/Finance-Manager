export const quotaHint =
  "Quanto a carteira rendeu sem contar o dinheiro que você colocou ou tirou, como a cota de um fundo. Ex.: a carteira valia R$ 1.000, você aportou R$ 500 e ela fechou o dia em R$ 1.530: o dia rendeu +2%, e não +53%. Por enquanto conta só a variação de preço; os proventos ainda não entram.";

export const periodHint =
  "A rentabilidade no período escolhido abaixo, a partir do fechamento da véspera do primeiro dia dele.";

export function recentHint(months: number): string {
  return `A rentabilidade dos últimos ${months} meses, até hoje. Fica vazia quando a carteira tem menos de ${months} meses.`;
}
