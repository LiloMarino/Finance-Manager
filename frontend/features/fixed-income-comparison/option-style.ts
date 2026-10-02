interface OptionStyle {
  color: string;
  dash: string | undefined;
  shape: "line" | "dashed";
}

const solid: OptionStyle = { color: "var(--foreground)", dash: undefined, shape: "line" };

// Cada opção tem uma linha própria: a cor e o traço juntos a distinguem no gráfico e nos
// cards, sem depender só da cor
const optionStyles: OptionStyle[] = [
  solid,
  { color: "var(--ink-2)", dash: "6 4", shape: "dashed" },
  { color: "var(--ink-3)", dash: "2 3", shape: "dashed" },
  { color: "var(--foreground)", dash: "10 3 2 3", shape: "dashed" },
  { color: "var(--ink-3)", dash: "4 4", shape: "dashed" },
];

/** O estilo da opção pela posição dela. */
export function optionStyle(index: number): OptionStyle {
  return optionStyles[index % optionStyles.length] ?? solid;
}
