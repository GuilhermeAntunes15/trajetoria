import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { EventForm } from "@/components/event/EventForm";
import { events as eventsCopy } from "@/lib/copy";
import { canManageEvent } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Editar evento" };
export const dynamic = "force-dynamic";

function toDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await requireRole(["TEACHER", "ADMIN"], "/teacher/events");

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      startDate: true,
      endDate: true,
      location: true,
      coverImageUrl: true,
      schoolId: true,
    },
  });

  if (!event) notFound();

  if (
    !canManageEvent({ id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }, event.schoolId)
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={eventsCopy.editEvent} description={event.name} />
      <EventForm
        mode="edit"
        eventId={event.id}
        defaults={{
          name: event.name,
          description: event.description ?? "",
          type: event.type,
          startDate: toDateInput(event.startDate),
          endDate: toDateInput(event.endDate),
          location: event.location ?? "",
          coverImageUrl: event.coverImageUrl ?? "",
        }}
      />
    </div>
  );
}
