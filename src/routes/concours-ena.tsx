import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Award, Check, ChevronDown, Compass, GraduationCap, MessageCircle, Phone, Sparkles, Target, User, Volume2, VolumeX } from "lucide-react";

// Standalone ad landing page — /concours-ena.
// __root.tsx hides the global Header / Footer / WhatsApp button on this
// route so the form is the only call to action.

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.lionsacademie.com").replace(/\/$/, "");

export const Route = createFileRoute("/concours-ena")({
  // Settings (video URLs) are fetched at the route level so the page can
  // SSR cleanly. If the settings endpoint fails, we degrade gracefully:
  // sections without a video are simply not rendered.
  loader: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/concours-settings`, {
        headers: { Accept: "application/json" },
      });
      const body = await res.json() as { success: boolean; data: ConcoursSettings };
      return body.success ? body.data : EMPTY_SETTINGS;
    } catch {
      return EMPTY_SETTINGS;
    }
  },
  head: () => ({
    meta: [
      { title: "Préparation au Concours ENA — Lions Academie" },
      { name: "description", content: "Préparez le concours d'entrée des Écoles Nationales d'Architecture avec Lions Academie : méthode éprouvée, suivi personnalisé, présentiel à Marrakech ou en ligne." },
      { property: "og:title", content: "Préparation au Concours ENA — Lions Academie" },
      { property: "og:description", content: "Méthode éprouvée pour le concours ENA. Présentiel à Marrakech ou en ligne." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ConcoursLandingPage,
});

interface ConcoursSettings {
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
}

const EMPTY_SETTINGS: ConcoursSettings = {
  hero_video_url: null, hero_video_poster_url: null,
  explainer_video_url: null, explainer_video_poster_url: null, explainer_title: null,
  testimonial_1_url: null, testimonial_1_poster_url: null, testimonial_1_label: null,
  testimonial_2_url: null, testimonial_2_poster_url: null, testimonial_2_label: null,
};

// ---- Static option lists (mirror the backend enums) --------------------

const FILIERES = [
  { value: "sciences_math_a", label: "Sciences Mathématiques A" },
  { value: "sciences_math_b", label: "Sciences Mathématiques B" },
  { value: "sciences_physiques", label: "Sciences Physiques" },
  { value: "svt", label: "Sciences de la Vie et de la Terre (SVT)" },
  { value: "sciences_economiques", label: "Sciences Économiques" },
  { value: "arts_appliques", label: "Arts Appliqués" },
  { value: "st_electriques", label: "Sciences et Technologies Électriques" },
  { value: "st_mecaniques", label: "Sciences et Technologies Mécaniques" },
  { value: "autre", label: "Autre" },
];

const GRADES = [
  { value: "below_12", label: "Moins de 12/20" },
  { value: "12_to_14", label: "Entre 12/20 et 14/20" },
  { value: "14_to_16", label: "Entre 14/20 et 16/20" },
  { value: "above_16", label: "Plus de 16/20" },
];

const CITIES = [
  "Agadir", "Marrakech", "Casablanca", "Rabat", "Tanger", "Fès", "Meknès", "Oujda",
  "Kénitra", "El Jadida", "Safi", "Essaouira", "Beni Mellal", "Tétouan", "Nador",
  "Laâyoune", "Dakhla", "Guelmim", "Taroudant", "Tiznit", "Autre",
];

const FORMATS = [
  { value: "in_person_marrakech", label: "Présentiel à Marrakech", hint: "Atelier hebdomadaire en studio" },
  { value: "online", label: "En ligne", hint: "Suivi à distance, cours et corrections en visio" },
  { value: "online_from_other_city", label: "J'habite dans une autre ville", hint: "Uniquement en ligne" },
];

// ------------------------------------------------------------------------

function ConcoursLandingPage() {
  const settings = Route.useLoaderData();

  return (
    <div style={{ background: "var(--ivory)" }} className="min-h-screen">
      <HeroSection settings={settings} />
      <FormSection />
      {settings.explainer_video_url && <ExplainerSection settings={settings} />}
      {(settings.testimonial_1_url || settings.testimonial_2_url) && (
        <TestimonialsSection settings={settings} />
      )}
      <LandingFooter />
    </div>
  );
}

// ---- HERO ---------------------------------------------------------------

function HeroSection({ settings }: { settings: ConcoursSettings }) {
  function scrollToForm() {
    document.getElementById("ena-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="relative overflow-hidden">
      <div className="container-page pt-10 pb-12 sm:pt-16 sm:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="eyebrow">Préparation · Concours ENA</span>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            Réussissez le concours d'entrée des{" "}
            <em className="not-italic" style={{ color: "var(--gold)" }}>Écoles Nationales d'Architecture</em>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Une préparation structurée, encadrée par des architectes, pour aborder sereinement le concours
            ENA. Présentiel à Marrakech ou suivi à distance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={scrollToForm} className="btn-gold">
              Je m'inscris à la préparation <ArrowRight size={16} />
            </button>
            <a
              href="#explainer"
              onClick={(e) => {
                if (!settings.explainer_video_url) {
                  e.preventDefault();
                  scrollToForm();
                }
              }}
              className="btn-outline-ink"
            >
              Découvrir la méthode
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 max-w-md gap-6 border-t border-border pt-6">
            <Stat n="100%" label="taux d'encadrement" />
            <Stat n="2" label="formats au choix" />
            <Stat n="ENA" label="objectif unique" />
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-4 rounded-3xl"
            style={{ background: "var(--gradient-gold)", opacity: 0.16, filter: "blur(40px)" }}
          />
          <div
            className="relative rounded-3xl overflow-hidden border border-border aspect-[4/5] lg:aspect-[3/4]"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            {settings.hero_video_url ? (
              <HeroVideo url={settings.hero_video_url} poster={settings.hero_video_poster_url} />
            ) : (
              <div
                className="w-full h-full grid place-items-center text-sm"
                style={{ background: "var(--gradient-ink)", color: "color-mix(in oklab, var(--ivory) 60%, transparent)" }}
              >
                <div className="text-center px-6">
                  <Sparkles size={32} className="mx-auto mb-3" style={{ color: "var(--gold)" }} />
                  <p className="font-display text-2xl">Concours ENA</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em]">Préparation Lions Academie</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={scrollToForm}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium animate-bounce"
            style={{ background: "var(--ink)", color: "var(--ivory)" }}
          >
            Démarrer ma préparation <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl">{n}</div>
      <div className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</div>
    </div>
  );
}

/**
 * Autoplay-muted-loop hero with a click-to-unmute toggle.
 *
 * Browsers block autoplay when audio is enabled, so the video MUST start
 * muted to actually play. The "Activer le son" button below is a single
 * user gesture that unmutes the existing playing video without restarting
 * it — every browser allows this.
 */
function HeroVideo({ url, poster }: { url: string; poster: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    // Some browsers pause when an autoplay-muted video is unmuted from a
    // distant user gesture. Defensive: kick playback back on.
    if (el.paused) el.play().catch(() => { /* ignored */ });
  }

  return (
    <>
      <video
        ref={ref}
        src={url}
        poster={poster ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        title={muted ? "Activer le son" : "Couper le son"}
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors backdrop-blur-sm"
        style={{
          background: "color-mix(in oklab, var(--ink) 75%, transparent)",
          color: "var(--ivory)",
        }}
      >
        {muted ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {muted ? "Activer le son" : "Couper le son"}
      </button>
    </>
  );
}

// ---- FORM ---------------------------------------------------------------

function FormSection() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [whatsappRedirect, setWhatsappRedirect] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Controlled fields so radio cards work cleanly.
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [filiere, setFiliere] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [passedBefore, setPassedBefore] = useState<"yes" | "no" | "">("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTopError(null);
    setFieldErrors({});

    if (!filiere || !grade || !city || !format || passedBefore === "") {
      setTopError("Merci de répondre à toutes les questions.");
      setSubmitting(false);
      return;
    }

    const payload = {
      full_name: fullName.trim(),
      whatsapp_phone: phone.trim(),
      email: email.trim(),
      filiere,
      regional_grade: grade,
      city,
      preferred_format: format,
      passed_ena_before: passedBefore === "yes",
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/registrations-concours`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      let body: { success: boolean; data?: { whatsapp_redirect_url?: string }; error?: { message: string; details?: Record<string, string[]> } } | null = null;
      try { body = await res.json(); } catch { /* fall through */ }

      if (!res.ok || !body?.success) {
        if (body?.error?.details) setFieldErrors(body.error.details);
        setTopError(body?.error?.message ?? `Erreur du serveur (${res.status}).`);
        return;
      }

      setWhatsappRedirect(body.data?.whatsapp_redirect_url ?? null);
      setSent(true);
      // Scroll the success card into view so mobile users see the result.
      setTimeout(() => document.getElementById("ena-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setTopError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="ena-form" className="relative scroll-mt-8">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="eyebrow">Préinscription</span>
            <h2 className="mt-4 font-display text-4xl">Démarrez votre préparation</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Remplissez le formulaire — notre équipe vous recontacte sous 48 h pour finaliser votre place.
            </p>
          </div>

          {sent ? (
            <SuccessCard whatsappRedirect={whatsappRedirect} onReset={() => { setSent(false); setWhatsappRedirect(null); }} />
          ) : (
            <form onSubmit={handleSubmit} className="card-elegant space-y-8">
              {topError && (
                <div
                  className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "color-mix(in oklab, var(--terracotta) 50%, transparent)",
                    background: "color-mix(in oklab, var(--terracotta) 8%, transparent)",
                    color: "var(--terracotta)",
                  }}
                  role="alert"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{topError}</span>
                </div>
              )}

              {/* IDENTITY */}
              <fieldset className="space-y-4">
                <Legend icon={User} text="Vos coordonnées" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField id="full_name" label="Nom et prénom *" value={fullName} onChange={setFullName} placeholder="Ex : Salma Bennani" error={fieldErrors.full_name?.[0]} autoComplete="name" />
                  <TextField id="phone" label="Numéro WhatsApp *" value={phone} onChange={setPhone} type="tel" placeholder="+212 600 000 000" error={fieldErrors.whatsapp_phone?.[0]} autoComplete="tel" />
                  <TextField id="email" label="Adresse email *" value={email} onChange={setEmail} type="email" placeholder="vous@gmail.com" error={fieldErrors.email?.[0]} autoComplete="email" className="sm:col-span-2" />
                </div>
              </fieldset>

              {/* FILIERE */}
              <fieldset>
                <Legend icon={GraduationCap} text="Votre filière *" />
                <p className="text-xs text-muted-foreground mb-3">La filière de votre bac ou de votre année actuelle.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {FILIERES.map((f) => (
                    <RadioCard key={f.value} name="filiere" value={f.value} checked={filiere === f.value} onChange={() => setFiliere(f.value)} label={f.label} />
                  ))}
                </div>
                {fieldErrors.filiere?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.filiere[0]}</p>}
              </fieldset>

              {/* GRADE */}
              <fieldset>
                <Legend icon={Award} text="Note de l'examen régional *" />
                <p className="text-xs text-muted-foreground mb-3">Approximative — pour adapter votre programme.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {GRADES.map((g) => (
                    <RadioCard key={g.value} name="grade" value={g.value} checked={grade === g.value} onChange={() => setGrade(g.value)} label={g.label} />
                  ))}
                </div>
                {fieldErrors.regional_grade?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.regional_grade[0]}</p>}
              </fieldset>

              {/* CITY */}
              <fieldset>
                <Legend icon={Compass} text="Votre ville *" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  style={fieldErrors.city?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
                  required
                >
                  <option value="" disabled>— Sélectionner une ville —</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {fieldErrors.city?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.city[0]}</p>}
              </fieldset>

              {/* FORMAT */}
              <fieldset>
                <Legend icon={Target} text="Format de préparation *" />
                <div className="grid sm:grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <RadioCard key={f.value} name="format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} label={f.label} hint={f.hint} />
                  ))}
                </div>
                {fieldErrors.preferred_format?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.preferred_format[0]}</p>}
              </fieldset>

              {/* PASSED BEFORE */}
              <fieldset>
                <Legend icon={Phone} text="Avez-vous déjà passé le concours ENA ? *" />
                <div className="grid sm:grid-cols-2 gap-2">
                  <RadioCard name="passed" value="yes" checked={passedBefore === "yes"} onChange={() => setPassedBefore("yes")} label="Oui" />
                  <RadioCard name="passed" value="no" checked={passedBefore === "no"} onChange={() => setPassedBefore("no")} label="Non" />
                </div>
              </fieldset>

              <div className="border-t pt-6 flex flex-wrap gap-3 justify-between items-center" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] text-muted-foreground max-w-md">
                  En soumettant ce formulaire, vous acceptez d'être recontacté par WhatsApp ou téléphone par notre équipe pédagogique.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Envoi…" : "Envoyer ma préinscription"}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function SuccessCard({ whatsappRedirect, onReset }: { whatsappRedirect: string | null; onReset: () => void }) {
  return (
    <div className="card-elegant text-center py-16">
      <div className="mx-auto grid place-items-center w-14 h-14 rounded-full" style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}>
        <Check size={22} />
      </div>
      <h2 className="mt-5 font-display text-2xl">Votre demande a bien été reçue</h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        Notre équipe vous recontacte sous 48 h pour confirmer votre place et organiser le démarrage.
      </p>
      <div className="mt-6 flex justify-center gap-3 flex-wrap">
        {whatsappRedirect && (
          <a
            href={whatsappRedirect}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Continuer sur WhatsApp
          </a>
        )}
        <button type="button" onClick={onReset} className="btn-outline-ink">
          Envoyer une nouvelle demande
        </button>
      </div>
    </div>
  );
}

