import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import {
  formatMonth,
  incomeCodeLabels,
  incomeFormLabels,
  lossPoolLabels,
} from "@/features/tax/labels";
import type { IrpfReport as IrpfReportData } from "@/features/tax/use-tax";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { formatDate } from "@/shared/lib/format";
import { incomeTypeLabels } from "@/shared/lib/labels";
import { formatBRL, formatSignedBRL } from "@/types/decimal";

type IncomeItem = IrpfReportData["income"][number];

function CnpjCell({ item }: { item: { asset_id: number; cnpj: string | null } }) {
  return (
    <TableCell className="tabular-nums">
      {item.cnpj ?? (
        <Link to={`/assets/${item.asset_id}`}>
          <Badge variant="destructive">sem CNPJ</Badge>
        </Link>
      )}
    </TableCell>
  );
}

function IncomeTable({ items, withCode }: { items: IncomeItem[]; withCode: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {withCode && <TableHead>Código</TableHead>}
          <TableHead>CNPJ da fonte pagadora</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Líquido no ano</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.asset_id}-${item.income_type}`}>
            {withCode && (
              <TableCell>
                {item.code} · {item.code ? incomeCodeLabels[item.code] : ""}
              </TableCell>
            )}
            <CnpjCell item={item} />
            <TableCell className="font-medium">{item.ticker}</TableCell>
            <TableCell>{incomeTypeLabels[item.income_type]}</TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(item.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function IrpfReport({ report }: { report: IrpfReportData }) {
  const { year } = report;

  return (
    <div className="flex flex-col gap-6">
      {/* Aviso de conferência */}
      <Alert>
        <TriangleAlert />
        <AlertTitle>Confira antes de declarar</AlertTitle>
        <AlertDescription>
          Este relatório é um cálculo do app a partir do que está cadastrado, e pode ter
          erros. Para a declaração, a fonte é o informe de rendimentos da corretora: use
          este relatório para cruzar os valores e achar o que falta ou diverge.
        </AlertDescription>
      </Alert>

      {/* Bens e Direitos */}
      <Card>
        <CardHeader>
          <CardTitle>Bens e Direitos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Um item por ativo, pelo custo de aquisição (quantidade × preço médio), nunca pelo
            valor de mercado. Ativo comprado e vendido dentro do ano não entra.
          </p>
          {report.assets.length === 0 ? (
            <p className="text-muted-foreground">Nenhum bem em 31/12.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo / código</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Discriminação</TableHead>
                  <TableHead className="text-right">31/12/{year - 1}</TableHead>
                  <TableHead className="text-right">31/12/{year}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.assets.map((asset) => (
                  <TableRow key={asset.asset_id}>
                    <TableCell className="tabular-nums">
                      {asset.group} / {asset.code}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {asset.cnpj ?? (
                        <Link to={`/assets/${asset.asset_id}`}>
                          <Badge variant="destructive">sem CNPJ</Badge>
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>{asset.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBRL(asset.previous_value)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBRL(asset.current_value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rendimentos isentos */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimentos Isentos e Não Tributáveis · código 20</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Lucro com ações nos meses em que o total vendido de ações não passou de R$ 20 mil.
          </p>
          {report.exempt_months.length === 0 ? (
            <p className="text-muted-foreground">Nenhum lucro isento no ano.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              {report.exempt_months.map((item) => (
                <div key={item.month}>
                  <dt className="text-muted-foreground">{formatMonth(year, item.month)}</dt>
                  <dd className="tabular-nums">{formatBRL(item.profit)}</dd>
                </div>
              ))}
              <div>
                <dt className="text-muted-foreground">Total do ano</dt>
                <dd className="font-medium tabular-nums">{formatBRL(report.exempt_total)}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Renda variável */}
      <Card>
        <CardHeader>
          <CardTitle>Renda Variável · demonstrativo mensal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Resultado líquido de cada mês, sem o lucro isento. Operações comuns reúnem ações,
            ETF e BDR; o FII vai na ficha própria de fundos imobiliários. O imposto pago é o
            DARF {report.darf_code} registrado como pago.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Operações comuns</TableHead>
                <TableHead className="text-right">Day trade</TableHead>
                <TableHead className="text-right">FII</TableHead>
                <TableHead className="text-right">Imposto apurado</TableHead>
                <TableHead className="text-right">Imposto pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.variable_income.map((item) => (
                <TableRow key={item.month}>
                  <TableCell>{formatMonth(year, item.month)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatSignedBRL(item.common)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatSignedBRL(item.day_trade)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatSignedBRL(item.fii)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(item.tax)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.paid_amount && item.paid_on ? (
                      <span title={`Pago em ${formatDate(item.paid_on)}`}>
                        {formatBRL(item.paid_amount)}
                      </span>
                    ) : item.darf_amount ? (
                      <Badge variant="destructive">
                        {formatBRL(item.darf_amount)} não pago
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prejuízo a compensar */}
      <Card>
        <CardHeader>
          <CardTitle>Prejuízo a compensar em 31/12/{year}</CardTitle>
        </CardHeader>
        <CardContent>
          {report.losses.length === 0 ? (
            <p className="text-muted-foreground">Sem apuração no ano.</p>
          ) : (
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              {report.losses.map((loss) => (
                <div key={loss.pool}>
                  <dt className="text-muted-foreground">{lossPoolLabels[loss.pool]}</dt>
                  <dd className="tabular-nums">{formatBRL(loss.amount)}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Proventos por ficha */}
      {(["exempt", "exclusive"] as const).map((form) => {
        const items = report.income.filter((item) => item.form === form);
        return (
          <Card key={form}>
            <CardHeader>
              <CardTitle>{incomeFormLabels[form]} · proventos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                {form === "exempt"
                  ? "Um item por fonte pagadora, pelo valor recebido no ano."
                  : "Um item por fonte pagadora, pelo valor líquido: o IR já foi retido na fonte."}
              </p>
              {items.length === 0 ? (
                <p className="text-muted-foreground">Nenhum provento no ano.</p>
              ) : (
                <IncomeTable items={items} withCode />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Proventos sem ficha */}
      {report.income.some((item) => item.form === null) && (
        <Card>
          <CardHeader>
            <CardTitle>Proventos sem ficha automática</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              O app não sabe em que ficha eles entram, como o dividendo de BDR, que é
              tributado pelo carnê-leão. Confira no informe da corretora.
            </p>
            <IncomeTable
              items={report.income.filter((item) => item.form === null)}
              withCode={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
