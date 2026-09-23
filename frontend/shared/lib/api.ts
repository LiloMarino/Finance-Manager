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

type JsonBody<O> = O extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

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

async function request<T>(
  method: Method,
  url: string,
  body?: unknown,
): Promise<T> {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${url}`, {
    method: method.toUpperCase(),
    headers:
      isFormData || body === undefined
        ? undefined
        : { "Content-Type": "application/json" },
    body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

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
): Promise<SuccessJson<paths[P]["get"]>> {
  return request("get", url);
}

export function post<P extends PathsWith<"post">>(
  url: P,
  body: JsonBody<paths[P]["post"]>,
): Promise<SuccessJson<paths[P]["post"]>> {
  return request("post", url, body);
}

export function put<P extends PathsWith<"put">>(
  url: P,
  body: JsonBody<paths[P]["put"]>,
): Promise<SuccessJson<paths[P]["put"]>> {
  return request("put", url, body);
}

export function del<P extends PathsWith<"delete">>(url: P): Promise<void> {
  return request("delete", url);
}
