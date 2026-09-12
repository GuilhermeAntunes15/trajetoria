import type { Metadata } from "next";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionTitle } from "@/components/common/SectionTitle";
import { EventCard, type EventCardData } from "@/components/event/EventCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { empty, events as eventsCopy } from "@/lib/copy";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "Eventos" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const viewer = await getViewer();
  const isStaff = viewer?.role === "TEACHER" || viewer?.role === "ADMIN";

  const events = await prisma.event.findMany({
    where: viewer
      ? { schoolId: viewer.schoolId }
      : { entries: { some: { project: { status: "APPROVED", visibility: "PUBLIC" } } } },
    orderBy: { startDate: "desc" },
    take: 48,
    select: {
      slug: true,
      name: true,
      description: true,
      type: true,
      startDate: true,
      endDate: true,
      location: true,
      _count: { select: { entries: true } },
    },
  });

  const cards: EventCardData[] = events.map((event) => ({
    slug: event.slug,
    name: event.name,
    description: event.description,
    type: event.type,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location,
    projectCount: event._count.entries,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = cards
    .filter((event) => (event.endDate ?? event.startDate) >= today)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const past = cards.filter((event) => (event.endDate ?? event.startDate) < today);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Agenda da escola"
        accent="var(--color-lp-sun)"
        title={eventsCopy.title}
        description={eventsCopy.subtitle}
        actions={
          isStaff ? (
            <ButtonLink href="/teacher/events/new" size="sm">
              {eventsCopy.newEvent}
            </ButtonLink>
          ) : null
        }
      />

      {cards.length === 0 ? (
        <EmptyState title={empty.events.title} text={empty.events.text} illustration="map" />
      ) : null}

      {upcoming.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle variant="display">{eventsCopy.upcoming}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle variant="display">{eventsCopy.past}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
