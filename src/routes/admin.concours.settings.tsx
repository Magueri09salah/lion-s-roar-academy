import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Image as ImageIcon, Save, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiClientError } from "@/lib/admin/api";
import {
  useAdminConcoursSettingsQuery,
  useUpdateConcoursSettingsMutation,
  useUploadMediaMutation,
  useUploadVideoMutation,
} from "@/lib/admin/queries";
import type { ConcoursSettings, UpdateConcoursSettingsPayload } from "@/lib/admin/types";

// Admin editor for the four video slots on the /concours-ena landing page.
// Each slot supports uploading a video file (200 MB max, mp4/webm/mov)
// AND a poster thumbnail image. Marketing can clear any field to hide
// that section on the live site.

export const Route = createFileRoute("/admin/concours/settings")({
  component: ConcoursSettingsPage,
  head: () => ({
    meta: [
      { title: "Vidéos du landing Concours — Lions Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ConcoursSettingsPage() {
  const { data, isLoading } = useAdminConcoursSettingsQuery();
  const update = useUpdateConcoursSettingsMutation();

  const [form, setForm] = useState<UpdateConcoursSettingsPayload>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Seed local form state once we have the canonical settings from the server.
  useEffect(() => {
    if (data) setForm(toPayload(data));
  }, [data]);

  function setField<K extends keyof UpdateConcoursSettingsPayload>(key: K, value: UpdateConcoursSettingsPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    update.mutate(form, {
      onSuccess: () => toast.success("Paramètres enregistrés"),
      onError: (err) => {
        if (err instanceof ApiClientError) setServerError(err.message);
        toast.error(err instanceof Error ? err.message : "Action impossible");
      },
    });
  }

  return (
    <AdminShell
      eyebrow="Marketing"
      title="Vidéos du landing Concours"
      actions={
        <Link to="/admin/concours" className="btn-outline-ink !px-4 !py-2 text-sm inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Retour aux leads
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        Téléversez ou remplacez les vidéos affichées sur la page publique <em>/concours-ena</em>.
      </p>

      {isLoading ? (
        <div className="card-elegant text-sm text-muted-foreground">Chargement des paramètres…</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)", background: "color-mix(in oklab, var(--terracotta) 8%, transparent)", color: "var(--terracotta)" }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Hero */}
          <VideoSlot
            title="Vidéo hero"
            description="Affichée à droite du titre principal. Conseil : 10-20 s, sans son, ambiance."
            videoUrl={form.hero_video_url ?? null}
            posterUrl={form.hero_video_poster_url ?? null}
            onVideoChange={(url) => setField("hero_video_url", url)}
            onPosterChange={(url) => setField("hero_video_poster_url", url)}
          />

          {/* Explainer */}
          <VideoSlot
            title="Vidéo explicative (sous le formulaire)"
            description="Présente la méthode. Conseil : 30-90 s, avec son et voix-off."
            videoUrl={form.explainer_video_url ?? null}
            posterUrl={form.explainer_video_poster_url ?? null}
            onVideoChange={(url) => setField("explainer_video_url", url)}
            onPosterChange={(url) => setField("explainer_video_poster_url", url)}
          >
            <LabelField
              id="explainer_title"
              label="Titre de la section"
              value={form.explainer_title ?? ""}
              onChange={(v) => setField("explainer_title", v || null)}
              placeholder="Découvrir la formation en 60 s"
            />
          </VideoSlot>

          {/* Testimonials */}
          <VideoSlot
            title="Témoignage 1"
            description="Vidéo d'un ancien élève."
            videoUrl={form.testimonial_1_url ?? null}
            posterUrl={form.testimonial_1_poster_url ?? null}
            onVideoChange={(url) => setField("testimonial_1_url", url)}
            onPosterChange={(url) => setField("testimonial_1_poster_url", url)}
          >
            <LabelField
              id="testimonial_1_label"
              label="Légende affichée sous la vidéo"
              value={form.testimonial_1_label ?? ""}
              onChange={(v) => setField("testimonial_1_label", v || null)}
              placeholder="Nom — Promotion / École"
            />
          </VideoSlot>

          <VideoSlot
            title="Témoignage 2"
            description="Deuxième vidéo (optionnelle)."
            videoUrl={form.testimonial_2_url ?? null}
            posterUrl={form.testimonial_2_poster_url ?? null}
            onVideoChange={(url) => setField("testimonial_2_url", url)}
            onPosterChange={(url) => setField("testimonial_2_poster_url", url)}
          >
            <LabelField
              id="testimonial_2_label"
              label="Légende affichée sous la vidéo"
              value={form.testimonial_2_label ?? ""}
              onChange={(v) => setField("testimonial_2_label", v || null)}
              placeholder="Nom — Promotion / École"
            />
          </VideoSlot>

          <div className="sticky bottom-0 -mx-5 sm:-mx-8 border-t backdrop-blur-md px-5 sm:px-8 py-4 flex justify-end" style={{ background: "color-mix(in oklab, var(--ivory) 85%, transparent)", borderColor: "var(--border)" }}>
            <button type="submit" disabled={update.isPending} className="btn-gold inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Save size={14} />
              {update.isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}

function toPayload(s: ConcoursSettings): UpdateConcoursSettingsPayload {
  return {
    hero_video_url: s.hero_video_url,
    hero_video_poster_url: s.hero_video_poster_url,
    explainer_video_url: s.explainer_video_url,
    explainer_video_poster_url: s.explainer_video_poster_url,
    explainer_title: s.explainer_title,
    testimonial_1_url: s.testimonial_1_url,
    testimonial_1_poster_url: s.testimonial_1_poster_url,
    testimonial_1_label: s.testimonial_1_label,
    testimonial_2_url: s.testimonial_2_url,
    testimonial_2_poster_url: s.testimonial_2_poster_url,
    testimonial_2_label: s.testimonial_2_label,
  };
}

function VideoSlot({
  title,
  description,
  videoUrl,
  posterUrl,
  onVideoChange,
  onPosterChange,
  children,
}: {
  title: string;
  description: string;
  videoUrl: string | null;
  posterUrl: string | null;
  onVideoChange: (url: string | null) => void;
  onPosterChange: (url: string | null) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="card-elegant">
      <header>
        <h2 className="font-display text-lg flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: "color-mix(in oklab, var(--gold) 22%, transparent)" }}>
            <Video size={15} />
          </span>
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </header>

      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <VideoUploader currentUrl={videoUrl} onChange={onVideoChange} />
        <PosterUploader currentUrl={posterUrl} onChange={onPosterChange} />
      </div>

      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}

function VideoUploader({ currentUrl, onChange }: { currentUrl: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadVideoMutation();

  function handlePick() { inputRef.current?.click(); }
  function handleChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload.mutate(
      { file, folder: "concours/videos", alt: "Vidéo landing concours" },
      {
        onSuccess: (media) => { onChange(media.url); toast.success("Vidéo téléversée"); },
        onError: (err) => {
          const msg = err instanceof ApiClientError
            ? (err.details?.file?.[0] ?? err.message)
            : (err instanceof Error ? err.message : "Téléversement échoué");
          toast.error(msg);
        },
      },
    );
  }

  return (
    <div>
      <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Fichier vidéo</span>

      <div className="rounded-xl border bg-card overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {currentUrl ? (
          <video src={currentUrl} controls preload="metadata" playsInline className="w-full aspect-video bg-muted/40" />
        ) : (
          <div className="aspect-video grid place-items-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Video size={14} /> Aucune vidéo</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button type="button" onClick={handlePick} disabled={upload.isPending} className="btn-outline-ink !px-3 !py-1.5 text-xs inline-flex items-center gap-2 disabled:opacity-50">
          <Upload size={12} />
          {upload.isPending ? "Téléversement…" : currentUrl ? "Remplacer" : "Téléverser"}
        </button>
        {currentUrl && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-xs underline text-muted-foreground hover:text-foreground">
            <X size={12} /> Retirer
          </button>
        )}
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" className="sr-only" onChange={handleChosen} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">MP4 / WebM / MOV. 200 Mo max.</p>
    </div>
  );
}

function PosterUploader({ currentUrl, onChange }: { currentUrl: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMediaMutation();

  function handlePick() { inputRef.current?.click(); }
  function handleChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload.mutate(
      { file, folder: "concours/posters", alt: "Poster vidéo landing concours" },
      {
        onSuccess: (media) => { onChange(media.url); toast.success("Poster téléversé"); },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Téléversement échoué"),
      },
    );
  }

  return (
    <div>
      <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Poster (image)</span>

      <div className="rounded-xl border bg-card overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {currentUrl ? (
          <img src={currentUrl} alt="Poster" className="w-full aspect-video object-cover bg-muted/40" />
        ) : (
          <div className="aspect-video grid place-items-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><ImageIcon size={14} /> Aucun poster</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <button type="button" onClick={handlePick} disabled={upload.isPending} className="btn-outline-ink !px-3 !py-1.5 text-xs inline-flex items-center gap-2 disabled:opacity-50">
          <Upload size={12} />
          {upload.isPending ? "Téléversement…" : currentUrl ? "Remplacer" : "Téléverser"}
        </button>
        {currentUrl && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-xs underline text-muted-foreground hover:text-foreground">
            <X size={12} /> Retirer
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChosen} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">JPG / PNG / WebP. Affichée avant la lecture.</p>
    </div>
  );
}

function LabelField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={150}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
