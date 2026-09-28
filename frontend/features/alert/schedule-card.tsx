import { BellRing, Play, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import {
  useAlertSchedule,
  useRemoveSchedule,
  useRunAlert,
  useSaveSchedule,
} from "@/features/alert/use-alert-schedule";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

const DEFAULT_TIME = "04:00";

/** A tarefa do Agendador de Tarefas que roda o alerta uma vez por dia, com o app
aberto ou não. O alerta avisa o mesmo que Saúde dos dados mostra sobre
rebalanceamento e saldo parado. */
export function ScheduleCard() {
  const { data, isPending, error } = useAlertSchedule();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerta diário</CardTitle>
        <p className="text-muted-foreground text-sm">
          Uma vez por dia, mesmo com o app fechado, o Windows confere as subcarteiras e
          o saldo, e abre uma janela se alguma subcarteira passou do limite ou se há
          saldo parado. Com o PC desligado no horário, roda assim que ele ligar. A
          janela vem só dessa tarefa: usar o app não abre janela nenhuma, e o aviso fica
          em Saúde dos dados.
        </p>
      </CardHeader>
      <CardContent>
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
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        {scheduled ? `Agendado para todo dia às ${time}.` : "Não agendado."}
      </p>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
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
          <BellRing />
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
              <Play />
              Testar agora
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              <Trash2 />
              Remover
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
