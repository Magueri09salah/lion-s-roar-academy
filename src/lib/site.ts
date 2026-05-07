export const SITE = {
  name: "Lions Academy",
  tagline: "Académie d'architecture d'intérieur & décoration",
  phone: "+212 600 000 000",
  whatsapp: "212600000000",
  whatsappMessage: "Bonjour Lions Academy, je souhaite avoir plus d'informations sur la formation.",
  email: "contact@lionsacademy.ma",
  city: "Casablanca, Maroc",
  url: "https://lionsacademy.ma",
  social: {
    instagram: "https://instagram.com/lionsacademy",
    facebook: "https://facebook.com/lionsacademy",
    tiktok: "https://tiktok.com/@lionsacademy",
    youtube: "https://youtube.com/@lionsacademy",
  },
};

export const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/academie", label: "Académie" },
  { to: "/formation", label: "Formation" },
  { to: "/programme", label: "Programme" },
  { to: "/realisations", label: "Réalisations" },
  { to: "/formateurs", label: "Formateurs" },
  { to: "/contact", label: "Contact" },
] as const;

export const whatsappUrl = (msg?: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg ?? SITE.whatsappMessage)}`;