// TanStack Query hooks for the admin API. One hook per HTTP endpoint so
// route components stay declarative.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";
import { persistSession } from "./auth";
import type {
  AdminFormation,
  AdminPrinciple,
  AdminProgramMonth,
  AdminProject,
  AdminTrainer,
  AdminUser,
  ConcoursDetail,
  ConcoursListItem,
  ConcoursListMeta,
  ConcoursListParams,
  ConcoursSettings,
  ContactMessageDetail,
  ContactMessageListItem,
  ContactMessageListMeta,
  ContactMessageListParams,
  LoginResponse,
  RegistrationDetail,
  RegistrationListItem,
  RegistrationListMeta,
  RegistrationListParams,
  UpdateConcoursPayload,
  UpdateConcoursSettingsPayload,
  UpdateContactMessagePayload,
  UpdateRegistrationPayload,
  UploadedMedia,
  UpsertFormationPayload,
  UpsertPrinciplePayload,
  UpsertProgramMonthPayload,
  UpsertProjectPayload,
  UpsertTrainerPayload,
} from "./types";

// ----- Auth --------------------------------------------------------------

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string; device_name?: string }) => {
      const res = await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: input,
        auth: false,
      });
      persistSession(res.data.token, res.data.user);
      return res.data;
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      // session is cleared by the api layer on 401; on success we drop too
      qc.clear();
    },
  });
}

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "me"],
    enabled,
    queryFn: async () => {
      const res = await apiFetch<{ user: AdminUser }>("/api/v1/auth/me");
      return res.data.user;
    },
    staleTime: 60_000,
  });
}

// ----- Password flows ---------------------------------------------------

/**
 * Request a reset email. Always resolves successfully on the server
 * (account enumeration safe) — but if the network call itself fails
 * we still surface that here.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const res = await apiFetch<{ message: string }>("/api/v1/auth/forgot-password", {
        method: "POST",
        body: input,
        auth: false,
      });
      return res.data;
    },
  });
}

/**
 * Complete the password reset using the token sent by email.
 * Field names match the backend's ResetPasswordRequest exactly.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (input: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const res = await apiFetch<{ user: AdminUser; message: string }>("/api/v1/auth/reset-password", {
        method: "POST",
        body: input,
        auth: false,
      });
      return res.data;
    },
  });
}

/**
 * Change own password (logged-in). Backend revokes every other token
 * but keeps the current session alive.
 */
export function useChangeOwnPasswordMutation() {
  return useMutation({
    mutationFn: async (input: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => {
      await apiFetch("/api/v1/auth/me/password", { method: "PATCH", body: input });
    },
  });
}

// ----- Registrations -----------------------------------------------------

export function registrationsKey(params: RegistrationListParams = {}) {
  return ["admin", "registrations", params] as const;
}

export function useRegistrationsQuery(params: RegistrationListParams) {
  return useQuery({
    queryKey: registrationsKey(params),
    queryFn: async () => {
      const res = await apiFetch<RegistrationListItem[]>("/api/v1/admin/registrations", {
        query: {
          q: params.q,
          "status": params.status,
          formation: params.formation,
          date_from: params.date_from,
          date_to: params.date_to,
          sort: params.sort,
          per_page: params.per_page,
          page: params.page,
        },
      });
      return { items: res.data, meta: res.meta as unknown as RegistrationListMeta };
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}

export function useRegistrationQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: ["admin", "registrations", "detail", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const res = await apiFetch<RegistrationDetail>(`/api/v1/admin/registrations/${id}`);
      return res.data;
    },
  });
}

export function useUpdateRegistrationMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateRegistrationPayload) => {
      const res = await apiFetch<RegistrationDetail>(`/api/v1/admin/registrations/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["admin", "registrations", "detail", id], updated);
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
    },
  });
}

export function useDeleteRegistrationMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/registrations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "registrations"] });
    },
  });
}

// ----- Contact messages --------------------------------------------------

export function contactMessagesKey(params: ContactMessageListParams = {}) {
  return ["admin", "contact-messages", params] as const;
}

export function useContactMessagesQuery(params: ContactMessageListParams) {
  return useQuery({
    queryKey: contactMessagesKey(params),
    queryFn: async () => {
      const res = await apiFetch<ContactMessageListItem[]>("/api/v1/admin/contact-messages", {
        query: {
          q: params.q,
          status: params.status,
          date_from: params.date_from,
          date_to: params.date_to,
          sort: params.sort,
          per_page: params.per_page,
          page: params.page,
        },
      });
      return { items: res.data, meta: res.meta as unknown as ContactMessageListMeta };
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}

export function useContactMessageQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: ["admin", "contact-messages", "detail", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const res = await apiFetch<ContactMessageDetail>(`/api/v1/admin/contact-messages/${id}`);
      return res.data;
    },
  });
}

export function useUpdateContactMessageMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateContactMessagePayload) => {
      const res = await apiFetch<ContactMessageDetail>(`/api/v1/admin/contact-messages/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["admin", "contact-messages", "detail", id], updated);
      qc.invalidateQueries({ queryKey: ["admin", "contact-messages"] });
    },
  });
}

