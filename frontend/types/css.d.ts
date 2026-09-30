import "react";

// O valor calculado em render chega ao CSS por uma propriedade customizada no `style`,
// e a classe do Tailwind lê dela, como em `bg-(--swatch)`
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
