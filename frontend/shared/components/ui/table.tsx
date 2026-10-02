import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-table tabular-nums", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border font-semibold [&>tr]:last:border-b-0 [&>tr]:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

// O clique que nasce num controle da linha é dele, não da navegação da linha
const INTERACTIVE =
  "a, button, input, select, textarea, label, [role=menuitem], [role=checkbox], [role=switch]"

const tableRowVariants = cva(
  "transition-colors hover:bg-muted has-aria-expanded:bg-muted data-[state=selected]:bg-muted",
  {
    variants: {
      variant: {
        default: "border-b border-border-subtle",
        // A linha que fecha um bloco, como a referência acima dos anos
        divider: "border-b-2 border-border",
        // O cabeçalho de um grupo de linhas, que não reage ao mouse
        group: "border-b border-border-subtle bg-muted hover:bg-muted",
        // A linha de total, que soma as de cima
        total: "border-t border-border font-semibold hover:bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function TableRow({
  className,
  variant,
  to,
  onClick,
  ...props
}: React.ComponentProps<"tr"> &
  VariantProps<typeof tableRowVariants> & {
    /** Destino do detalhe: a linha inteira leva a ele. O link do nome continua
    existindo para o teclado e para abrir em outra aba. */
    to?: string
  }) {
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event)
    // O evento do React atravessa portais: o clique num dialog aberto pela linha
    // chega aqui sem estar dentro dela no DOM
    const target = event.target
    if (
      to === undefined ||
      event.defaultPrevented ||
      !(target instanceof Element) ||
      !event.currentTarget.contains(target) ||
      target.closest(INTERACTIVE)
    ) {
      return
    }
    if (event.ctrlKey || event.metaKey) window.open(to, "_blank")
    else void navigate(to)
  }

  return (
    <tr
      data-slot="table-row"
      className={cn(
        tableRowVariants({ variant }),
        to !== undefined && "cursor-pointer",
        className
      )}
      onClick={to === undefined ? onClick : handleClick}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-8 px-3 text-left align-middle text-caption font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

const tableCellVariants = cva(
  "h-row px-3 align-middle whitespace-nowrap first:pl-5 last:pr-5 [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      variant: {
        default: "",
        // O texto secundário da linha
        muted: "text-muted-foreground",
        // O número pelo sinal: alta ou baixa
        gain: "text-gain",
        loss: "text-loss",
        // O cabeçalho de um grupo de linhas dentro da tabela
        group: "h-7 bg-muted text-eyebrow text-muted-foreground uppercase",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function TableCell({
  className,
  variant,
  ...props
}: React.ComponentProps<"td"> & VariantProps<typeof tableCellVariants>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(tableCellVariants({ variant }), className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-caption text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