export function useDeleteContactMessageMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/contact-messages/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "contact-messages"] });
    },
  });
}

// ----- Principles (admin CRUD) ------------------------------------------

export function adminPrinciplesKey() {
  return ["admin", "principles"] as const;
}

export function useAdminPrinciplesQuery() {
  return useQuery({
    queryKey: adminPrinciplesKey(),
    queryFn: async () => {
      const res = await apiFetch<AdminPrinciple[]>("/api/v1/admin/principles");
      return res.data;
    },
    staleTime: 10_000,
  });
}

export function useCreatePrincipleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertPrinciplePayload) => {
      const res = await apiFetch<AdminPrinciple>("/api/v1/admin/principles", {
        method: "POST",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminPrinciplesKey() });
    },
  });
}

export function useUpdatePrincipleMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertPrinciplePayload>) => {
      const res = await apiFetch<AdminPrinciple>(`/api/v1/admin/principles/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminPrinciplesKey() });
    },
  });
}

export function useDeletePrincipleMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/principles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminPrinciplesKey() });
    },
  });
}

// ----- Programme months (admin CRUD) ------------------------------------

export function adminProgrammeKey() {
  return ["admin", "programme"] as const;
}

export function useAdminProgrammeQuery() {
  return useQuery({
    queryKey: adminProgrammeKey(),
    queryFn: async () => {
      const res = await apiFetch<AdminProgramMonth[]>("/api/v1/admin/programme");
      return res.data;
    },
    staleTime: 10_000,
  });
}

export function useCreateProgramMonthMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertProgramMonthPayload) => {
      const res = await apiFetch<AdminProgramMonth>("/api/v1/admin/programme", {
        method: "POST",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProgrammeKey() });
    },
  });
}

export function useUpdateProgramMonthMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertProgramMonthPayload>) => {
      const res = await apiFetch<AdminProgramMonth>(`/api/v1/admin/programme/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProgrammeKey() });
    },
  });
}

export function useDeleteProgramMonthMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/programme/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProgrammeKey() });
    },
  });
}

// ----- Trainers (admin CRUD) --------------------------------------------

export function adminTrainersKey() {
  return ["admin", "trainers"] as const;
}

export function useAdminTrainersQuery() {
  return useQuery({
    queryKey: adminTrainersKey(),
    queryFn: async () => {
      const res = await apiFetch<AdminTrainer[]>("/api/v1/admin/trainers");
      return res.data;
    },
    staleTime: 10_000,
  });
}

export function useCreateTrainerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertTrainerPayload) => {
      const res = await apiFetch<AdminTrainer>("/api/v1/admin/trainers", {
        method: "POST",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminTrainersKey() });
    },
  });
}

export function useUpdateTrainerMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertTrainerPayload>) => {
      const res = await apiFetch<AdminTrainer>(`/api/v1/admin/trainers/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminTrainersKey() });
    },
  });
}

export function useDeleteTrainerMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/trainers/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminTrainersKey() });
    },
  });
}

// ----- Formations (admin CRUD) ------------------------------------------

export function adminFormationsKey() {
  return ["admin", "formations"] as const;
}

export function useAdminFormationsQuery() {
  return useQuery({
    queryKey: adminFormationsKey(),
    queryFn: async () => {
      const res = await apiFetch<AdminFormation[]>("/api/v1/admin/formations");
      return res.data;
    },
    staleTime: 10_000,
  });
}

export function useCreateFormationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertFormationPayload) => {
      const res = await apiFetch<AdminFormation>("/api/v1/admin/formations", {
        method: "POST",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminFormationsKey() });
    },
  });
}

export function useUpdateFormationMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertFormationPayload>) => {
      const res = await apiFetch<AdminFormation>(`/api/v1/admin/formations/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminFormationsKey() });
    },
  });
}

export function useDeleteFormationMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/formations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminFormationsKey() });
    },
  });
}

// ----- Projects (Réalisations) admin CRUD -------------------------------

export function adminProjectsKey() {
  return ["admin", "projects"] as const;
}

export function useAdminProjectsQuery() {
  return useQuery({
    queryKey: adminProjectsKey(),
    queryFn: async () => {
      const res = await apiFetch<AdminProject[]>("/api/v1/admin/projects");
      return res.data;
    },
    staleTime: 10_000,
  });
}

export function useCreateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertProjectPayload) => {
      const res = await apiFetch<AdminProject>("/api/v1/admin/projects", {
        method: "POST",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProjectsKey() });
    },
  });
}

