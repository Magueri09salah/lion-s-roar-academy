export const SITE = {
  name: "Lions Academie",
  tagline: "Académie d'architecture d'intérieur & décoration",
  phone: "+212 600 000 000",
  whatsapp: "212600000000",
  whatsappMessage: "Bonjour Lions Academie, je souhaite avoir plus d'informations sur la formation.",
  email: "contact@lionsacademie.ma",
  city: "Marrakech, Maroc",
  url: "https://lionsacademie.com",
  social: {
    instagram: "https://instagram.com/lionsacademie",
    facebook: "https://facebook.com/lionsacademie",
    tiktok: "https://tiktok.com/@lionsacademie",
    youtube: "https://youtube.com/@lionsacademie",
  },
};

export const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/academie", label: "Académie" },
  { to: "/formation", label: "Formation" },
  { to: "/programme", label: "Programme" },
  { to: "/realisations", label: "Réalisations des élèves" },
  { to: "/formateurs", label: "Formateurs" },
  { to: "/contact", label: "Contact" },
] as const;

export const whatsappUrl = (msg?: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg ?? SITE.whatsappMessage)}`;