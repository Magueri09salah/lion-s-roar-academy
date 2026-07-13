// Types mirroring the Laravel API resources (lions-academy-api).
// Kept hand-written rather than codegen so they read as the source-of-truth
// contract between frontend and backend.

export type RegistrationStatusValue =
  | "new"
  | "contacted"
  | "pending"
  | "registered"
  | "rejected";

export type StatusTone = "gold" | "ink" | "sand" | "success" | "destructive";

export interface RegistrationStatusBadge {
  value: RegistrationStatusValue;
  label: string;
  tone: StatusTone;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  role_label: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
  token_type: "Bearer";
  abilities: string[];
}

export interface FormationLite {
  id: number;
  slug: string;
  title: string;
  is_active: boolean;
}

export interface MediaAsset {
  id: number;
  url: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  original_name: string | null;
  visibility: "public" | "private";
  created_at: string;
}

export interface RegistrationListItem {
  id: number;
  full_name: string;
  email: string;
  whatsapp_phone: string;
  city: string;
  address: string | null;
  education_level: string;
  formation: { id: number | null; title: string | null };
  status: RegistrationStatusBadge;
  has_documents: boolean | null;
  submitted_at: string;
}

export interface RegistrationDetail extends RegistrationListItem {
  profession: string | null;
  message: string | null;
  privacy_accepted: boolean;
  admin_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status_changed_at: string | null;
  status_changed_by: { id: number; name: string } | null;
  documents: MediaAsset[];
  whatsapp_redirect_url: string | null;
  whatsapp_applicant_url: string | null;
  created_at: string;
  updated_at: string;
  formation: {
    id: number | null;
    title: string | null;
    detail?: FormationLite;
  };
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface RegistrationListMeta {
  pagination: PaginationMeta;
  filters: {
    q: string | null;
    status: RegistrationStatusValue[];
    formation: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
  };
  status_options: RegistrationStatusBadge[];
  status_counts: Record<RegistrationStatusValue | "all", number>;
}

// ----- API envelope -------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ----- Filter / mutation payloads ----------------------------------------

export interface RegistrationListParams {
  q?: string;
  status?: RegistrationStatusValue[];
  formation?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface UpdateRegistrationPayload {
  status?: RegistrationStatusValue;
  admin_notes?: string | null;
}

// ----- Contact messages --------------------------------------------------

export type ContactMessageStatusValue = "new" | "read" | "replied" | "archived";

export interface ContactMessageStatusBadge {
  value: ContactMessageStatusValue;
  label: string;
  tone: StatusTone;
}

export interface ContactMessageListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  preview: string;
  status: ContactMessageStatusBadge;
  submitted_at: string;
}

export interface ContactMessageDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatusBadge;
  admin_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  read_at: string | null;
  replied_at: string | null;
  handled_by: { id: number; name: string } | null;
  reply_mailto: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageListMeta {
  pagination: PaginationMeta;
  filters: {
    q: string | null;
    status: ContactMessageStatusValue[];
    date_from: string | null;
    date_to: string | null;
    sort: string;
  };
  status_options: ContactMessageStatusBadge[];
  status_counts: Record<ContactMessageStatusValue | "all", number>;
}

export interface ContactMessageListParams {
  q?: string;
  status?: ContactMessageStatusValue[];
  date_from?: string;
  date_to?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface UpdateContactMessagePayload {
  status?: ContactMessageStatusValue;
  admin_notes?: string | null;
}

// ----- Principles --------------------------------------------------------

export interface AdminPrinciple {
  id: number;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertPrinciplePayload {
  title: string;
  description: string;
  display_order?: number;
  is_active?: boolean;
}

// ----- Programme months --------------------------------------------------

export interface AdminProgramMonth {
  id: number;
  /** Formation this month belongs to (null if the formation was deleted). */
  formation: { id: number; title: string; slug: string } | null;
  position: number;
  month_label: string;
  title: string;
  axis: string;
  objective: string;
  deliverable: string;
  items: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertProgramMonthPayload {
  formation_id: number;
  position: number;
  month_label: string;
  title: string;
  axis: string;
  objective: string;
  deliverable: string;
  items?: string[];
  is_active?: boolean;
}

// ----- Trainers ----------------------------------------------------------

export interface AdminTrainer {
  id: number;
  slug: string;
  name: string;
  role: string;
  specialty: string;
  bio: string | null;
  experience: string;
  initials: string;
  photo_url: string | null;
  modules: string[];
  software: string[];
  instagram_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertTrainerPayload {
  slug: string;
  name: string;
  role: string;
  specialty: string;
  bio?: string | null;
  experience: string;
  initials: string;
  photo_url?: string | null;
  modules?: string[];
  software?: string[];
  instagram_url?: string | null;
  linkedin_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

// ----- Projects (Réalisations) -----------------------------------------

export interface AdminProject {
  id: number;
  title: string;
  student_name: string;
  promotion: string;
  category: string;
  software: string[];
  description: string | null;
  status: string;
  cover_url: string | null;
  gallery_urls: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertProjectPayload {
  title: string;
  student_name: string;
  promotion: string;
  category: string;
  status: string;
  description?: string | null;
  cover_url?: string | null;
  gallery_urls?: string[];
  software?: string[];
  display_order?: number;
  is_active?: boolean;
}

// ----- Formations (full content) ----------------------------------------

export interface AdminFormationCategory {
  title: string;
  items: string[];
}

export interface AdminFormation {
  id: number;
  slug: string;
  title: string;
  duration: string | null;
  format: string | null;
  level: string | null;
  cover_url: string | null;
  summary: string | null;
  audience: string | null;
  method: string | null;
  certification: string | null;
  objectives: string[];
  categories: AdminFormationCategory[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertFormationPayload {
  slug: string;
  title: string;
  duration?: string | null;
  format?: string | null;
  level?: string | null;
  cover_url?: string | null;
  summary?: string | null;
  audience?: string | null;
  method?: string | null;
  certification?: string | null;
  objectives?: string[];
  categories?: AdminFormationCategory[];
  display_order?: number;
  is_active?: boolean;
}

// ----- Media upload (admin) ---------------------------------------------

export interface UploadedMedia {
  id: number;
  url: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  original_name: string | null;
  visibility: "public" | "private";
  created_at: string;
}

// ----- Concours ENA (leads + landing settings) --------------------------

export type RegistrationConcoursStatusValue = "new" | "contacted" | "qualified" | "converted" | "lost";
export type RegistrationConcoursPriorityValue = "high" | "medium" | "low";

export interface RegistrationConcoursStatusBadge {
  value: RegistrationConcoursStatusValue;
  label: string;
  tone: StatusTone;
}

export interface RegistrationConcoursPriorityBadge {
  value: RegistrationConcoursPriorityValue;
  label: string;
  tone: StatusTone;
}

export interface LabelValue<T = string> {
  value: T;
  label: string;
}

export interface ConcoursListItem {
  id: number;
  full_name: string;
  email: string;
  whatsapp_phone: string;
  city: string;
  filiere: LabelValue;
  regional_grade: LabelValue;
  preferred_format: LabelValue;
  /** Architecture concours the lead is targeting (multi-select). */
  concours_vise: LabelValue[];
  status: RegistrationConcoursStatusBadge;
  priority: RegistrationConcoursPriorityBadge;
  passed_ena_before: boolean;
  submitted_at: string;
}

export interface ConcoursDetail extends ConcoursListItem {
  /** Optional free-form message from the lead. */
  message: string | null;
  admin_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  status_changed_at: string | null;
  status_changed_by: { id: number; name: string } | null;
  whatsapp_redirect_url: string | null;
  whatsapp_applicant_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConcoursListMeta {
  pagination: PaginationMeta;
  filters: {
    q: string | null;
    status: RegistrationConcoursStatusValue[];
    priority: RegistrationConcoursPriorityValue[];
    filiere: string | null;
    city: string | null;
    regional_grade: string | null;
    preferred_format: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
  };
  status_options: RegistrationConcoursStatusBadge[];
  priority_options: RegistrationConcoursPriorityBadge[];
  filiere_options: LabelValue[];
  grade_options: LabelValue[];
  format_options: LabelValue[];
  city_options: string[];
  status_counts: Record<RegistrationConcoursStatusValue | "all", number>;
  priority_counts: Record<RegistrationConcoursPriorityValue, number>;
}

export interface ConcoursListParams {
  q?: string;
  status?: RegistrationConcoursStatusValue[];
  priority?: RegistrationConcoursPriorityValue[];
  filiere?: string;
  city?: string;
  regional_grade?: string;
  preferred_format?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface UpdateConcoursPayload {
  status?: RegistrationConcoursStatusValue;
  admin_notes?: string | null;
}

export interface ConcoursSettings {
  hero_video_url: string | null;
  hero_video_poster_url: string | null;
  explainer_video_url: string | null;
  explainer_video_poster_url: string | null;
  explainer_title: string | null;
  testimonial_1_url: string | null;
  testimonial_1_poster_url: string | null;
  testimonial_1_label: string | null;
  testimonial_2_url: string | null;
  testimonial_2_poster_url: string | null;
  testimonial_2_label: string | null;
  updated_at: string | null;
}

export interface UpdateConcoursSettingsPayload {
  hero_video_url?: string | null;
  hero_video_poster_url?: string | null;
  explainer_video_url?: string | null;
  explainer_video_poster_url?: string | null;
  explainer_title?: string | null;
  testimonial_1_url?: string | null;
  testimonial_1_poster_url?: string | null;
  testimonial_1_label?: string | null;
  testimonial_2_url?: string | null;
  testimonial_2_poster_url?: string | null;
  testimonial_2_label?: string | null;
}

// Public form payload (matches backend StoreRegistrationConcoursRequest)
export interface SubmitConcoursLeadPayload {
  full_name: string;
  whatsapp_phone: string;
  email: string;
  filiere: string;
  regional_grade: string;
  city: string;
  preferred_format: string;
  passed_ena_before: boolean;
}
