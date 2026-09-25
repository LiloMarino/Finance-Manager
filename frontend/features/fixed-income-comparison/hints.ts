export const netValueHint =
  "O que cai na conta no resgate: o valor bruto menos o IR e o IOF.";

export const netAnnualHint =
  "A taxa ao ano que, composta dia útil a dia útil (252 por ano), leva do valor aplicado ao líquido. Ex.: R$ 1.000 que viram R$ 1.120 líquidos em exatamente 1 ano dão 12% a.a. Serve para comparar opções de prazos diferentes: maior é melhor.";

export const cdiEquivalentHint =
  "O quanto um CDB tributado precisaria render, em % do CDI, para entregar o mesmo líquido nas mesmas datas. Ex.: uma LCI isenta de 90% do CDI, num prazo com IR de 15%, empata com um CDB de cerca de 106% do CDI (90 ÷ 0,85); em prazos longos, os juros compostos puxam um pouco para baixo. Acima de 100% é melhor que um CDB de 100% do CDI.";

export const incomeTaxHint =
  "IR regressivo sobre o rendimento, pelo prazo em dias corridos: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima disso. LCI, LCA, CRI, CRA e debênture incentivada são isentas para pessoa física.";

export const iofHint =
  "Resgate em menos de 30 dias paga IOF sobre o rendimento: 96% dele no 1º dia, caindo até 3% no 29º, e nada a partir do 30º. O IR incide sobre o rendimento que sobra depois do IOF.";

export const chartHint =
  "O líquido de cada opção se ela fosse resgatada naquele dia, com o IR e o IOF do prazo até ali. Os degraus são as trocas de faixa do IR. Depois do resgate, a linha fica no valor resgatado.";
