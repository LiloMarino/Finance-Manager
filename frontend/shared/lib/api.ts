import type { paths } from "@/types/openapi.generated";

// As URLs do openapi.generated.ts já vêm com o prefixo /api, que o proxy do Vite
// encaminha pro backend em desenvolvimento.
const BASE_URL: string = import.meta.env.VITE_API_BASE ?? "";

type Method = "get" | "post" | "put" | "delete";

/** Paths que realmente expõem esse método — o resto vira erro de compilação. */
type PathsWith<M extends Method> = {
  [P in keyof paths]: paths[P][M] extends undefined ? never : P;
}[keyof paths];

type SuccessJson<O> = O extends {
  responses: { 200: { content: { "application/json": infer T } } };
}
  ? T
  : O extends { responses: { 201: { content: { "application/json": infer T } } } }
    ? T
    : void;

// Path param obrigatório (`/{operation_id}`) aparece como `path: {...}`; sem ele,
// o gerador escreve `path?: never`, que não casa aqui.
type PathOption<O> = O extends { parameters: { path: infer Path } }
  ? { path: Path }
  : { path?: never };

type QueryOption<O> = O extends { parameters: { query?: infer Query } }
  ? [NonNullable<Query>] extends [never]
    ? { query?: never }
    : { query?: NonNullable<Query> }
  : { query?: never };

// JSON vai em `body`; upload (multipart) vai em `form`, e cada Blob vira um campo
// do FormData.
type BodyOption<O> = O extends {
  requestBody: { content: { "application/json": infer Body } };
}
  ? { body: Body; form?: never }
  : O extends { requestBody: { content: { "multipart/form-data": infer Form } } }
    ? { form: Form; body?: never }
    : { body?: never; form?: never };

type Options<O> = PathOption<O> & QueryOption<O> & BodyOption<O>;

/** As opções são argumento obrigatório só quando o endpoint exige path ou body. */
type OptionsArgs<O> = object extends Options<O>
  ? [options?: Options<O>]
  : [options: Options<O>];

interface RawOptions {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
  form?: Record<string, unknown>;
}

export interface ApiError extends Error {
  status: number;
  detail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * O backend garante `{"detail": "<string>"}` em todo 4xx/5xx — inclusive no 422,
 * que ele achata antes de responder. É essa garantia que deixa o toast ser uma
 * linha em qualquer onError.
 */
export function getApiErrorMessage(error: unknown): string {
  if (isRecord(error) && typeof error.detail === "string") {
    return error.detail;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Erro inesperado.";
}

/** Path e query só carregam primitivos; vazio é parâmetro ausente. */
function toParam(value: unknown): string | null {
  if (typeof value === "string") return value || null;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function buildUrl(url: string, { path, query }: RawOptions): string {
  const resolved = url.replace(/\{(\w+)\}/g, (_, name: string) =>
    encodeURIComponent(toParam(path?.[name]) ?? ""),
  );
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    const param = toParam(value);
    if (param !== null) {
      search.append(key, param);
    }
  }
  const queryString = search.toString();
  return `${BASE_URL}${resolved}${queryString ? `?${queryString}` : ""}`;
}

function toFormData(form: Record<string, unknown>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(form)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      const field = item instanceof Blob ? item : toParam(item);
      if (field !== null) data.append(key, field);
    }
  }
  return data;
}

async function request<T>(
  method: Method,
  url: string,
  options: RawOptions = {},
): Promise<T> {
  const init: RequestInit = { method: method.toUpperCase() };
  if (options.form) {
    // O navegador escreve o Content-Type com o boundary do multipart
    init.body = toFormData(options.form);
  } else if (options.body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(url, options), init);
  const raw = response.status === 204 ? "" : await response.text();
  const payload: unknown = raw === "" ? null : JSON.parse(raw);

  if (!response.ok) {
    const error = new Error(
      `Request failed with status ${response.status}`,
    ) as ApiError;
    error.status = response.status;
    error.detail = getApiErrorMessage(payload);
    throw error;
  }

  return payload as T;
}

export function get<P extends PathsWith<"get">>(
  url: P,
  ...[options]: OptionsArgs<paths[P]["get"]>
): Promise<SuccessJson<paths[P]["get"]>> {
  return request("get", url, options as RawOptions | undefined);
}

export function post<P extends PathsWith<"post">>(
  url: P,
  ...[options]: OptionsArgs<paths[P]["post"]>
): Promise<SuccessJson<paths[P]["post"]>> {
  return request("post", url, options as RawOptions | undefined);
}

export function put<P extends PathsWith<"put">>(
  url: P,
  ...[options]: OptionsArgs<paths[P]["put"]>
): Promise<SuccessJson<paths[P]["put"]>> {
  return request("put", url, options as RawOptions | undefined);
}

export function del<P extends PathsWith<"delete">>(
  url: P,
  ...[options]: OptionsArgs<paths[P]["delete"]>
): Promise<void> {
  return request("delete", url, options as RawOptions | undefined);
}
