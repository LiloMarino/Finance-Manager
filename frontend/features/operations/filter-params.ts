import type { OperationFilters } from "@/features/operations/use-operations";
import { isOperationType } from "@/shared/lib/labels";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Os filtros que a URL descreve; valor inválido digitado na URL é descartado. */
export function readFilters(params: URLSearchParams): OperationFilters {
  const asset = Number(params.get("asset"));
  const type = params.get("type") ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  return {
    ...(Number.isInteger(asset) && asset > 0 && { asset_id: asset }),
    ...(isOperationType(type) && { operation_type: type }),
    ...(ISO_DATE.test(start) && { start }),
    ...(ISO_DATE.test(end) && { end }),
  };
}

export function writeFilters(
  params: URLSearchParams,
  filters: OperationFilters,
): URLSearchParams {
  const entries: [string, string | number | null | undefined][] = [
    ["asset", filters.asset_id],
    ["type", filters.operation_type],
    ["start", filters.start],
    ["end", filters.end],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") params.delete(key);
    else params.set(key, String(value));
  }
  return params;
}

export function hasFilters(filters: OperationFilters): boolean {
  return [filters.asset_id, filters.operation_type, filters.start, filters.end].some(
    (value) => value !== undefined && value !== null,
  );
}