export function useUpdateProjectMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UpsertProjectPayload>) => {
      const res = await apiFetch<AdminProject>(`/api/v1/admin/projects/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProjectsKey() });
    },
  });
}

export function useDeleteProjectMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/projects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProjectsKey() });
    },
  });
}

// ----- Media upload (admin) ----------------------------------------------
// Posts a FormData payload to /api/v1/admin/media. apiFetch detects the
// FormData body and skips the JSON content-type header. The Authorization
// bearer token is attached automatically.

export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: async (input: { file: File; folder?: string; alt?: string }) => {
      const form = new FormData();
      form.append("file", input.file);
      if (input.folder) form.append("folder", input.folder);
      if (input.alt) form.append("alt", input.alt);
      const res = await apiFetch<UploadedMedia>("/api/v1/admin/media", {
        method: "POST",
        body: form,
      });
      return res.data;
    },
  });
}

// ----- Concours ENA (admin) ---------------------------------------------

export function adminConcoursKey(params: ConcoursListParams = {}) {
  return ["admin", "concours", params] as const;
}

export function useAdminConcoursQuery(params: ConcoursListParams) {
  return useQuery({
    queryKey: adminConcoursKey(params),
    queryFn: async () => {
      const res = await apiFetch<ConcoursListItem[]>("/api/v1/admin/registrations-concours", {
        query: {
          q: params.q,
          status: params.status,
          priority: params.priority,
          filiere: params.filiere,
          city: params.city,
          regional_grade: params.regional_grade,
          preferred_format: params.preferred_format,
          date_from: params.date_from,
          date_to: params.date_to,
          sort: params.sort,
          per_page: params.per_page,
          page: params.page,
        },
      });
      return { items: res.data, meta: res.meta as unknown as ConcoursListMeta };
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}

export function useConcoursLeadQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: ["admin", "concours", "detail", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const res = await apiFetch<ConcoursDetail>(`/api/v1/admin/registrations-concours/${id}`);
      return res.data;
    },
  });
}

export function useUpdateConcoursLeadMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateConcoursPayload) => {
      const res = await apiFetch<ConcoursDetail>(`/api/v1/admin/registrations-concours/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["admin", "concours", "detail", id], updated);
      qc.invalidateQueries({ queryKey: ["admin", "concours"] });
    },
  });
}

export function useDeleteConcoursLeadMutation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiFetch(`/api/v1/admin/registrations-concours/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "concours"] });
    },
  });
}

// ----- Concours settings (admin video editor) --------------------------

export function useAdminConcoursSettingsQuery() {
  return useQuery({
    queryKey: ["admin", "concours-settings"],
    queryFn: async () => {
      const res = await apiFetch<ConcoursSettings>("/api/v1/admin/concours-settings");
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateConcoursSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateConcoursSettingsPayload) => {
      const res = await apiFetch<ConcoursSettings>("/api/v1/admin/concours-settings", {
        method: "PATCH",
        body: payload,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["admin", "concours-settings"], updated);
    },
  });
}

// ----- Video upload (admin) --------------------------------------------
// Hits the dedicated /admin/media/videos endpoint with a 200 MB limit
// and the video/* MIME whitelist. Same return shape as the image upload.

export function useUploadVideoMutation() {
  return useMutation({
    mutationFn: async (input: { file: File; folder?: string; alt?: string }) => {
      const form = new FormData();
      form.append("file", input.file);
      if (input.folder) form.append("folder", input.folder);
      if (input.alt) form.append("alt", input.alt);
      const res = await apiFetch<UploadedMedia>("/api/v1/admin/media/videos", {
        method: "POST",
        body: form,
      });
      return res.data;
    },
  });
}

// ----- Export ------------------------------------------------------------

export type ExportFormat = "csv" | "xlsx";

export function buildExportUrl(params: RegistrationListParams = {}, format: ExportFormat = "csv"): string {
  const url = new URL(
    `/api/v1/admin/registrations/export.${format}`,
    (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000",
  );
  if (params.q) url.searchParams.set("q", params.q);
  if (params.status?.length) params.status.forEach((s) => url.searchParams.append("status[]", s));
  if (params.formation) url.searchParams.set("formation", params.formation);
  if (params.date_from) url.searchParams.set("date_from", params.date_from);
  if (params.date_to) url.searchParams.set("date_to", params.date_to);
  return url.toString();
}

/** Export URL for ENA leads — filter pipeline matches the admin list query. */
export function buildConcoursExportUrl(params: ConcoursListParams = {}, format: ExportFormat = "csv"): string {
  const url = new URL(
    `/api/v1/admin/registrations-concours/export.${format}`,
    (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000",
  );
  if (params.q) url.searchParams.set("q", params.q);
  if (params.status?.length) params.status.forEach((s) => url.searchParams.append("status[]", s));
  if (params.priority?.length) params.priority.forEach((p) => url.searchParams.append("priority[]", p));
  if (params.filiere) url.searchParams.set("filiere", params.filiere);
  if (params.city) url.searchParams.set("city", params.city);
  if (params.regional_grade) url.searchParams.set("regional_grade", params.regional_grade);
  if (params.preferred_format) url.searchParams.set("preferred_format", params.preferred_format);
  if (params.date_from) url.searchParams.set("date_from", params.date_from);
  if (params.date_to) url.searchParams.set("date_to", params.date_to);
  return url.toString();
}
