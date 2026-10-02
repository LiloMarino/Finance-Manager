import { type FormEvent, useState } from "react";

import {
  useAlertSchedule,
  useRemoveSchedule,
  useRunAlert,
  useSaveSchedule,
} from "@/features/alert/use-alert-schedule";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

const DEFAULT_TIME = "04:00";

/** A tarefa do Agendador de Tarefas que roda o alerta uma vez por dia, com o app
aberto ou não. O alerta avisa o mesmo que as Pendências mostram sobre rebalanceamento,
saldo parado e DARF. */
export function ScheduleCard() {
  const { data, isPending, error } = useAlertSchedule();

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Alerta diário</CardTitle>
        <CardAction>
          {data?.scheduled ? (
            <Badge variant="gain">Agendado para todo dia às {data.time?.slice(0, 5)}</Badge>
          ) : (
            <Badge variant="outline">Não agendado</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-ink-2">
          Uma vez por dia, mesmo com o app fechado, o Windows confere as subcarteiras e o saldo, e
          abre uma janela se alguma subcarteira passou do limite ou se há saldo parado. Com o PC
          desligado no horário, roda assim que ele ligar.
        </p>
        {isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : error ? (
          <span className="text-destructive">{getApiErrorMessage(error)}</span>
        ) : (
          <ScheduleForm
            key={data.time ?? ""}
            scheduled={data.scheduled}
            time={data.time?.slice(0, 5) ?? DEFAULT_TIME}
          />
        )}
        <p className="text-caption text-muted-foreground">
          Usar o app não abre janela nenhuma: o aviso fica nas Pendências.
        </p>
      </CardContent>
    </Card>
  );
}

interface ScheduleFormProps {
  scheduled: boolean;
  time: string;
}

// O horário digitado é passageiro até agendar
function ScheduleForm({ scheduled, time }: ScheduleFormProps) {
  const [text, setText] = useState(time);
  const save = useSaveSchedule();
  const remove = useRemoveSchedule();
  const run = useRunAlert();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate(text);
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <Field className="w-32">
        <FieldLabel htmlFor="alert-time">Horário</FieldLabel>
        <Input
          id="alert-time"
          type="time"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <Button type="submit" disabled={save.isPending || text === ""}>
        {scheduled ? "Reagendar" : "Agendar"}
      </Button>
      {scheduled && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={run.isPending}
            onClick={() => run.mutate()}
          >
            Testar agora
          </Button>
          <Button
            type="button"
            variant="outline-destructive"
            className="ml-auto"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            Remover
          </Button>
        </>
      )}
    </form>
  );
}
