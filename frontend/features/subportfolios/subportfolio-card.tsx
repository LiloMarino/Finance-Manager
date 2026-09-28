import { Pencil } from "lucide-react";

import { MembersDialog } from "@/features/subportfolios/members-dialog";
import {
  useDeleteSubportfolio,
  useRenameSubportfolio,
} from "@/features/subportfolios/use-subportfolio-mutations";
import { DeleteDialog } from "@/shared/components/delete-dialog";
import { NameDialog } from "@/shared/components/name-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";

export function SubportfolioCard({ subportfolio }: { subportfolio: Subportfolio }) {
  const rename = useRenameSubportfolio(subportfolio);
  const remove = useDeleteSubportfolio(subportfolio);
  const empty = subportfolio.assets.length === 0 && subportfolio.fixed_income.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subportfolio.name}</CardTitle>
        <CardAction className="flex gap-1">
          <MembersDialog subportfolio={subportfolio} />
          <NameDialog
            title={`Renomear ${subportfolio.name}`}
            initialName={subportfolio.name}
            save={rename}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Renomear ${subportfolio.name}`}
              >
                <Pencil />
              </Button>
            }
          />
          <DeleteDialog
            name={subportfolio.name}
            description="Os ativos e os títulos dela voltam a ficar só na carteira geral."
            remove={remove}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-muted-foreground text-sm">Nenhum ativo ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {subportfolio.assets.map((asset) => (
              <Badge key={`asset-${asset.id}`} variant="secondary">
                {asset.ticker}
              </Badge>
            ))}
            {subportfolio.fixed_income.map((investment) => (
              <Badge key={`fixed-income-${investment.id}`} variant="outline">
                {investment.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
