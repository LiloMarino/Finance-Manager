import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
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
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
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
  "transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
  {
    variants: {
      variant: {
        default: "border-b",
        // A linha que fecha um bloco, como a referência acima dos anos
        divider: "border-b-2",
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
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

const tableCellVariants = cva(
  "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
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
        group: "bg-muted/40 text-xs font-semibold text-muted-foreground uppercase",
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
      className={cn("mt-4 text-sm text-muted-foreground", className)}
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
