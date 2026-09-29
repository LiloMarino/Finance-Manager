/** Máscaras de campo: cada uma leva o texto digitado ao texto formatado, no
`onChange`. A máscara só formata; quem lê o valor é o parse do formulário. */

/** Ticker da B3: maiúsculo e sem espaço. */
export function maskTicker(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}
