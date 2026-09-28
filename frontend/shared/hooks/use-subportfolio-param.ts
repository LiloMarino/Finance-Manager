import { useSearchParams } from "react-router-dom";

const PARAM = "subportfolio";

/** O `search` que leva a subcarteira para outra visão de carteira. */
export function subportfolioSearch(subportfolioId: number | undefined): string {
  return subportfolioId === undefined ? "" : `?${PARAM}=${subportfolioId}`;
}

/** A subcarteira que as visões de carteira mostram, no `?subportfolio=` da URL;
sem ele, a carteira geral. */
export function useSubportfolioParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = Number(searchParams.get(PARAM));
  const subportfolioId = Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;

  const setSubportfolio = (next: number | undefined) =>
    setSearchParams((params) => {
      if (next === undefined) params.delete(PARAM);
      else params.set(PARAM, String(next));
      return params;
    });

  return [subportfolioId, setSubportfolio] as const;
}
