import p1 from "@/assets/project-1.jpg";
import p2 from "@/assets/project-2.jpg";
import p3 from "@/assets/project-3.jpg";
import p4 from "@/assets/project-4.jpg";

export const PRINCIPLES = [
  { title: "Formation accessible à distance", desc: "L'élève peut suivre les cours depuis n'importe quelle ville, sans obligation de déplacement." },
  { title: "Formation orientée métier", desc: "Former des personnes capables de comprendre un besoin client, concevoir un projet, produire des plans, créer une 3D et présenter leur travail." },
  { title: "Apprentissage par la pratique", desc: "Chaque mois, l'élève produit un rendu ou un exercice concret, corrigé individuellement." },
  { title: "Maîtrise des outils professionnels", desc: "AutoCAD, SketchUp, Photoshop, Illustrator — les logiciels essentiels du métier." },
  { title: "Culture architecturale et artistique", desc: "Mouvements architecturaux et artistiques, styles, formes, ambiances, couleurs et histoire de l'espace." },
  { title: "Sens, formes et pensée de l'espace", desc: "Relation entre formes géométriques, architecture, ressenti, symbolique, usages et expérience humaine." },
  { title: "Éthique et professionnalisme", desc: "Comprendre la responsabilité du designer envers le client, l'espace, le budget et la qualité du rendu." },
  { title: "Certification sérieuse", desc: "Le certificat est obtenu seulement après validation des rendus mensuels et du Projet de Fin de Formation." },
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
    audience: "Jeunes passionnés, étudiants, personnes en reconversion ou débutants curieux du métier.",
    method: "Cours en ligne, exercices, corrections individuelles, rendus mensuels et projet de fin de formation.",
    certification: "Certificat délivré après validation des rendus mensuels et du Projet de Fin de Formation.",
    objectives: [
      "Comprendre les bases de l'architecture d'intérieur",
      "Lire et produire des plans simples",
      "Utiliser les logiciels de base (AutoCAD, SketchUp)",
      "Modéliser un espace en 3D",
      "Créer une ambiance intérieure et un moodboard",
      "Comprendre les styles et mouvements",
      "Présenter un projet de manière professionnelle",
      "Réaliser un projet final complet",
    ],
    categories: [
      { title: "Logiciels 2D & plans", items: ["AutoCAD", "ArchiCAD", "Lecture de plans", "Plans 2D, cotations", "Coupes et élévations", "Bases du dessin architectural"] },
      { title: "3D & modélisation", items: ["SketchUp", "Modélisation d'espaces intérieurs", "Volumes et mobilier", "Matériaux et textures", "Préparation des scènes et exports"] },
      { title: "Théorie & culture architecturale", items: ["Histoire de l'architecture", "Mouvements architecturaux et artistiques", "Styles décoratifs", "Symbolique des formes", "Lumière, matière, ambiance", "Psychologie des couleurs"] },
      { title: "Infographie & présentation", items: ["Adobe Photoshop", "Adobe Illustrator", "Planches de présentation", "Moodboards", "Mise en page et identité projet"] },
      { title: "Atelier de conception", items: ["Analyse d'un besoin client", "Création d'un concept", "Choix du style et des matériaux", "Rendu mensuel corrigé", "Projet de Fin de Formation"] },
    ],
  },
];

export const PROGRAM = [
  { month: "Mois 1", title: "Bases de l'architecture d'intérieur", axis: "Bases de l'architecture d'intérieur", objective: "Comprendre l'espace, les usages et les bases du design.", deliverable: "Exercice 1", items: [] },
  { month: "Mois 2", title: "Plans 2D et logiciels", axis: "Plans 2D et logiciels", objective: "Lire et produire des plans simples.", deliverable: "Exercice 2", items: ["AutoCAD : prise en main", "Cotations et coupes", "Plan d'aménagement"] },
  { month: "Mois 3", title: "Modélisation 3D", axis: "Modélisation 3D", objective: "Créer un espace intérieur en volume.", deliverable: "Exercice 3", items: ["Initiation SketchUp", "Volumes et matériaux", "Modélisation d'une pièce"] },
  { month: "Mois 4", title: "Théorie, styles et ambiance", axis: "Théorie, styles et ambiance", objective: "Construire un concept cohérent.", deliverable: "Exercice 4", items: ["Styles décoratifs", "Moodboards et palettes", "Symbolique des formes"] },
  { month: "Mois 5", title: "Infographie et présentation", axis: "Infographie et présentation", objective: "Présenter un projet professionnellement.", deliverable: "Exercice 5", items: ["Photoshop & Illustrator", "Planches de présentation", "Storytelling visuel"] },
  { month: "Mois 6", title: "Atelier final", axis: "Préparations aux examens avec documents autorisés", objective: "Réaliser un projet complet.", deliverable: "Projet de Fin de Formation", items: ["Conception complète", "Plans, 3D et moodboard", "Soutenance & certification"] },
];

