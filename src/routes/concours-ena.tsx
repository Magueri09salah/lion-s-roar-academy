import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, ArrowRight, Award, BookOpen, Check, ChevronDown, Clock, Compass,
  FileText, Headphones, Instagram, Layers, MapPin, MessageCircle, MonitorPlay, Pencil, Phone,
  Repeat, ShieldCheck, Sparkles, Target, Trophy, User, Users,
  Volume2, VolumeX,
} from "lucide-react";
import { SITE, whatsappUrl } from "@/lib/site";

// Standalone ad landing page — /concours-ena.
// __root.tsx hides the global Header / Footer / WhatsApp button on this
// route so the form is the only call to action.

const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "https://api.lionsacademie.com").replace(/\/$/, "");

// Meta (Facebook/Instagram) Pixel — provided by the client's marketing team.
// Scoped to this landing page only so admin / public site pages aren't tracked.
const META_PIXEL_ID = "1345763420815530";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

function initMetaPixel() {
  if (typeof window === "undefined") return;
  if (window.fbq) {
    window.fbq("track", "PageView");
    return;
  }
  (function (f: Window, b: Document, e: string, v: string) {
    const n: Window["fbq"] = function (...args: unknown[]) {
      if (n.callMethod) (n.callMethod as (...a: unknown[]) => void).apply(n, args);
      else (n.queue as unknown[]).push(args);
    } as Window["fbq"] & { callMethod?: unknown; queue: unknown[]; loaded: boolean; version: string; push: unknown };
    if (!f._fbq) f._fbq = n;
    (n as { push: unknown }).push = n;
    (n as { loaded: boolean }).loaded = true;
    (n as { version: string }).version = "2.0";
    (n as { queue: unknown[] }).queue = [];
    f.fbq = n;
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    // Insert before the first script tag if present; otherwise append to
    // <head>. The original Meta snippet assumes there's already a script
    // in the document, but in an SSR-hydrated app there often isn't yet
    // when this runs.
    const s = b.getElementsByTagName(e)[0];
    if (s?.parentNode) s.parentNode.insertBefore(t, s);
    else b.head.appendChild(t);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

function trackMetaLead() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead");
  }
}

export const Route = createFileRoute("/concours-ena")({
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
      { title: "Préparation concours d'architecture — Lions Academie" },
      { name: "description", content: "Prépare ton concours d'architecture avec méthode : dessin, culture générale, QCM, lecture de plans, méthodologie. Présentiel à Marrakech ou en ligne." },
      { property: "og:title", content: "Préparation concours d'architecture — Lions Academie" },
      { property: "og:description", content: "Méthode claire pour réussir ENA, UIR, SAP+D, EAC. Présentiel à Marrakech ou en ligne." },
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

const CONCOURS = [
  { value: "ena", label: "ENA — École Nationale d'Architecture" },
  { value: "uir", label: "UIR — Université Internationale de Rabat" },
  { value: "sap_d", label: "SAP+D — School of Architecture, Planning & Design" },
  { value: "eac", label: "EAC — École d'Architecture de Casablanca" },
  { value: "autre", label: "Autre concours d'architecture" },
];

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

  // Initialize Meta Pixel + fire PageView on mount. Scoped to this route only.
  // Wrapped in try/catch so a pixel-script failure never crashes the page
  // (e.g. ad-blocker rejection, network error, snippet hiccup).
  useEffect(() => {
    try { initMetaPixel(); } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Meta Pixel init failed", err);
    }
  }, []);

  return (
    <div style={{ background: "var(--ivory)" }} className="min-h-screen">
      <HeroSection settings={settings} />
      <ChiffresCles />
      <PourquoiSePreparer />
      <FormSection />
      <WhyUsSection />
      {settings.explainer_video_url && <ExplainerSection settings={settings} />}
      <ProgrammeSection />
      <CommentCaMarche />
      <TarifsSection />
      <WhatsAppSuccessSection />
      <FinalCTA />
      <LandingFooter />
      <FloatingWhatsApp />
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
      <div
        aria-hidden
        className="absolute -bottom-32 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "var(--gradient-gold)", opacity: 0.10, filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-page relative pt-8 pb-14 sm:pt-14 sm:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <UrgencyBadge />

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl leading-[1.04] font-display">
            Prépare ton concours d'architecture{" "}
            <em className="not-italic" style={{ color: "var(--gold)" }}>avec méthode</em>, pas avec le hasard.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Une préparation complète pour réussir les concours d'architecture : dessin, culture générale,
            QCM, lecture de plans, méthodologie et gestion du temps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={scrollToForm} className="btn-gold">
              Recevoir le programme <ArrowRight size={16} />
            </button>
            <a
              href={whatsappUrl("Bonjour Lions Academie, je souhaite réserver ma place pour la préparation au concours d'architecture.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-ink"
            >
              <MessageCircle size={14} /> Réserver ma place
            </a>
          </div>

          <p className="mt-5 text-xs uppercase tracking-[0.18em]" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
            Présentiel à Marrakech · Disponible à distance · Places limitées
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl"
            style={{ background: "var(--gradient-gold)", opacity: 0.18, filter: "blur(40px)" }}
          />

          <div className="absolute -top-3 -left-3 z-10 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] shadow-md"
            style={{ background: "var(--ink)", color: "var(--ivory)" }}>
            <span style={{ color: "var(--gold)" }}>●</span> Concours 2026
          </div>

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
                  <p className="font-display text-2xl">Concours d'architecture</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em]">Préparation Lions Academie</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={scrollToForm}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium animate-bounce shadow-lg"
            style={{ background: "var(--ink)", color: "var(--ivory)" }}
          >
            Recevoir le programme <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function UrgencyBadge() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]"
      style={{
        borderColor: "color-mix(in oklab, var(--gold) 50%, transparent)",
        background: "color-mix(in oklab, var(--gold) 10%, transparent)",
        color: "color-mix(in oklab, var(--ink) 85%, transparent)",
      }}
    >
      <span className="relative inline-flex w-2 h-2">
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "var(--gold)" }} />
        <span className="relative inline-block w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
      </span>
      Préparation concours d'architecture · Places limitées
    </span>
  );
}

