// Public-site API client. Calls the Laravel backend and unwraps the
// standard { success, data, meta } envelope.
//
// The exported function signatures are the same as the previous mock
// implementation, so TanStack Router loaders that consume them
// (src/routes/formation.tsx, src/routes/formation.$slug.tsx) keep working
// without changes.
//
// Pages that still import directly from `./data` (the homepage, /academie,
// /programme, /realisations, /formateurs) continue to render hardcoded
// content for now. They can be migrated to these fetchers one by one in
// a later phase — the data shapes already match.

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.lionsacademie.com").replace(/\/$/, "");

// ---------- Shared types ------------------------------------------------

export interface FormationCategory {
  title: string;
  items: string[];
}

export interface Formation {
  id?: number;
  slug: string;
  title: string;
  duration: string;
  format: string;
  level: string;
  cover: string | null;
  summary: string;
  audience?: string | null;
  method?: string | null;
  certification?: string | null;
  objectives: string[];
  categories: FormationCategory[];
  is_active?: boolean;
}

export interface ProgramMonth {
  id?: number;
  position?: number;
  month: string;
  title: string;
  axis: string;
  objective: string;
  deliverable: string;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  student: string;
  promotion: string;
  category: string;
  software: string[];
  description: string;
  status: string;
  cover: string | null;
  gallery: string[];
}

export interface TrainerSocials {
  instagram?: string | null;
  linkedin?: string | null;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  experience: string;
  modules: string[];
  software: string[];
  initials: string;
  photo: string | null;
  socials: TrainerSocials;
}

export interface Principle {
  id?: number;
  title: string;
  desc: string;
}

// ---------- Envelope ----------------------------------------------------

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiError {
  success: false;
  error: { message: string; code: string; details?: Record<string, string[]> };
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });

  let body: ApiSuccess<T> | ApiError | null = null;
  try {
    body = (await res.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new Error(`Invalid JSON from ${path} (HTTP ${res.status})`);
  }

  if (!res.ok || !body || body.success !== true) {
    const msg = (body && body.success === false ? body.error.message : null) ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body.data;
}

// ---------- Fetchers (same signatures as the previous mock) -------------

export async function fetchFormations(): Promise<Formation[]> {
  return getJson<Formation[]>("/api/v1/formations");
}

export async function fetchFormationBySlug(slug: string): Promise<Formation | null> {
  try {
    return await getJson<Formation>(`/api/v1/formations/${encodeURIComponent(slug)}`);
  } catch (e) {
    // The backend returns 404 for unknown slugs; surface as null so
    // TanStack Router can call `notFound()` instead of throwing.
    if (e instanceof Error && /HTTP 404|not.?found/i.test(e.message)) return null;
    throw e;
  }
}

export async function fetchProjects(category?: string): Promise<Project[]> {
  const qs = category && category !== "Tous"
    ? `?category=${encodeURIComponent(category)}`
    : "";
  return getJson<Project[]>(`/api/v1/projects${qs}`);
}

export async function fetchTrainers(): Promise<Trainer[]> {
  return getJson<Trainer[]>("/api/v1/trainers");
}

export async function fetchProgram(): Promise<ProgramMonth[]> {
  return getJson<ProgramMonth[]>("/api/v1/programme");
}

export async function fetchPrinciples(): Promise<Principle[]> {
  return getJson<Principle[]>("/api/v1/principles");
}
