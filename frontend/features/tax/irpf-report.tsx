import { Link } from "react-router-dom";

import { formatMonth, lossPoolLabels } from "@/features/tax/labels";
import type { IrpfReport as IrpfReportData } from "@/features/tax/use-tax";
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
import { formatBRL, formatSignedBRL } from "@/types/decimal";

export function IrpfReport({ report }: { report: IrpfReportData }) {
  const { year } = report;

  return (
    <div className="flex flex-col gap-6">
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

      <p className="text-muted-foreground text-sm">
        Dividendos (código 09) e JCP (código 10) vêm do informe de rendimentos da corretora.
      </p>
    </div>
  );
}
