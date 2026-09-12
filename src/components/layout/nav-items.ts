import {
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Library,
  PlusCircle,
  School,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function primaryNavItems(username: string): NavItem[] {
  return [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard },
    { href: "/projects", label: "Projetos", icon: FolderKanban },
    { href: "/events", label: "Eventos", icon: CalendarDays },
    { href: "/school", label: "Acervo", icon: Library },
    { href: `/u/${username}`, label: "Perfil", icon: UserRound },
  ];
}

export function managementNavItems(role: Role): NavItem[] {
  const items: NavItem[] = [];
  if (role === "TEACHER" || role === "ADMIN") {
    items.push(
      { href: "/teacher", label: "Painel do professor", icon: ShieldCheck },
      { href: "/teacher/students", label: "Estudantes", icon: Users },
      { href: "/teacher/classes", label: "Turmas", icon: School },
      { href: "/teacher/events", label: "Eventos da escola", icon: CalendarDays },
    );
  }
  if (role === "ADMIN") {
    items.push({ href: "/admin", label: "Administração", icon: Settings2 });
  }
  return items;
}

export function mobileNavItems(username: string, role: Role): NavItem[] {
  const third: NavItem =
    role === "STUDENT"
      ? { href: "/projects/new", label: "Criar", icon: PlusCircle }
      : role === "ADMIN"
        ? { href: "/admin", label: "Gestão", icon: Settings2 }
        : { href: "/teacher", label: "Validar", icon: ShieldCheck };

  return [
    { href: "/dashboard", label: "Início", icon: LayoutDashboard },
    { href: "/projects", label: "Projetos", icon: FolderKanban },
    third,
    { href: "/events", label: "Eventos", icon: CalendarDays },
    { href: `/u/${username}`, label: "Perfil", icon: UserRound },
  ];
}
