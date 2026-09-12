import type { Metadata } from "next";
import { PageHeader } from "@/components/common/PageHeader";
import { EventForm } from "@/components/event/EventForm";
import { events as eventsCopy } from "@/lib/copy";
import { requireRole } from "@/lib/session";

export const metadata: Metadata = { title: "Novo evento" };
export const dynamic = "force-dynamic";

export default async function AdminNewEventPage() {
  await requireRole(["ADMIN"], "/admin/events/new");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={eventsCopy.createTitle} description={eventsCopy.createSubtitle} />
      <EventForm mode="create" returnTo="/admin/events" />
    </div>
  );
}
