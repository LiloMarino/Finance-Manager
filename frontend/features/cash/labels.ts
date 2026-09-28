import type { CashEntry } from "@/features/cash/use-cash";

export const cashEntryKindLabels: Record<CashEntry["kind"], string> = {
  opening: "Abertura",
  sale: "Venda",
  income: "Provento",
  redemption: "Resgate",
  maturity: "Vencimento",
  deposit: "Aporte de fora",
  purchase: "Compra",
  application: "Aplicação",
  withdrawal: "Saque",
  check: "Conferência",
};

export const cashHint =
  "Dinheiro de investimento esperando ser reinvestido: o que entrou por venda, provento ou vencimento de renda fixa e ainda não voltou para um ativo. Ex.: vender R$ 600 de um FII e comprar R$ 400 de outro deixa R$ 200 no saldo. Não conta na rentabilidade, que mede só o investido; quanto menor, melhor.";
