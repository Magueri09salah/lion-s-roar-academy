// API-ready data layer.
// Today: returns mocked data wrapped in promises (simulating an HTTP API).
// Tomorrow: replace each function body with a `fetch(...)` call — the
// component contracts (loaders, loading/error states) stay identical.
import { FORMATIONS, PROGRAM, PROJECTS, TRAINERS, PRINCIPLES } from "./data";

const NETWORK_DELAY = 250;

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export type Formation = (typeof FORMATIONS)[number];
export type Project = (typeof PROJECTS)[number];
export type Trainer = (typeof TRAINERS)[number];
export type ProgramMonth = (typeof PROGRAM)[number];
export type Principle = (typeof PRINCIPLES)[number];

export async function fetchFormations(): Promise<Formation[]> {
  return delay(FORMATIONS);
}

export async function fetchFormationBySlug(slug: string): Promise<Formation | null> {
  const found = FORMATIONS.find((f) => f.slug === slug) ?? null;
  return delay(found);
}

export async function fetchProjects(): Promise<Project[]> {
  return delay(PROJECTS);
}

export async function fetchTrainers(): Promise<Trainer[]> {
  return delay(TRAINERS);
}

export async function fetchProgram(): Promise<ProgramMonth[]> {
  return delay(PROGRAM);
}

export async function fetchPrinciples(): Promise<Principle[]> {
  return delay(PRINCIPLES);
}
