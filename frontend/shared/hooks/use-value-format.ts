import { usePrivacy } from "@/shared/hooks/use-privacy";
import { type DecimalString, formatBRL, formatQuantity, formatSignedBRL } from "@/types/decimal";

// Os dígitos viram bolinhas e o resto fica: "+R$ 1.234,56" vira "+R$ •••••"
function maskDigits(text: string): string {
  return text.replace(/\d[\d.,]*/g, "•••••");
}

/** As funções de formatar valor que respeitam o modo de ocultar, para eixo,
tooltip e texto montado fora de JSX. */
export function useValueFormat() {
  const { hidden } = usePrivacy();
  return {
    hidden,
    brl: (value: DecimalString) => (hidden ? maskDigits(formatBRL(value)) : formatBRL(value)),
    signedBrl: (value: DecimalString) =>
      hidden ? maskDigits(formatSignedBRL(value)) : formatSignedBRL(value),
    quantity: (value: DecimalString) => (hidden ? "•••" : formatQuantity(value)),
    /** Um número já formatado fora daqui, como o eixo de um gráfico. */
    amount: (text: string) => (hidden ? maskDigits(text) : text),
    /** Texto do backend com valores em reais dentro, como uma pendência. */
    text: (text: string) => (hidden ? text.replace(/R\$\s?\d[\d.,]*/g, "R$ •••••") : text),
  };
}
