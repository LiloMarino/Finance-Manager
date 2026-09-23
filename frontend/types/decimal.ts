declare const decimalBrand: unique symbol;

/**
 * Decimal atravessa a API como string, nunca como número JSON.
 *
 * O brand é o que torna o erro barulhento: `Number(valor)`, `valor * 2` e passar
 * uma string comum onde se espera um Decimal param de compilar. A conversão só
 * acontece pelas funções deste módulo.
 */
// `${number}` (e não `string`) é o que deixa o valor entrar direto no Intl,
// cujo overload aceita StringNumericLiteral — sem cast e sem passar por float.
export type DecimalString = `${number}` & { readonly [decimalBrand]: true };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Resultado leva o sinal: "+R$ 10,00", "-5,00%"
const signedCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  signDisplay: "exceptZero",
});

const signedPercentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 8,
});

// O Intl aceita string desde o ES2023 justamente para não passar por float: a
// dízima de 28 dígitos de um preço médio chega inteira até aqui.
export function formatBRL(value: DecimalString): string {
  return currencyFormatter.format(value);
}

/** Fração (0,5) como percentual (50,00%). */
export function formatPercent(value: DecimalString): string {
  return percentFormatter.format(value);
}

export function formatSignedBRL(value: DecimalString): string {
  return signedCurrencyFormatter.format(value);
}

export function formatSignedPercent(value: DecimalString): string {
  return signedPercentFormatter.format(value);
}

/** Número para geometria de gráfico, onde a precisão acaba no pixel. */
export function toChartNumber(value: DecimalString): number {
  return Number(value);
}

export function formatQuantity(value: DecimalString): string {
  return quantityFormatter.format(value);
}

/** Zero em qualquer escala: "0", "0.00", "-0". */
export function isZero(value: DecimalString): boolean {
  return /^-?0*(\.0*)?$/.test(value);
}

/** Única porta de entrada: use ao criar um Decimal no front (formulário, teste). */
export function toDecimalString(value: string): DecimalString {
  return value as DecimalString;
}

const DECIMAL_INPUT = /^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+([.,]\d+)?$/;

/**
 * Texto digitado em pt-BR ("1.234,56") ou com ponto ("1234.56") para Decimal; `null`
 * quando não é número positivo bem formado.
 */
export function parseDecimalInput(value: string): DecimalString | null {
  const text = value.trim();
  if (!DECIMAL_INPUT.test(text)) {
    return null;
  }
  const normalized = text.includes(",")
    ? text.replaceAll(".", "").replace(",", ".")
    : text;
  return toDecimalString(normalized);
}
