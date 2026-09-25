import type { MonthlyTax } from "@/features/tax/use-tax";
import type { badgeVariants } from "@/shared/components/ui/badge";
import { formatDate } from "@/shared/lib/format";
import { formatBRL } from "@/types/decimal";
import type { components } from "@/types/openapi.generated";
import type { VariantProps } from "class-variance-authority";

type LossPool = components["schemas"]["LossPool"];
type TradeType = components["schemas"]["TradeType"];
type DarfStatus = components["schemas"]["DarfStatus"];
type IncomeForm = components["schemas"]["IncomeForm"];
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const lossPoolLabels: Record<LossPool, string> = {
  common: "Operações comuns",
  day_trade: "Day trade",
  fii: "FII",
};

export const incomeFormLabels: Record<IncomeForm, string> = {
  exempt: "Rendimentos Isentos e Não Tributáveis",
  exclusive: "Rendimentos Sujeitos à Tributação Exclusiva/Definitiva",
};

// O nome da linha da ficha em que cada código entra
export const incomeCodeLabels: Record<string, string> = {
  "09": "Lucros e dividendos recebidos",
  "26": "Rendimentos de fundos imobiliários",
  "10": "Juros sobre capital próprio",
  "06": "Rendimentos de aplicações financeiras",
  "12": "Outros",
};

export const tradeTypeLabels: Record<TradeType, string> = {
  swing: "Comum",
  day_trade: "Day trade",
};

export const darfStatusLabels: Record<DarfStatus, string> = {
  paid: "DARF pago",
  due: "DARF a pagar",
  overdue: "DARF vencido",
  carried: "Acumulando",
  exempt: "Isento",
  compensated: "Compensado",
  none: "Sem imposto",
};

export const darfStatusVariants: Record<DarfStatus, BadgeVariant> = {
  paid: "secondary",
  due: "default",
  overdue: "destructive",
  carried: "outline",
  exempt: "outline",
  compensated: "outline",
  none: "outline",
};

/** O porquê do status, numa frase. */
export function describeStatus(month: MonthlyTax): string {
  switch (month.status) {
    case "paid":
      return month.payment
        ? `Pago em ${formatDate(month.payment.paid_on)}: ${formatBRL(month.payment.amount)}.`
        : "Pago.";
    case "due":
    case "overdue":
      return month.darf_amount && month.due_date
        ? `DARF de ${formatBRL(month.darf_amount)}, código 6015, com vencimento em ${formatDate(month.due_date)}.`
        : "DARF a pagar.";
    case "carried":
      return `O imposto não chega a R$ 10,00: ${formatBRL(month.carried_after)} somam ao DARF do mês seguinte.`;
    case "exempt":
      return `Vendas de ações até R$ 20 mil no mês: ${formatBRL(month.exempt_profit)} de lucro isento.`;
    case "compensated":
      return `O prejuízo acumulado absorveu ${formatBRL(month.compensated)} de lucro.`;
    case "none":
      return "Nenhum lucro tributável no mês.";
  }
}

/** "Setembro de 2026" */
export function formatMonth(year: number, month: number): string {
  const text = new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