// ---- VIDEO SECTIONS ----------------------------------------------------

function ExplainerSection({ settings }: { settings: ConcoursSettings }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Pause when scrolled out of view so the audio doesn't keep playing.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !el.paused) el.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="explainer" className="scroll-mt-8" style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <span className="eyebrow">Méthode</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              {settings.explainer_title ?? "Découvrir la formation en 60 s"}
            </h2>
          </div>

          <div
            className="mt-10 relative rounded-3xl overflow-hidden border"
            style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-elegant)" }}
          >
            <video
              ref={videoRef}
              src={settings.explainer_video_url ?? undefined}
              poster={settings.explainer_video_poster_url ?? undefined}
              controls
              loop
              preload="metadata"
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="w-full h-full aspect-video"
            />
            {!playing && (
              <button
                type="button"
                onClick={() => videoRef.current?.play()}
                className="absolute inset-0 grid place-items-center group"
                aria-label="Lire la vidéo"
              >
                <span
                  className="grid place-items-center w-20 h-20 rounded-full transition-transform group-hover:scale-110"
                  style={{ background: "var(--gradient-gold)", color: "var(--ink)", boxShadow: "var(--shadow-elegant)" }}
                >
                  <PlayIcon />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ settings }: { settings: ConcoursSettings }) {
  const items = [
    settings.testimonial_1_url ? { url: settings.testimonial_1_url, poster: settings.testimonial_1_poster_url, label: settings.testimonial_1_label } : null,
    settings.testimonial_2_url ? { url: settings.testimonial_2_url, poster: settings.testimonial_2_poster_url, label: settings.testimonial_2_label } : null,
  ].filter((x): x is { url: string; poster: string | null; label: string | null } => x !== null);

  return (
    <section>
      <div className="container-page py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Ils témoignent</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Anciens élèves, parcours réussis</h2>
          <p className="mt-4 text-muted-foreground">
            Ils ont préparé le concours avec Lions Academie.
          </p>
        </div>

        <div className={`mt-10 grid gap-6 ${items.length === 1 ? "max-w-2xl mx-auto" : "md:grid-cols-2 max-w-5xl mx-auto"}`}>
          {items.map((t, i) => (
            <TestimonialCard key={i} url={t.url} poster={t.poster} label={t.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ url, poster, label }: { url: string; poster: string | null; label: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <article className="rounded-3xl overflow-hidden border bg-card" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-soft)" }}>
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={url}
          poster={poster ?? undefined}
          controls
          loop
          preload="metadata"
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="w-full h-full object-cover"
        />
        {!playing && (
          <button
            type="button"
            onClick={() => videoRef.current?.play()}
            className="absolute inset-0 grid place-items-center group"
            aria-label="Lire la vidéo"
          >
            <span
              className="grid place-items-center w-14 h-14 rounded-full transition-transform group-hover:scale-110"
              style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}
            >
              <PlayIcon />
            </span>
          </button>
        )}
      </div>
      {label && (
        <div className="p-4">
          <p className="text-sm font-medium">{label}</p>
        </div>
      )}
    </article>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// ---- FOOTER -------------------------------------------------------------

function LandingFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="container-page py-10 text-center">
        <div className="font-display text-lg">Lions Academie</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Préparation au concours ENA — © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ---- FORM PRIMITIVES ---------------------------------------------------

function Legend({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <legend className="flex items-center gap-2 mb-2">
      <span className="grid place-items-center w-7 h-7 rounded-lg" style={{ background: "color-mix(in oklab, var(--gold) 20%, transparent)" }}>
        <Icon size={14} />
      </span>
      <span className="font-display text-base">{text}</span>
    </legend>
  );
}

function TextField({
  id, label, value, onChange, type = "text", placeholder, error, autoComplete, className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        style={error ? { borderColor: "var(--terracotta)" } : undefined}
      />
      {error && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{error}</p>}
    </div>
  );
}

function RadioCard({
  name, value, checked, onChange, label, hint,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label
      className="relative cursor-pointer rounded-xl border bg-card px-4 py-3 transition-all hover:border-foreground"
      style={
        checked
          ? { borderColor: "var(--ink)", background: "color-mix(in oklab, var(--gold) 10%, transparent)" }
          : { borderColor: "var(--border)" }
      }
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className="flex items-start gap-3">
        <span
          className="grid place-items-center w-5 h-5 rounded-full border shrink-0 mt-0.5"
          style={{
            borderColor: checked ? "var(--gold)" : "color-mix(in oklab, var(--ink) 20%, transparent)",
          }}
        >
          {checked && <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold)" }} />}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{label}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
        </div>
      </div>
    </label>
  );
}