function HeroVideo({ url, poster }: { url: string; poster: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
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

// ---- CHIFFRES CLES ------------------------------------------------------

function ChiffresCles() {
  return (
    <section style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
      <div className="container-page py-12 sm:py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          <ChiffreCard kicker="Depuis 2016" body="Une expérience confirmée dans la préparation aux concours d'architecture." />
          <ChiffreCard kicker="+10 ans" body="De méthode pédagogique et d'accompagnement individualisé." />
          <ChiffreCard kicker="Très sélectif" body="Peu de places disponibles chaque année — la méthode fait la différence." />
          <ChiffreCard kicker="Présentiel & distance" body="Une formation accessible selon le besoin de chaque étudiant." />
        </div>
      </div>
    </section>
  );
}

function ChiffreCard({ kicker, body }: { kicker: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-display text-2xl sm:text-3xl" style={{ color: "var(--ink)" }}>
        {kicker}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

// ---- POURQUOI SE PREPARER -----------------------------------------------

function PourquoiSePreparer() {
  return (
    <section className="relative">
      <div className="container-page py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="eyebrow">Pourquoi se préparer ?</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl leading-[1.1]">
              Le concours ne se limite pas au dessin.
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-5 text-base leading-relaxed" style={{ color: "color-mix(in oklab, var(--ink) 78%, transparent)" }}>
            <p>
              Il demande de la <strong>culture générale</strong>, de la <strong>logique</strong>, de la{" "}
              <strong>rapidité</strong>, une bonne <strong>lecture de plans</strong>, une vraie{" "}
              <strong>gestion du temps</strong> et une <strong>méthode de travail</strong> claire.
            </p>
            <p>
              Beaucoup d'étudiants échouent non pas par manque de niveau, mais parce qu'ils ne savent pas
              exactement quoi préparer ni comment s'organiser.
            </p>
            <p
              className="rounded-2xl border px-5 py-4"
              style={{
                borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)",
                background: "color-mix(in oklab, var(--gold) 8%, transparent)",
                color: "color-mix(in oklab, var(--ink) 88%, transparent)",
              }}
            >
              <strong>Chez Lions Academie</strong>, l'objectif est de donner à chaque étudiant une méthode
              claire, des exercices ciblés et un suivi régulier pour progresser efficacement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- WHY US -------------------------------------------------------------

const WHY_US = [
  { icon: Target, title: "Méthode claire et progressive", body: "Un parcours structuré, étape par étape, jusqu'au jour du concours." },
  { icon: Users, title: "Groupes limités", body: "Effectifs maîtrisés pour permettre un meilleur suivi de chaque étudiant." },
  { icon: Repeat, title: "Séances enregistrées", body: "Revois les cours à ton rythme — replays disponibles 24/7." },
  { icon: Compass, title: "Présentiel et à distance", body: "Marrakech en atelier ou suivi à distance partout au Maroc." },
  { icon: Pencil, title: "Corrections détaillées", body: "Chaque rendu est corrigé individuellement par votre mentor." },
  { icon: ShieldCheck, title: "Expérience depuis 2016", body: "Plus de 8 promotions accompagnées sur les concours d'architecture." },
  { icon: Headphones, title: "Accompagnement jusqu'au concours", body: "Un suivi régulier — pas seulement des cours, mais une équipe à tes côtés." },
];

function WhyUsSection() {
  return (
    <section className="relative">
      <div className="container-page py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Pourquoi choisir Lions Academie</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Sept engagements pour ta réussite.</h2>
          <p className="mt-4 text-muted-foreground">
            Une approche pensée pour t'amener au concours avec sérénité, méthode et régularité.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WHY_US.map((f) => <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <article
      className="group relative rounded-2xl border bg-card p-6 transition-all hover:-translate-y-1"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-soft)" }}
    >
      <span
        aria-hidden
        className="absolute top-0 right-0 w-12 h-12 rounded-tr-2xl"
        style={{
          background:
            "radial-gradient(circle at top right, color-mix(in oklab, var(--gold) 25%, transparent), transparent 70%)",
        }}
      />
      <span
        className="grid place-items-center w-11 h-11 rounded-xl"
        style={{ background: "color-mix(in oklab, var(--gold) 18%, transparent)" }}
      >
        <Icon size={18} style={{ color: "color-mix(in oklab, var(--ink) 90%, transparent)" }} />
      </span>
      <h3 className="mt-5 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </article>
  );
}

// ---- EXPLAINER VIDEO ----------------------------------------------------

function ExplainerSection({ settings }: { settings: ConcoursSettings }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting && !el.paused) el.pause(); },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="explainer" className="scroll-mt-8 relative" style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <span className="eyebrow">Méthode</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              {settings.explainer_title ?? "Découvrir la formation en vidéo."}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              L'approche pédagogique, le déroulement type d'une semaine, et ce que tu obtiens à la fin de
              la prépa.
            </p>
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

// ---- PROGRAMME ----------------------------------------------------------

const MODULES = [
  {
    icon: BookOpen,
    title: "Culture générale art & architecture",
    body: "Histoire de l'art, architecture, styles, références importantes et notions essentielles.",
  },
  {
    icon: Pencil,
    title: "Dessin & perspective",
    body: "Bases du dessin, construction, proportions, perspective, ombres, volumes et composition.",
  },
  {
    icon: Layers,
    title: "Dessin d'ingénieur & lecture de plans",
    body: "Plans, projections, volumes, lecture architecturale et représentation technique.",
  },
  {
    icon: FileText,
    title: "QCM",
    body: "Entraînement sur les questions fréquentes, les pièges et la rapidité de réponse.",
  },
  {
    icon: Clock,
    title: "Méthodologie concours",
    body: "Comprendre les attentes, gérer son temps et organiser son travail pendant l'épreuve.",
  },
  {
    icon: Trophy,
    title: "Corrections & suivi",
    body: "Exercices corrigés, conseils personnalisés et progression séance après séance.",
  },
];

function ProgrammeSection() {
  return (
    <section className="relative">
      <div className="container-page py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Programme de préparation</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Six volets pour couvrir l'ensemble du concours.</h2>
          <p className="mt-4 text-muted-foreground">
            Un programme conçu pour préparer chaque épreuve avec exigence et clarté.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m, i) => <ModuleCard key={m.title} n={String(i + 1).padStart(2, "0")} {...m} />)}
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ n, icon: Icon, title, body }: { n: string; icon: typeof Pencil; title: string; body: string }) {
  return (
    <article
      className="relative rounded-2xl border bg-card p-6 flex flex-col"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="font-display text-3xl leading-none"
          style={{ color: "color-mix(in oklab, var(--gold) 80%, transparent)" }}
        >
          {n}
        </span>
        <span
          className="grid place-items-center w-9 h-9 rounded-lg"
          style={{ background: "color-mix(in oklab, var(--ink) 6%, transparent)" }}
        >
          <Icon size={16} />
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{body}</p>
    </article>
  );
}

