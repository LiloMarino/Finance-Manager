import { PieChart } from "lucide-react";

import {
  type SubportfolioColor,
  type SubportfolioIcon,
  subportfolioColors,
  subportfolioIcons,
} from "@/shared/lib/subportfolio-identity";
import { cn } from "@/shared/lib/utils";

interface SubportfolioMarkProps {
  /** Sem identidade, é a marca da carteira geral. */
  identity?: { icon: SubportfolioIcon; color: SubportfolioColor };
  size?: "sm" | "md" | "lg";
}

/** O quadrado com o ícone da subcarteira na cor dela; o ícone fica branco nos dois
temas. */
export function SubportfolioMark({ identity, size = "md" }: SubportfolioMarkProps) {
  const Icon = identity ? subportfolioIcons[identity.icon].icon : PieChart;
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        identity ? "bg-(--mark) text-white" : "bg-primary text-primary-foreground",
        size === "sm" && "size-5 rounded-sm [&_svg]:size-3",
        size === "md" && "size-7 rounded-md [&_svg]:size-4",
        size === "lg" && "size-14 rounded-xl [&_svg]:size-7",
      )}
      style={identity ? { "--mark": subportfolioColors[identity.color].color } : undefined}
    >
      <Icon />
    </span>
  );
}
