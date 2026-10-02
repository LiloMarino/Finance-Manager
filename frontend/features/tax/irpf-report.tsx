import { TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import {
  formatMonth,
  incomeCodeLabels,
  incomeFormLabels,
  lossPoolLabels,
} from "@/features/tax/labels";
import type { IrpfReport as IrpfReportData } from "@/features/tax/use-tax";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Money } from "@/shared/components/money";
import { formatDate } from "@/shared/lib/format";
import { incomeTypeLabels } from "@/shared/lib/labels";
import { signTone } from "@/shared/lib/sign";

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
            <TableCell>
              <span className="text-ticker font-mono">{item.ticker}</span>
            </TableCell>
            <TableCell>{incomeTypeLabels[item.income_type]}</TableCell>
            <TableCell className="text-right tabular-nums">
              <Money value={item.amount} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function IrpfReport({ report }: { report: IrpfReportData }) {
  const { year } = report;
  const assetsWithoutCnpj = report.assets.filter((asset) => asset.cnpj === null).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Aviso de conferência */}
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Confira antes de declarar</AlertTitle>
        <AlertDescription>
          Este relatório é um cálculo do app a partir do que está cadastrado. A fonte da declaração
          é o informe de rendimentos da corretora: use este para cruzar os valores e achar o que
          falta.
        </AlertDescription>
        {assetsWithoutCnpj > 0 && (
          <AlertAction>
            <Button variant="outline" size="sm" render={<Link to="/assets" />}>
              {assetsWithoutCnpj} ativo{assetsWithoutCnpj === 1 ? "" : "s"} sem CNPJ
            </Button>
          </AlertAction>
        )}
      </Alert>

      {/* Bens e Direitos */}
      <Card>
        <CardHeader>
          <CardTitle>Bens e Direitos</CardTitle>
          <CardAction>
            <span className="text-caption text-muted-foreground">
              Pelo custo de aquisição, nunca pelo valor de mercado
            </span>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
          {report.assets.length === 0 ? (
            <div className="px-5 py-3">
              <p className="text-muted-foreground">Nenhum bem em 31/12.</p>
            </div>
          ) : (
            <>
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
                        <Money value={asset.previous_value} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Money value={asset.current_value} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rendimentos isentos */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimentos Isentos e Não Tributáveis · código 20</CardTitle>
        </CardHeader>
        <CardContent data-flush>
          {report.exempt_months.length === 0 ? (
            <div className="px-5 py-3">
              <p className="text-muted-foreground">Nenhum lucro isento no ano.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 px-5 py-3">
              {report.exempt_months.map((item) => (
                <div key={item.month} className="grid grid-cols-3 gap-3">
                  <span className="text-caption text-muted-foreground">
                    {formatMonth(year, item.month)}
                  </span>
                  <span className="tabular-nums">
                    <Money value={item.profit} />
                  </span>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <span className="text-caption text-muted-foreground">Total do ano</span>
                <span className="tabular-nums font-semibold">
                  <Money value={report.exempt_total} />
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renda variável */}
      <Card>
        <CardHeader>
          <CardTitle>Renda Variável · demonstrativo mensal</CardTitle>
          <CardAction>
            <span className="text-caption text-muted-foreground">
              Sem o lucro isento; FII na ficha própria
            </span>
          </CardAction>
        </CardHeader>
        <CardContent data-flush>
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
                  <TableCell variant={signTone(item.common)} className="text-right tabular-nums">
                    <Money value={item.common} signed />
                  </TableCell>
                  <TableCell variant={signTone(item.day_trade)} className="text-right tabular-nums">
                    <Money value={item.day_trade} signed />
                  </TableCell>
                  <TableCell variant={signTone(item.fii)} className="text-right tabular-nums">
                    <Money value={item.fii} signed />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Money value={item.tax} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.paid_amount && item.paid_on ? (
                      <span title={`Pago em ${formatDate(item.paid_on)}`}>
                        <Money value={item.paid_amount} />
                      </span>
                    ) : item.darf_amount ? (
                      <Badge variant="destructive">
                        <Money value={item.darf_amount} /> não pago
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-caption text-muted-foreground px-5 pt-3">
            O imposto pago é o DARF {report.darf_code} registrado como pago.
          </p>
        </CardContent>
      </Card>

      {/* Prejuízo a compensar */}
      <Card>
        <CardHeader>
          <CardTitle>Prejuízo a compensar em 31/12/{year}</CardTitle>
        </CardHeader>
        <CardContent data-flush>
          {report.losses.length === 0 ? (
            <div className="px-5 py-3">
              <p className="text-muted-foreground">Sem apuração no ano.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 px-5 py-3">
              {report.losses.map((loss) => (
                <div key={loss.pool} className="grid grid-cols-3 gap-3">
                  <span className="text-caption text-muted-foreground">
                    {lossPoolLabels[loss.pool]}
                  </span>
                  <span className="tabular-nums">
                    <Money value={loss.amount} />
                  </span>
                </div>
              ))}
            </div>
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
            <CardContent data-flush>
              {items.length === 0 ? (
                <div className="px-5 py-3">
                  <p className="text-muted-foreground">Nenhum provento no ano.</p>
                </div>
              ) : (
                <>
                  <IncomeTable items={items} withCode />
                  <p className="text-caption text-muted-foreground px-5 pt-3">
                    {form === "exempt"
                      ? "Um item por fonte pagadora, pelo valor recebido no ano."
                      : "Um item por fonte pagadora, pelo valor líquido: o IR já foi retido na fonte."}
                  </p>
                </>
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
          <CardContent data-flush>
            <IncomeTable
              items={report.income.filter((item) => item.form === null)}
              withCode={false}
            />
            <p className="text-caption text-muted-foreground px-5 pt-3">
              O app não sabe em que ficha eles entram, como o dividendo de BDR, que é tributado pelo
              carnê-leão. Confira no informe da corretora.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
