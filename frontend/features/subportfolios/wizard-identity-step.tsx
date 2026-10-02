import { SubportfolioMark } from "@/shared/components/subportfolio-mark";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  type SubportfolioColor,
  type SubportfolioIcon,
  subportfolioColors,
  subportfolioIcons,
} from "@/shared/lib/subportfolio-identity";
import { cn } from "@/shared/lib/utils";

export interface Identity {
  name: string;
  icon: SubportfolioIcon;
  color: SubportfolioColor;
}

interface IdentityStepProps {
  identity: Identity;
  onChange: (identity: Identity) => void;
}

// As grades de ícone e cor são listas de uma escolha só
const icons = Object.entries(subportfolioIcons) as [
  SubportfolioIcon,
  (typeof subportfolioIcons)[SubportfolioIcon],
][];
const colors = Object.entries(subportfolioColors) as [
  SubportfolioColor,
  (typeof subportfolioColors)[SubportfolioColor],
][];

/** Passo 1: o nome, o ícone e a cor, com a prévia do quadrado que vai para a sidebar. */
export function IdentityStep({ identity, onChange }: IdentityStepProps) {
  const accent = subportfolioColors[identity.color].color;

  return (
    <div className="flex flex-col gap-5">
      {/* Prévia e nome */}
      <div className="flex items-end gap-4">
        <SubportfolioMark identity={identity} size="lg" />
        <Field className="flex-1">
          <FieldLabel htmlFor="subportfolio-name">Nome</FieldLabel>
          <Input
            id="subportfolio-name"
            value={identity.name}
            placeholder="Aposentadoria, Reserva, Exterior..."
            onChange={(event) => onChange({ ...identity, name: event.target.value })}
          />
        </Field>
      </div>

      {/* Ícones */}
      <Field>
        <FieldLabel>Ícone</FieldLabel>
        <div role="radiogroup" aria-label="Ícone" className="grid grid-cols-8 gap-1.5">
          {icons.map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={identity.icon === key}
              aria-label={label}
              title={label}
              className={cn(
                "grid h-9 place-items-center rounded-md border [&_svg]:size-4",
                identity.icon === key
                  ? "border-transparent bg-(--accent) text-white"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
              style={{ "--accent": accent }}
              onClick={() => onChange({ ...identity, icon: key })}
            >
              <Icon />
            </button>
          ))}
        </div>
      </Field>

      {/* Cores */}
      <Field>
        <FieldLabel>Cor</FieldLabel>
        <div role="radiogroup" aria-label="Cor" className="grid grid-cols-12 gap-1.5">
          {colors.map(([key, { label, color }]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={identity.color === key}
              aria-label={label}
              title={label}
              className={cn(
                "h-7 rounded-full bg-(--swatch)",
                identity.color === key &&
                  "ring-foreground ring-2 ring-offset-2 ring-offset-popover",
              )}
              style={{ "--swatch": color }}
              onClick={() => onChange({ ...identity, color: key })}
            />
          ))}
        </div>
        <FieldDescription>
          O ícone e a cor aparecem no topo da sidebar quando você troca para esta subcarteira, e na
          divisão da carteira entre as subcarteiras.
        </FieldDescription>
      </Field>
    </div>
  );
}
