import {
  Award,
  BookOpen,
  Code2,
  FlaskConical,
  Leaf,
  Lightbulb,
  Medal,
  Microscope,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type {
  BadgeType,
  EventType,
  EvidenceType,
  ProjectStatus,
  Role,
  SkillCategory,
  Visibility,
} from "@prisma/client";

export const INTERESTS = [
  "Desenvolvimento de Sistemas",
  "Ciência de Dados",
  "Inteligência Artificial",
  "Robótica",
  "Design",
  "Ciências",
  "Empreendedorismo",
  "Sustentabilidade",
  "Comunicação",
  "Pesquisa",
] as const;

export const AREAS = INTERESTS;

export type Interest = (typeof INTERESTS)[number];

export const GRADE_YEARS = ["1º ano", "2º ano", "3º ano", "4º ano"] as const;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  SCIENCE_FAIR: "Feira de Ciências",
  HACKATHON: "Hackathon",
  CULTURAL_SHOW: "Mostra Cultural",
  INTEGRATED_PROJECT: "Projeto Integrador",
  COMPETITION: "Competição",
  OLYMPIAD: "Olimpíada",
  OTHER: "Outro",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Rascunho",
  SUBMITTED: "Em análise",
  APPROVED: "Verificado",
  CHANGES_REQUESTED: "Ajustes solicitados",
  ARCHIVED: "Arquivado",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PRIVATE: "Privado",
  SCHOOL: "Escola",
  PUBLIC: "Público",
};

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  TECHNICAL: "Técnica",
  SOFT_SKILL: "Socioemocional",
  ACADEMIC: "Acadêmica",
};

export const EVIDENCE_TYPES = [
  "LINK",
  "GITHUB",
  "WEBSITE",
  "VIDEO",
  "IMAGE",
  "DOCUMENT",
  "PRESENTATION",
  "OTHER",
] as const satisfies readonly EvidenceType[];

export const FILE_EVIDENCE_TYPES = ["IMAGE", "DOCUMENT", "PRESENTATION"] as const satisfies
  readonly EvidenceType[];

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  DOCUMENT: "Documento",
  LINK: "Link",
  GITHUB: "Repositório",
  WEBSITE: "Site",
  PRESENTATION: "Apresentação",
  OTHER: "Outro",
};

export const BADGE_TYPE_LABELS: Record<BadgeType, string> = {
  HIGHLIGHT: "Destaque",
  EVENT: "Evento",
  ACADEMIC: "Acadêmica",
  SPECIAL: "Especial",
};

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Estudante",
  TEACHER: "Professor",
  ADMIN: "Administração",
};

export const BADGE_ICON_KEYS = [
  "trophy",
  "medal",
  "award",
  "code",
  "flask-conical",
  "microscope",
  "lightbulb",
  "book-open",
  "users",
  "leaf",
] as const;

export type BadgeIconKey = (typeof BADGE_ICON_KEYS)[number];

export const BADGE_ICONS: Record<BadgeIconKey, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  code: Code2,
  "flask-conical": FlaskConical,
  microscope: Microscope,
  lightbulb: Lightbulb,
  "book-open": BookOpen,
  users: Users,
  leaf: Leaf,
};

export const BADGE_ICON_LABELS: Record<BadgeIconKey, string> = {
  trophy: "Troféu",
  medal: "Medalha",
  award: "Selo",
  code: "Código",
  "flask-conical": "Experimento",
  microscope: "Pesquisa",
  lightbulb: "Ideia",
  "book-open": "Estudo",
  users: "Equipe",
  leaf: "Sustentabilidade",
};

export const BADGE_ICON_FALLBACK: LucideIcon = Award;

export function badgeIcon(icon: string): LucideIcon {
  return BADGE_ICONS[icon as BadgeIconKey] ?? BADGE_ICON_FALLBACK;
}
