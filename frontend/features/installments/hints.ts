export const installmentsLeftoverHint =
  "No parcelado, o valor inteiro fica aplicado e cada parcela sai do investimento no dia dela, já com o IR e o IOF do resgate pagos. A sobra é o que fica aplicado depois da última parcela, líquido. Ex.: R$ 1.000 em 10x num CDB de 100% do CDI, com o CDI a 14% a.a., deixam cerca de R$ 52.";

export const cashLeftoverHint =
  "À vista, o desconto é o ganho: ele fica no mesmo investimento até a última parcela, e a sobra é o líquido dele nesse dia. Ex.: 5% de R$ 1.000 são R$ 50 aplicados, que viram cerca de R$ 55 em 10 meses.";

export const breakEvenDiscountHint =
  'O desconto à vista que deixa os dois caminhos iguais: com desconto maior, pague à vista; menor, parcele. É a resposta para "quanto de desconto eu devo pedir". Ex.: empate em 4,8% quer dizer que 5% de desconto já compensa pagar à vista, e 4% não.';

export const breakEvenRatesHint =
  "Quanto um investimento precisaria render para o parcelado empatar com o desconto informado. Achando um investimento acima dessa taxa, parcelar vence; abaixo, o à vista vence. A LCA é isenta de IR, por isso empata com uma taxa menor que a do CDB.";

export const curveHint =
  "O desconto à vista que empata com o parcelado, para cada número de parcelas, com o mesmo valor e o mesmo investimento. Quanto mais parcelas, mais tempo o dinheiro rende, e maior o desconto que o à vista precisa dar. Acima da curva, o à vista vence; abaixo, o parcelado.";

export const scheduleHint =
  "Cada parcela sai do investimento no último dia útil até o vencimento. O resgate bruto é o que precisa sair para sobrar a parcela depois do IR e, nos primeiros 30 dias da aplicação, do IOF. Fica aplicado é o líquido do que sobra depois dela, se tudo fosse resgatado no dia.";

export const bankRateHint =
  "Quanto o banco desconta por mês de antecedência, composto, contando as faturas entre a atual e a da parcela. Ex.: a 1,6% ao mês, uma parcela de R$ 200 que cai 3 faturas depois da atual sai por 200 ÷ 1,016³ = R$ 190,70.";

export const cashBreakEvenHint =
  "O desconto à vista que deixa os dois caminhos com o mesmo preço: 1 menos o total pago adiantando dividido pelo preço cheio. Ex.: R$ 2.400 em 12x, adiantadas com o banco a 1,6% ao mês, saem por R$ 2.202,67, e o empate é 8,22%: à vista com 10% de desconto vence, com 5% não.";

export const bankTotalHint =
  "Digite a soma que o app do banco pede hoje para adiantar todas as parcelas, menos a da fatura atual. O app acha a taxa ao mês que chega exatamente a esse valor e usa ela em cada parcela.";

export const bankDiscountHint =
  "A soma das parcelas marcadas menos o que você paga hoje por elas. Marcando todas, é o desconto que o app do banco mostra para adiantar tudo.";

export const earningsHint =
  "O que o dinheiro das parcelas marcadas renderia, já sem IR e IOF, se ficasse aplicado até o vencimento de cada uma: a parcela menos o quanto precisaria estar aplicado hoje para virar ela no dia. Ex.: uma parcela de R$ 200 que vence em 6 meses, num CDB de 100% do CDI a 14% a.a., precisa de uns R$ 190 aplicados hoje: rendimento de uns R$ 10.";
