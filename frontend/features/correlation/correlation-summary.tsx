import {
  correlationHint,
  describeCorrelation,
  returnsHint,
} from "@/features/correlation/hints";
import type { Correlation } from "@/features/correlation/use-correlation";
import { Metric } from "@/shared/components/metric";
import { formatDate } from "@/shared/lib/format";

const correlationFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function CorrelationSummary({ correlation }: { correlation: Correlation }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Metric
          label={`Correlação ${correlation.first} × ${correlation.second}`}
          hint={correlationHint}
          value={correlationFormatter.format(correlation.correlation)}
        />
        <Metric
          label="Dias na conta"
          hint={returnsHint}
          value={`${correlation.returns} pregões`}
        />
        <Metric
          label="Período"
          hint="Do primeiro ao último pregão em que os dois têm fechamento, dentro da janela escolhida."
          value={`${formatDate(correlation.start)} a ${formatDate(correlation.end)}`}
        />
      </div>
      <p className="text-lg">{describeCorrelation(correlation.correlation)}</p>
    </div>
  );
}
