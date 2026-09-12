"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { events as eventsCopy } from "@/lib/copy";
import { canDeleteEvent, canManageEvent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { safeRedirect } from "@/lib/redirect";
import { getViewer, type Viewer } from "@/lib/session";
import { generateUniqueSlug } from "@/lib/slug";
import { eventFormSchema, eventIdSchema } from "@/lib/validation/event.schema";

export type EventFormState = { error?: string };

function permissionViewer(viewer: Viewer) {
  return { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId };
}

function parseDate(value: string): Date | null {
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createEvent(
  input: unknown,
  returnTo?: string,
): Promise<EventFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fteacher%2Fevents");

  if (!canManageEvent(permissionViewer(viewer), viewer.schoolId)) {
    return { error: "Você não pode criar eventos nesta escola." };
  }

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const startDate = parseDate(data.startDate);
  const endDate = data.endDate ? parseDate(data.endDate) : null;
  if (!startDate) return { error: "Informe uma data válida." };

  const slug = await generateUniqueSlug(data.name, async (candidate) => {
    const existing = await prisma.event.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return existing !== null;
  });

  await prisma.event.create({
    data: {
      slug,
      name: data.name,
      description: data.description || null,
      type: data.type,
      startDate,
      endDate,
      location: data.location || null,
      coverImageUrl: data.coverImageUrl || null,
      schoolId: viewer.schoolId,
      createdById: viewer.id,
    },
  });

  revalidatePath("/events");
  revalidatePath("/teacher/events");
  revalidatePath("/admin/events");
  redirect(safeRedirect(returnTo, "/teacher/events"));
}

export async function updateEvent(
  eventId: string,
  input: unknown,
  returnTo?: string,
): Promise<EventFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fteacher%2Fevents");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, schoolId: true },
  });

  if (!event) return { error: "Evento não encontrado." };

  if (!canManageEvent(permissionViewer(viewer), event.schoolId)) {
    return { error: "Você não pode editar eventos desta escola." };
  }

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  const data = parsed.data;
  const startDate = parseDate(data.startDate);
  const endDate = data.endDate ? parseDate(data.endDate) : null;
  if (!startDate) return { error: "Informe uma data válida." };

  await prisma.event.update({
    where: { id: event.id },
    data: {
      name: data.name,
      description: data.description || null,
      type: data.type,
      startDate,
      endDate,
      location: data.location || null,
      coverImageUrl: data.coverImageUrl || null,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/teacher/events");
  revalidatePath("/admin/events");
  redirect(safeRedirect(returnTo, "/teacher/events"));
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?redirectTo=%2Fteacher%2Fevents");

  const parsed = eventIdSchema.safeParse({ eventId: formData.get("eventId") });
  if (!parsed.success) throw new Error("Evento inválido.");

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
    select: { id: true, slug: true, schoolId: true, _count: { select: { entries: true } } },
  });

  if (!event) throw new Error("Evento não encontrado.");

  if (!canDeleteEvent(permissionViewer(viewer), event.schoolId)) {
    throw new Error("Só a administração da escola pode excluir eventos.");
  }

  if (event._count.entries > 0) throw new Error(eventsCopy.deleteBlocked);

  await prisma.event.delete({ where: { id: event.id } });

  revalidatePath("/events");
  revalidatePath("/teacher/events");
  revalidatePath("/admin/events");
}
