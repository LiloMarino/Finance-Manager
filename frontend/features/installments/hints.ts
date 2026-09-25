export const installmentsLeftoverHint =
  "No parcelado, o valor inteiro fica aplicado e cada parcela sai do investimento no dia dela, já com o IR e o IOF do resgate pagos. A sobra é o que fica aplicado depois da última parcela, líquido. Ex.: R$ 1.000 em 10x num CDB de 100% do CDI, com o CDI a 14% a.a., deixam cerca de R$ 52.";

export const cashLeftoverHint =
  "À vista, o desconto é o ganho: ele fica no mesmo investimento até a última parcela, e a sobra é o líquido dele nesse dia. Ex.: 5% de R$ 1.000 são R$ 50 aplicados, que viram cerca de R$ 55 em 10 meses.";

export const breakEvenDiscountHint =
  "O desconto à vista que deixa os dois caminhos iguais: com desconto maior, pague à vista; menor, parcele. É a resposta para \"quanto de desconto eu devo pedir\". Ex.: empate em 4,8% quer dizer que 5% de desconto já compensa pagar à vista, e 4% não.";

export const breakEvenRatesHint =
  "Quanto um investimento precisaria render para o parcelado empatar com o desconto informado. Achando um investimento acima dessa taxa, parcelar vence; abaixo, o à vista vence. A LCA é isenta de IR, por isso empata com uma taxa menor que a do CDB.";

export const balanceHint =
  "Quanto cada caminho teria se tudo fosse resgatado naquele dia, líquido de IR e IOF. No parcelado, o saldo cai a cada parcela; à vista, o desconto aplicado cresce. Quem termina mais alto vence.";

export const curveHint =
  "O desconto à vista que empata com o parcelado, para cada número de parcelas, com o mesmo valor e o mesmo investimento. Quanto mais parcelas, mais tempo o dinheiro rende, e maior o desconto que o à vista precisa dar. Acima da curva, o à vista vence; abaixo, o parcelado.";

export const scheduleHint =
  "Cada parcela sai do investimento no último dia útil até o vencimento. O resgate bruto é o que precisa sair para sobrar a parcela depois do IR e, nos primeiros 30 dias da aplicação, do IOF.";