export const PROJECT_CATEGORIES = [
  "Tous",
  "Plans 2D",
  "Modélisations 3D",
  "Plan thématique",
  "Moodboards",
  // "Planches de présentation",
  "Projet de Fin de Formation",
] as const;

export const PROJECTS = [
  { id: "1", title: "Salon contemporain ivoire", student: "Sara M.", promotion: "Promo 2026", category: "Rendus", software: ["SketchUp", "Photoshop"], description: "Rendu d'ambiance d'un salon résidentiel jouant sur les tons ivoire, bois clair et touches de laiton.", status: "Rendu mensuel", cover: p1, gallery: [p1, p2] },
  { id: "2", title: "Moodboard matières naturelles", student: "Yassine B.", promotion: "Promo 2026", category: "Moodboards", software: ["Photoshop", "Illustrator"], description: "Moodboard explorant matières brutes : pierre, bois huilé, lin et terracotta.", status: "Rendu mensuel", cover: p2, gallery: [p2] },
  { id: "3", title: "Chambre arche premium", student: "Imane F.", promotion: "Promo 2026", category: "Projet de Fin de Formation", software: ["AutoCAD", "SketchUp", "Photoshop"], description: "Projet de fin de formation : chambre parentale haut de gamme avec arche en niche, dressing intégré et palette chaude.", status: "PFF", cover: p3, gallery: [p3, p1, p4] },
  { id: "4", title: "Cuisine bois & laiton", student: "Mehdi A.", promotion: "Promo 2026", category: "Modélisations 3D", software: ["SketchUp"], description: "Modélisation 3D d'une cuisine ouverte mêlant bois fumé et détails laiton brossé.", status: "Rendu mensuel", cover: p4, gallery: [p4] },
  { id: "5", title: "Plan d'aménagement T3", student: "Nora K.", promotion: "Promo 2026", category: "Plans 2D", software: ["AutoCAD"], description: "Plan d'aménagement d'un appartement T3 avec cotations, mobilier et circulations.", status: "Rendu mensuel", cover: p1, gallery: [p1] },
  { id: "6", title: "Planche de présentation cuisine", student: "Hicham R.", promotion: "Promo 2026", category: "Planches de présentation", software: ["Photoshop", "Illustrator"], description: "Planche complète : plan, vues 3D, matériaux et ambiance.", status: "Rendu mensuel", cover: p4, gallery: [p4, p2] },
];

export const TRAINERS = [
  {
    id: "kb",
    name: "Khalid Benani",
    role: "Architecte d'intérieur",
    specialty: "Espaces résidentiels haut de gamme",
    bio: "10 ans d'expérience en agence, spécialiste des espaces résidentiels haut de gamme et de la conception sur-mesure.",
    experience: "10 ans",
    modules: ["Bases de l'architecture d'intérieur", "Atelier de conception", "Projet de Fin de Formation"],
    software: ["AutoCAD", "ArchiCAD","Plan théchnique"],
    initials: "KB",
    photo: null as string | null,
    socials: { instagram: "https://instagram.com/", linkedin: "https://linkedin.com/" },
  },
  {
    id: "se",
    name: "Salma El Idrissi",
    role: "Designer & formatrice 3D",
    specialty: "Modélisation 3D et rendu",
    bio: "Experte SketchUp et rendu, passionnée par la transmission et les ateliers pratiques.",
    experience: "8 ans",
    modules: ["3D & modélisation", "Infographie & présentation"],
    software: ["SketchUp", "Photoshop", "Illustrator"],
    initials: "SE",
    photo: null as string | null,
    socials: { instagram: "https://instagram.com/", linkedin: "https://linkedin.com/" },
  },
  {
    id: "ot",
    name: "Omar Tazi",
    role: "Architecte & enseignant",
    specialty: "Culture architecturale et théorie de l'espace",
    bio: "Architecte enseignant, spécialiste de l'histoire des styles et de la pensée de l'espace.",
    experience: "15 ans",
    modules: ["Théorie & culture architecturale"],
    software: ["AutoCAD", "ArchiCAD"],
    initials: "OT",
    photo: null as string | null,
    socials: { instagram: "https://instagram.com/", linkedin: "https://linkedin.com/" },
  },
];
