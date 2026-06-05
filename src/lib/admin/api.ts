// Thin fetch wrapper for the Laravel admin API.
//
// Responsibilities:
//   - prefix every URL with VITE_API_URL
//   - inject the Sanctum Bearer token from localStorage
//   - unwrap the { success, data, meta } envelope returned by ApiResponse.php
//   - throw a typed ApiClientError on { success:false } responses so
//     TanStack Query / form code can catch a single error type
//   - auto-clear the session on 401 and emit an event so the router redirects to /admin/login

import { clearSession, getStoredToken } from "./auth";
import type { ApiResponse } from "./types";

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000";
export const API_BASE_URL = RAW_BASE.replace(/\/$/, "");

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(opts: {
    status: number;
    message: string;
    code: string;
    details?: Record<string, string[]>;
  }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
    this.name = "ApiClientError";
  }
}

// JSON-serialisable shape (anything that's not a Date / function / class
// instance with private fields). Using `object` instead of
// Record<string, unknown> so plain interfaces — which TypeScript treats
// as not having an index signature — can be passed directly.
type Body = object | FormData | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: Body;
  query?: Record<string, string | number | string[] | undefined | null>;
  signal?: AbortSignal;
  /**
   * If false, do NOT attach the Authorization header even when a token exists.
   * Used by the login endpoint.
   */
  auth?: boolean;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const { method = "GET", body, query, signal, auth = true } = opts;

  const url = new URL(joinPath(API_BASE_URL, path));
  if (query) {
    for (const [key, raw] of Object.entries(query)) {
      if (raw === undefined || raw === null || raw === "") continue;
      if (Array.isArray(raw)) {
        // Repeated key (?status[]=new&status[]=contacted)
        raw.forEach((v) => url.searchParams.append(`${key}[]`, String(v)));
      } else {
        url.searchParams.set(key, String(raw));
      }
    }
  }

  const headers = new Headers();
  headers.set("Accept", "application/json");
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      credentials: "omit", // Bearer tokens — we don't need cookies
    });
  } catch (e) {
    throw new ApiClientError({
      status: 0,
      message: "Impossible de joindre le serveur.",
      code: "network_error",
    });
  }

  // 204 No Content — no body to parse.
  if (response.status === 204) {
    return { data: undefined as T };
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError({
      status: response.status,
      message: `Réponse invalide du serveur (${response.status}).`,
      code: "invalid_response",
    });
  }

  if (!response.ok || !payload?.success) {
    // 401 → drop the session so the router redirects to /admin/login.
    if (response.status === 401) clearSession();

    const errPayload = (payload as { success: false; error: { message: string; code: string; details?: Record<string, string[]> } } | null)?.error;
    throw new ApiClientError({
      status: response.status,
      message: errPayload?.message ?? `Erreur HTTP ${response.status}.`,
      code: errPayload?.code ?? "http_error",
      details: errPayload?.details,
    });
  }

  return { data: payload.data, meta: payload.meta };
}

function joinPath(base: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return base + (path.startsWith("/") ? path : `/${path}`);
}
