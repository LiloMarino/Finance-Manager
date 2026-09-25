export function growthHint(months: number): string {
  return `Quanto o patrimônio mudou nos últimos ${months} meses, contando o dinheiro que você aportou ou resgatou. Ex.: de R$ 10.000 para R$ 12.000 com R$ 1.500 de aporte é +R$ 2.000 (+20%), mas só R$ 500 foram ganho. Para o quanto a carteira rendeu, veja a Rentabilidade. Fica vazio quando a carteira tem menos de ${months} meses.`;
}

export const compositionHint =
  "Aplicado é o que você colocou menos o que tirou; ganho é o patrimônio menos o aplicado. O ganho junta o resultado das vendas e o do que ainda está na carteira. Os proventos recebidos não entram no ganho, porque saem da carteira; eles entram na rentabilidade. Num dia de perda, a linha tracejada mostra o aplicado acima do patrimônio.";
