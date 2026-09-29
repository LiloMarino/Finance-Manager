import type { UseFormRegisterReturn } from "react-hook-form";

/** Máscaras de campo: cada uma leva o texto digitado ao texto formatado, no
`onChange`. A máscara só formata; quem lê o valor é o `parseDecimalInput`, que lê o
ponto como milhar e a vírgula como decimal. */

export type Mask = (value: string) => string;

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Um ponto digitado no fim, sem vírgula ainda, é a vírgula decimal: os pontos de
// milhar que a máscara escreve nunca ficam no fim
function commaFromTrailingDot(value: string): string {
  return !value.includes(",") && value.endsWith(".") ? `${value.slice(0, -1)},` : value;
}

// A parte inteira e as decimais, só com dígitos e a primeira vírgula
function splitNumber(value: string): [string, string | null] {
  const [integer = "", ...decimals] = commaFromTrailingDot(value)
    .replace(/[^\d,]/g, "")
    .split(",");
  return [integer.replace(/^0+(?=\d)/, ""), decimals.length > 0 ? decimals.join("") : null];
}

/** Dinheiro digitado em centavos, da direita para a esquerda: "123456" vira
"1.234,56". */
export function maskMoney(value: string): string {
  const digits = onlyDigits(value).replace(/^0+/, "");
  if (!digits) return "";
  const cents = digits.padStart(3, "0");
  return `${groupThousands(cents.slice(0, -2))},${cents.slice(-2)}`;
}

/** Número com milhar e as casas decimais que vierem: "1234,567" vira "1.234,567". */
export function maskDecimal(value: string): string {
  const [integer, decimals] = splitNumber(value);
  const grouped = groupThousands(integer);
  return decimals === null ? grouped : `${grouped},${decimals}`;
}

/** Inteiro com milhar: "12345" vira "12.345". */
export function maskInteger(value: string): string {
  return groupThousands(onlyDigits(value).replace(/^0+(?=\d)/, ""));
}

/** Percentual com vírgula e sem milhar: "12.5" vira "12,5". */
export function maskPercent(value: string): string {
  const [integer, decimals] = splitNumber(value);
  return decimals === null ? integer : `${integer},${decimals}`;
}

/** Como o `maskPercent`, aceitando o menos à frente: o spread da Selic e o IPCA. */
export function maskSignedPercent(value: string): string {
  const negative = value.trimStart().startsWith("-");
  return `${negative ? "-" : ""}${maskPercent(value)}`;
}

/** CNPJ com a pontuação, até os 14 dígitos: `XX.XXX.XXX/XXXX-XX`. */
export function maskCnpj(value: string): string {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

/** Ticker da B3: maiúsculo e sem espaço. */
export function maskTicker(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** O campo registrado no react-hook-form, com a máscara aplicada antes de o
formulário ler o valor. */
export function withMask<TName extends string>(
  field: UseFormRegisterReturn<TName>,
  mask: Mask,
): UseFormRegisterReturn<TName> {
  return {
    ...field,
    onChange: (event) => {
      const { target }: { target: unknown } = event;
      if (target instanceof HTMLInputElement) target.value = mask(target.value);
      return field.onChange(event);
    },
  };
}