// ---- COMMENT CA MARCHE --------------------------------------------------

const STEPS = [
  { title: "Tu remplis le formulaire", body: "Nom, téléphone, ville, niveau et concours visé." },
  { title: "On te contacte", body: "L'équipe explique le programme, les horaires, les tarifs et les places disponibles." },
  { title: "Tu rejoins ton groupe", body: "En présentiel à Marrakech ou à distance, selon ton choix." },
  { title: "Tu commences ta préparation", body: "Tu suis les séances, tu t'entraînes et tu progresses avec méthode." },
];

function CommentCaMarche() {
  return (
    <section style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
      <div className="container-page py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Comment ça marche ?</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Quatre étapes simples.</h2>
          <p className="mt-4 text-muted-foreground">
            De ta première demande à ta première séance, on t'accompagne à chaque étape.
          </p>
        </div>

        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => <StepCard key={s.title} n={i + 1} title={s.title} body={s.body} isLast={i === STEPS.length - 1} />)}
        </ol>
      </div>
    </section>
  );
}

function StepCard({ n, title, body, isLast }: { n: number; title: string; body: string; isLast: boolean }) {
  return (
    <li className="relative rounded-2xl border bg-card p-6" style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-soft)" }}>
      <div
        className="grid place-items-center w-10 h-10 rounded-full font-display text-base"
        style={{ background: "var(--gradient-gold)", color: "var(--ink)" }}
      >
        {n}
      </div>
      <h3 className="mt-4 font-display text-lg leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>

      {!isLast && (
        <ArrowRight
          size={18}
          className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2"
          style={{ color: "color-mix(in oklab, var(--gold) 60%, transparent)" }}
        />
      )}
    </li>
  );
}

