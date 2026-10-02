import { useValueFormat } from "@/shared/hooks/use-value-format";
import type { DecimalString } from "@/types/decimal";

/** Valor em reais; com `signed`, leva o sinal. Oculto, vira "R$ •••••". */
export function Money({ value, signed = false }: { value: DecimalString; signed?: boolean }) {
  const format = useValueFormat();
  return <>{signed ? format.signedBrl(value) : format.brl(value)}</>;
}

/** Quantidade de cotas ou ações. Oculta, vira "•••". */
export function Quantity({ value }: { value: DecimalString }) {
  const format = useValueFormat();
  return <>{format.quantity(value)}</>;
}
