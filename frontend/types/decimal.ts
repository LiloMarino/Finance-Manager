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

const rateFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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

/** Fração (0,062) como pontos percentuais (6,20 p.p.): a diferença entre dois
percentuais, que o Intl formata como percentual e aqui ganha a unidade certa. */
export function formatPoints(value: DecimalString): string {
  return `${percentFormatter.format(value).replace(/\s?%/, "")} p.p.`;
}

export function formatSignedPoints(value: DecimalString): string {
  return `${signedPercentFormatter.format(value).replace(/\s?%/, "")} p.p.`;
}

/** O sinal lido da string: o backend manda ponto fixo, sem expoente. */
export function decimalSign(value: DecimalString): -1 | 0 | 1 {
  if (!/[1-9]/.test(value)) return 0;
  return value.startsWith("-") ? -1 : 1;
}

/** O módulo: o mesmo valor sem o sinal de menos. */
export function decimalAbs(value: DecimalString): DecimalString {
  return value.startsWith("-") ? toDecimalString(value.slice(1)) : value;
}

/** Número para geometria de gráfico, onde a precisão acaba no pixel. */
export function toChartNumber(value: DecimalString): number {
  return Number(value);
}

export function formatQuantity(value: DecimalString): string {
  return quantityFormatter.format(value);
}

/** Taxa já em % (110 é 110%), em duas casas: "110,00". */
export function formatRate(value: DecimalString): string {
  return rateFormatter.format(value);
}

/** Zero em qualquer escala: "0", "0.00", "-0". */
export function isZero(value: DecimalString): boolean {
  return /^-?0*(\.0*)?$/.test(value);
}

/** Única porta de entrada: use ao criar um Decimal no front (formulário, teste). */
export function toDecimalString(value: string): DecimalString {
  return value as DecimalString;
}

// Como as máscaras escrevem: o ponto é sempre separador de milhar, e a vírgula, a
// decimal
const DECIMAL_INPUT = /^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/;
// Como a API e a URL escrevem: ponto decimal, sem milhar
const DECIMAL_TEXT = /^\d+(\.\d+)?$/;

const moneyInputFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// O sinal de menos à frente, com a mesma leitura para o resto
function allowingSign(
  parse: (value: string) => DecimalString | null,
): (value: string) => DecimalString | null {
  return (value) => {
    const text = value.trim();
    if (!text.startsWith("-")) {
      return parse(text);
    }
    const magnitude = parse(text.slice(1));
    return magnitude && toDecimalString(`-${magnitude}`);
  };
}

/**
 * Texto digitado em pt-BR ("1.234,56", "1234,56", "1.234") para Decimal; `null`
 * quando não é número positivo bem formado.
 */
export function parseDecimalInput(value: string): DecimalString | null {
  const text = value.trim();
  if (!DECIMAL_INPUT.test(text)) {
    return null;
  }
  return toDecimalString(text.replaceAll(".", "").replace(",", "."));
}

/** Como o `parseDecimalInput`, aceitando também o sinal de menos. */
export const parseSignedDecimalInput = allowingSign(parseDecimalInput);

/** O Decimal escrito como a API e a URL escrevem ("1234.56"); `null` quando não é
número positivo bem formado. */
export function parseDecimalText(value: string): DecimalString | null {
  const text = value.trim();
  return DECIMAL_TEXT.test(text) ? toDecimalString(text) : null;
}

/** Como o `parseDecimalText`, aceitando também o sinal de menos. */
export const parseSignedDecimalText = allowingSign(parseDecimalText);

/** O texto que preenche um campo: vírgula decimal, sem separador de milhar, que o
`parseDecimalInput` lê de volta como o mesmo valor. */
export function toDecimalInput(value: DecimalString): string {
  return value.replace(".", ",");
}

/** O valor em reais que preenche um campo de dinheiro: duas casas e o milhar
("1.234,50"), como a máscara de dinheiro escreve. */
export function toMoneyInput(value: DecimalString): string {
  return moneyInputFormatter.format(value);
}