// ---- TARIFS / PACKS -----------------------------------------------------

function TarifsSection() {
  function scrollToForm() {
    document.getElementById("ena-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="relative">
      <div className="container-page py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Tarifs</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Choisis le format qui te convient.</h2>
          <p className="mt-4 text-muted-foreground">
            Deux packs pensés pour s'adapter à ton emploi du temps et à ta ville — corrections individuelles
            et accès vidéos inclus.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <PackCard
            tag="Présentiel"
            partner="En collaboration avec AVS"
            location="Marrakech"
            icon={MapPin}
            price={null}
            features={[
              "Corrections individuelles",
              "Accès vidéos en illimité",
              "32h de formation au total",
              "2h par session en atelier",
              "Suivi mentor architecte",
            ]}
            cta="Demander les détails"
            onClick={scrollToForm}
            highlighted
          />
          <PackCard
            tag="À distance"
            partner="En collaboration avec Jisr"
            location="Partout au Maroc"
            icon={MonitorPlay}
            price="1 000 DH"
            features={[
              "Corrections individuelles",
              "Accès vidéos en illimité",
              "32h de formation au total",
              "2h par session en visio",
              "Suivi mentor architecte",
            ]}
            cta="Demander les détails"
            onClick={scrollToForm}
          />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Tarifs susceptibles d'évoluer. Contacte-nous pour obtenir le programme complet et les disponibilités.
        </p>
      </div>
    </section>
  );
}

function PackCard({
  tag, partner, location, icon: Icon, price, features, cta, onClick, highlighted,
}: {
  tag: string;
  partner: string;
  location: string;
  icon: typeof MapPin;
  price: string | null;
  features: string[];
  cta: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <article
      className="relative rounded-3xl border p-7 flex flex-col"
      style={{
        borderColor: highlighted ? "color-mix(in oklab, var(--gold) 50%, transparent)" : "var(--border)",
        background: highlighted ? "color-mix(in oklab, var(--gold) 5%, var(--card))" : "var(--card)",
        boxShadow: "var(--shadow-elegant)",
      }}
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ background: "var(--ink)", color: "var(--ivory)" }}
        >
          <Sparkles size={11} style={{ color: "var(--gold)" }} /> Le plus complet
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Pack</div>
          <h3 className="mt-1 font-display text-2xl">{tag}</h3>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px]" style={{ color: "color-mix(in oklab, var(--ink) 55%, transparent)" }}>
            <Icon size={12} /> {location}
          </p>
        </div>
        <div className="text-right">
          {price ? (
            <>
              <div className="font-display text-3xl" style={{ color: "var(--gold)" }}>{price}</div>
              {/* <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">par session</div> */}
            </>
          ) : (
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground max-w-[120px] text-right">
              Tarif sur demande
            </div>
          )}
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span
              className="grid place-items-center w-5 h-5 rounded-full shrink-0 mt-0.5"
              style={{ background: "color-mix(in oklab, var(--gold) 20%, transparent)" }}
            >
              <Check size={11} style={{ color: "var(--ink)" }} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="text-[11px] text-muted-foreground italic">{partner}</div>
        <button
          type="button"
          onClick={onClick}
          className={highlighted ? "btn-gold w-full mt-4" : "btn-outline-ink w-full mt-4"}
        >
          {cta} <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

