import type { ComponentProps } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/shared/components/ui/input-group";

interface UnitInputProps extends ComponentProps<typeof InputGroupInput> {
  /** A unidade depois do número: "%", "% ao mês", "% do CDI". */
  unit: string;
}

/** Campo de número com a unidade fora do texto, à direita. */
export function UnitInput({ unit, ...props }: UnitInputProps) {
  return (
    <InputGroup>
      <InputGroupInput inputMode="decimal" autoComplete="off" className="text-right" {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{unit}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
