import { Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";

export function ErrorPage() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="text-muted-foreground">Esse endereço não existe no app.</p>
      </div>
      <Button asChild>
        <Link to="/">Voltar para a carteira</Link>
      </Button>
    </div>
  );
}