// ---- WHATSAPP SUCCESS GALLERY ------------------------------------------

const WA_SUCCESS = [
  { img: "/concours/wa-1.jpeg", name: "Rania El Mhamdi", label: "Admise ENA — Promo 2025" },
  { img: "/concours/wa-2.jpeg", name: "Zaynab", label: "Admise ENA — Promo 2025" },
  // { img: "/concours/wa-3.jpeg", name: "Ayoub", label: "Admis ENA — Promo 2024" },
  { img: "/concours/wa-4.jpeg", name: "Ghita", label: "Admise ENA Agadir — Promo 2025" },
];

function WhatsAppSuccessSection() {
  return (
    <section>
      <div className="container-page py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Annonces de réussite</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl">Les messages des élèves admis.</h2>
          <p className="mt-4 text-muted-foreground">
            Des conversations WhatsApp réelles avec nos étudiants après l'annonce des résultats du concours.
          </p>
        </div>

        {/* Masonry columns so each card takes its natural height — phone
            screenshots have very different aspect ratios and a regular grid
            would force shorter ones to grow with empty whitespace below. */}
        <div className="mt-12 columns-2 lg:columns-3 gap-4 sm:gap-5">
          {WA_SUCCESS.map((s, i) => (
            <div key={i} className="mb-4 sm:mb-5 break-inside-avoid">
              <WhatsAppCard {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppCard({ img, name, label }: { img: string; name: string; label: string }) {
  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border bg-card transition-transform hover:-translate-y-1"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-soft)" }}
    >
      {/* Phone screenshot — shown at its natural aspect ratio, no cropping */}
      <div className="relative" style={{ background: "var(--ivory)" }}>
        <img
          src={img}
          alt={`Conversation WhatsApp avec ${name}`}
          loading="lazy"
          className="w-full h-auto block"
        />
        {/* "Verified" badge */}
        <span
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium backdrop-blur-sm"
          style={{ background: "color-mix(in oklab, var(--ink) 80%, transparent)", color: "var(--ivory)" }}
        >
          <ShieldCheck size={9} style={{ color: "var(--gold)" }} /> Vérifié
        </span>
      </div>

      {/* Caption */}
      <div className="p-3.5 sm:p-4">
        <div className="text-xs sm:text-sm font-medium truncate">{name}</div>
        <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{label}</div>
      </div>
    </article>
  );
}

// ---- FORM ---------------------------------------------------------------

function FormSection() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [whatsappRedirect, setWhatsappRedirect] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [filiere, setFiliere] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [city, setCity] = useState<string>("");
  // Multi-select: a lead may target multiple concours at once.
  // Default to ENA so the field is never empty when the page loads.
  const [concoursVise, setConcoursVise] = useState<string[]>(["ena"]);
  function toggleConcours(value: string) {
    setConcoursVise((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }
  const [format, setFormat] = useState<string>("");
  const [passedBefore, setPassedBefore] = useState<"yes" | "no" | "">("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTopError(null);
    setFieldErrors({});

    if (!filiere || !grade || !city || concoursVise.length === 0 || !format || passedBefore === "") {
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
      concours_vise: concoursVise,
      preferred_format: format,
      message: message.trim() || null,
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
      // Fire Meta Pixel "Lead" event — conversion signal for Meta ad optimization.
      trackMetaLead();
      setTimeout(() => document.getElementById("ena-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setTopError("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="ena-form" className="relative scroll-mt-8">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 7%, transparent), transparent 70%)",
        }}
      />

      <div className="container-page relative py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="eyebrow">Formulaire d'inscription</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">Recevoir le programme — sans engagement.</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Remplis le formulaire — notre équipe te contactera rapidement pour t'envoyer le programme et
              les détails de la préparation.
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs" style={{ color: "color-mix(in oklab, var(--ink) 60%, transparent)" }}>
              <li className="inline-flex items-center gap-1.5"><Check size={13} style={{ color: "var(--gold)" }} /> 100% gratuit</li>
              <li className="inline-flex items-center gap-1.5"><Check size={13} style={{ color: "var(--gold)" }} /> Réponse rapide</li>
              <li className="inline-flex items-center gap-1.5"><Check size={13} style={{ color: "var(--gold)" }} /> Sans engagement</li>
            </ul>
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
                <Legend icon={User} text="Tes coordonnées" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField id="full_name" label="Nom et prénom *" value={fullName} onChange={setFullName} placeholder="Ex : Salma Bennani" error={fieldErrors.full_name?.[0]} autoComplete="name" />
                  <TextField id="phone" label="Numéro WhatsApp *" value={phone} onChange={setPhone} type="tel" placeholder="+212 600 000 000" error={fieldErrors.whatsapp_phone?.[0]} autoComplete="tel" />
                  <TextField id="email" label="Adresse email *" value={email} onChange={setEmail} type="email" placeholder="vous@gmail.com" error={fieldErrors.email?.[0]} autoComplete="email" className="sm:col-span-2" />
                </div>
              </fieldset>

              {/* CONCOURS VISÉ — multi-select */}
              <fieldset>
                <Legend icon={Trophy} text="Concours visé *" />
                <p className="text-xs text-muted-foreground mb-3">
                  Sélectionne un ou plusieurs concours d'architecture que tu prépares.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CONCOURS.map((c) => (
                    <CheckboxCard
                      key={c.value}
                      name="concours_vise"
                      value={c.value}
                      checked={concoursVise.includes(c.value)}
                      onChange={() => toggleConcours(c.value)}
                      label={c.label}
                    />
                  ))}
                </div>
                {fieldErrors.concours_vise?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.concours_vise[0]}</p>}
              </fieldset>

              {/* FILIERE */}
              <fieldset>
                <Legend icon={BookOpen} text="Ta filière *" />
                <p className="text-xs text-muted-foreground mb-3">La filière de ton bac ou de ton année actuelle.</p>
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
                <p className="text-xs text-muted-foreground mb-3">Approximative — pour adapter ton programme.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {GRADES.map((g) => (
                    <RadioCard key={g.value} name="grade" value={g.value} checked={grade === g.value} onChange={() => setGrade(g.value)} label={g.label} />
                  ))}
                </div>
                {fieldErrors.regional_grade?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.regional_grade[0]}</p>}
              </fieldset>

              {/* CITY */}
              <fieldset>
                <Legend icon={Compass} text="Ta ville *" />
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
                <Legend icon={Target} text="Mode souhaité *" />
                <div className="grid sm:grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <RadioCard key={f.value} name="format" value={f.value} checked={format === f.value} onChange={() => setFormat(f.value)} label={f.label} hint={f.hint} />
                  ))}
                </div>
                {fieldErrors.preferred_format?.[0] && <p className="mt-2 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.preferred_format[0]}</p>}
              </fieldset>

              {/* PASSED BEFORE */}
              <fieldset>
                <Legend icon={Phone} text="Avez-vous déjà passé un concours d'architecture ? *" />
                <div className="grid sm:grid-cols-2 gap-2">
                  <RadioCard name="passed" value="yes" checked={passedBefore === "yes"} onChange={() => setPassedBefore("yes")} label="Oui" />
                  <RadioCard name="passed" value="no" checked={passedBefore === "no"} onChange={() => setPassedBefore("no")} label="Non" />
                </div>
              </fieldset>

              {/* MESSAGE */}
              <fieldset>
                <Legend icon={MessageCircle} text="Message (facultatif)" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Une question, un contexte particulier, des disponibilités..."
                  className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  style={fieldErrors.message?.[0] ? { borderColor: "var(--terracotta)" } : undefined}
                  maxLength={2000}
                />
                {fieldErrors.message?.[0] && <p className="mt-1.5 text-xs" style={{ color: "var(--terracotta)" }}>{fieldErrors.message[0]}</p>}
              </fieldset>

              <div className="border-t pt-6 flex flex-wrap gap-3 justify-between items-center" style={{ borderColor: "var(--border)" }}>
                <p className="text-[11px] text-muted-foreground max-w-md">
                  En soumettant ce formulaire, tu acceptes d'être recontacté par WhatsApp ou téléphone par
                  notre équipe pédagogique.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Envoi…" : "Recevoir le programme"}
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
      <h2 className="mt-5 font-display text-2xl">Merci pour ton inscription</h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        Notre équipe te contactera rapidement pour t'envoyer le programme et les détails de la préparation.
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

// ---- FINAL CTA ----------------------------------------------------------

function FinalCTA() {
  function scrollToForm() {
    document.getElementById("ena-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "var(--gradient-gold)", opacity: 0.15, filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ivory) 1px, transparent 1px), linear-gradient(90deg, var(--ivory) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container-page relative py-16 sm:py-24 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{
            borderColor: "color-mix(in oklab, var(--gold) 50%, transparent)",
            background: "color-mix(in oklab, var(--gold) 12%, transparent)",
            color: "var(--gold)",
          }}
        >
          <Sparkles size={12} /> Concours d'architecture
        </span>

        <h2 className="mt-6 font-display text-4xl sm:text-5xl max-w-3xl mx-auto leading-tight">
          Ne te prépare pas au hasard. <em className="not-italic" style={{ color: "var(--gold)" }}>Prépare-toi avec une méthode claire.</em>
        </h2>

        <p className="mt-5 max-w-xl mx-auto text-base" style={{ color: "color-mix(in oklab, var(--ivory) 75%, transparent)" }}>
          Le concours d'architecture est sélectif. La différence se fait souvent dans la préparation, la
          méthode et la régularité.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button onClick={scrollToForm} className="btn-gold">
            Je réserve ma place <ArrowRight size={16} />
          </button>
          <a
            href={whatsappUrl("Bonjour Lions Academie, je souhaite avoir plus d'informations sur la préparation au concours d'architecture.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium"
            style={{ borderColor: "color-mix(in oklab, var(--ivory) 30%, transparent)", color: "var(--ivory)" }}
          >
            <MessageCircle size={16} /> Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ---- FOOTER -------------------------------------------------------------

function LandingFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="container-page py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <div className="font-display text-lg">Lions Academie</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Préparation aux concours d'architecture — © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="grid place-items-center w-9 h-9 rounded-full border transition-colors hover:bg-foreground hover:text-background"
            style={{ borderColor: "var(--border)" }}
          >
            <Instagram size={15} />
          </a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="grid place-items-center w-9 h-9 rounded-full border transition-colors hover:bg-foreground hover:text-background"
            style={{ borderColor: "var(--border)" }}
          >
            <MessageCircle size={15} />
          </a>
          <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
          <a href="/mentions-legales" className="text-xs text-muted-foreground hover:underline">Mentions légales</a>
          <a href="/confidentialite" className="text-xs text-muted-foreground hover:underline">Confidentialité</a>
        </div>
      </div>
    </footer>
  );
}

// ---- FLOATING WHATSAPP -------------------------------------------------

function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl("Bonjour Lions Academie, je souhaite avoir plus d'informations sur la préparation au concours d'architecture.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-transform hover:scale-105"
      style={{ background: "#25D366", color: "white" }}
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

// ---- PRIMITIVES --------------------------------------------------------

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

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

function CheckboxCard({
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
        type="checkbox"
        name={`${name}[]`}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className="flex items-start gap-3">
        <span
          className="grid place-items-center w-5 h-5 rounded-md border shrink-0 mt-0.5 transition-colors"
          style={{
            borderColor: checked ? "var(--gold)" : "color-mix(in oklab, var(--ink) 20%, transparent)",
            background: checked ? "var(--gold)" : "transparent",
          }}
        >
          {checked && (
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5L6.5 12L13 4.5" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{label}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
        </div>
      </div>
    </label>
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
