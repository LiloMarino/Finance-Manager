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

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 8,
});

// O Intl aceita string desde o ES2023 justamente para não passar por float: a
// dízima de 28 dígitos de um preço médio chega inteira até aqui.
export function formatBRL(value: DecimalString): string {
  return currencyFormatter.format(value);
}

export function formatQuantity(value: DecimalString): string {
  return quantityFormatter.format(value);
}

/** Única porta de entrada: use ao criar um Decimal no front (formulário, teste). */
export function toDecimalString(value: string): DecimalString {
  return value as DecimalString;
}
