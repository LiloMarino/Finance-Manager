import type { ComponentProps } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/shared/components/ui/input-group";

/** Campo de valor em reais. O "R$" fica fora do texto, que é só o número da máscara
de dinheiro ("1.234,56"). */
export function MoneyInput(props: ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>R$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput inputMode="numeric" autoComplete="off" {...props} />
    </InputGroup>
  );
}
