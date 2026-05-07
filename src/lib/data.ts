import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";

export const PRINCIPLES = [
  { title: "Formation à distance", desc: "Apprenez à votre rythme depuis n'importe quelle ville, avec un suivi personnalisé." },
  { title: "Apprentissage métier", desc: "Une pédagogie orientée vers les besoins réels du terrain professionnel." },
  { title: "Logiciels professionnels", desc: "Maîtrisez AutoCAD, SketchUp et les outils de rendu utilisés en agence." },
  { title: "Culture architecturale", desc: "Histoire, mouvements, styles et symbolique des formes pour penser l'espace." },
  { title: "Ateliers pratiques", desc: "Exercices concrets, rendus mensuels et corrections individuelles." },
  { title: "Certification sérieuse", desc: "Le certificat est délivré uniquement après validation des rendus et du PFF." },
];

export const FORMATIONS = [
  {
    slug: "architecture-interieur",
    title: "Architecture d'intérieur & décoration",
    duration: "6 mois",
    format: "À distance",
    level: "Débutant accepté",
    cover: p1,
    summary: "Une formation complète et structurée pour concevoir, modéliser et présenter un projet d'aménagement intérieur de A à Z.",
    objectives: [
      "Comprendre les bases de l'architecture d'intérieur",
      "Lire et produire des plans simples",
      "Maîtriser les logiciels professionnels",
      "Concevoir une ambiance et un moodboard",
      "Présenter et défendre un projet",
    ],
    categories: [
      { title: "Logiciels & techniques", items: ["AutoCAD : plans 2D, cotations, mobilier", "SketchUp : modélisation 3D, scènes, exports", "Outils de présentation"] },
      { title: "Théorie & culture", items: ["Histoire de l'architecture", "Mouvements artistiques & styles décoratifs", "Symbolique des formes et des couleurs"] },
      { title: "Ateliers pratiques", items: ["Rendus mensuels corrigés", "Moodboards et planches", "Projet de Fin de Formation"] },
    ],
  },
];

export const PROGRAM = [
  { month: "Mois 1", title: "Fondations", items: ["Introduction au métier", "Bases du dessin technique", "Premiers pas sur AutoCAD"] },
  { month: "Mois 2", title: "Plans & espaces", items: ["Lecture et production de plans", "Mobilier et circulations", "Premier rendu : plan d'aménagement"] },
  { month: "Mois 3", title: "Modélisation 3D", items: ["Initiation SketchUp", "Volumes et matériaux", "Rendu : modélisation d'une pièce"] },
  { month: "Mois 4", title: "Culture & ambiance", items: ["Styles décoratifs", "Moodboards et palettes", "Rendu : moodboard thématique"] },
  { month: "Mois 5", title: "Présentation", items: ["Planches de présentation", "Storytelling visuel", "Rendu : planche complète"] },
  { month: "Mois 6", title: "Projet de Fin de Formation", items: ["Conception complète", "Plans, 3D et moodboard", "Soutenance & certification"] },
];

export const PROJECTS = [
  { id: "1", title: "Salon contemporain ivoire", student: "Sara M.", category: "Rendu 3D", cover: p1 },
  { id: "2", title: "Moodboard matières naturelles", student: "Yassine B.", category: "Moodboard", cover: p2 },
  { id: "3", title: "Chambre arche premium", student: "Imane F.", category: "Projet de fin", cover: p3 },
  { id: "4", title: "Cuisine bois & laiton", student: "Mehdi A.", category: "Rendu 3D", cover: p4 },
  { id: "5", title: "Salon contemporain (variation)", student: "Nora K.", category: "Planche", cover: p1 },
  { id: "6", title: "Cuisine ouverte ivoire", student: "Hicham R.", category: "Rendu 3D", cover: p4 },
];

export const TRAINERS = [
  { name: "Khalid Benani", role: "Architecte d'intérieur", bio: "10 ans d'expérience en agence, spécialiste des espaces résidentiels haut de gamme.", initials: "KB" },
  { name: "Salma El Idrissi", role: "Designer & formatrice 3D", bio: "Experte SketchUp et rendu, passionnée par la transmission et les ateliers pratiques.", initials: "SE" },
  { name: "Omar Tazi", role: "Architecte & enseignant", bio: "Culture architecturale, histoire des styles et pensée de l'espace.", initials: "OT" },
];
