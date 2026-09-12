"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { archive as archiveCopy } from "@/lib/copy";
import type { ArchiveFacets } from "@/server/services/search.service";

export type ArchiveFilterValues = {
  q: string;
  year: string;
  area: string;
  event: string;
  skill: string;
};

type ArchiveFiltersProps = {
  action: string;
  facets: ArchiveFacets;
  values: ArchiveFilterValues;
};

export function ArchiveFilters({ action, facets, values }: ArchiveFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasFilters = Object.values(values).some((value) => value !== "");

  function submit() {
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      method="get"
      action={action}
      className="lp-sticker lp-sticker-soft grid gap-3 bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-5">
        <Label htmlFor="archive-q">{archiveCopy.searchLabel}</Label>
        <Input
          id="archive-q"
          name="q"
          defaultValue={values.q}
          maxLength={80}
          placeholder="Ex.: enchentes"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="archive-year">{archiveCopy.yearLabel}</Label>
        <Select id="archive-year" name="year" defaultValue={values.year} onChange={submit}>
          <option value="">{archiveCopy.allOption}</option>
          {facets.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="archive-area">{archiveCopy.areaLabel}</Label>
        <Select id="archive-area" name="area" defaultValue={values.area} onChange={submit}>
          <option value="">{archiveCopy.allOption}</option>
          {facets.areas.map((area) => (
            <option key={area.area} value={area.area}>
              {area.area} ({area.count})
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="archive-event">{archiveCopy.eventLabel}</Label>
        <Select id="archive-event" name="event" defaultValue={values.event} onChange={submit}>
          <option value="">{archiveCopy.allOption}</option>
          {facets.events.map((event) => (
            <option key={event.slug} value={event.slug}>
              {event.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="archive-skill">{archiveCopy.skillLabel}</Label>
        <Select id="archive-skill" name="skill" defaultValue={values.skill} onChange={submit}>
          <option value="">{archiveCopy.allOption}</option>
          {facets.skills.map((skill) => (
            <option key={skill.slug} value={skill.slug}>
              {skill.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-end gap-3">
        <Button type="submit" variant="secondary">
          {archiveCopy.applyFilters}
        </Button>
        {hasFilters ? (
          <Link href={action} className="text-sm text-brand hover:text-brand-hover">
            {archiveCopy.clearFilters}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
