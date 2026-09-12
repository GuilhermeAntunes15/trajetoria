"use client";

import { useActionState } from "react";
import type { ProjectStatus } from "@prisma/client";
import {
  addFeedbackAction,
  approveProjectAction,
  archiveProjectAction,
  requestChangesAction,
  setSkillValidationAction,
  toggleEventHighlightAction,
  toggleFeaturedAction,
  unarchiveProjectAction,
  type ReviewFormState,
} from "@/actions/validation.actions";
import { SectionTitle } from "@/components/common/SectionTitle";
import { SubmitButton } from "@/components/common/SubmitButton";
import { SkillBadge } from "@/components/project/SkillBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { review as reviewCopy } from "@/lib/copy";

export type ReviewSkill = { id: string; name: string; verified: boolean };

export type ReviewEventEntry = { id: string; eventName: string; isHighlight: boolean };

type TeacherReviewPanelProps = {
  projectId: string;
  status: ProjectStatus;
  skills: ReviewSkill[];
  isFeatured: boolean;
  canFeature: boolean;
  canArchive: boolean;
  eventEntry: ReviewEventEntry | null;
};

const initialState: ReviewFormState = {};

function FormMessages({ state }: { state: ReviewFormState }) {
  return (
    <>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
    </>
  );
}

function ApproveForm({ projectId, skills }: { projectId: string; skills: ReviewSkill[] }) {
  const [state, formAction] = useActionState(approveProjectAction, initialState);
  const pending = skills.filter((skill) => !skill.verified);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <Field id="approve-strengths" label={reviewCopy.strengthsLabel}>
        <Textarea id="approve-strengths" name="strengths" rows={2} maxLength={2000} />
      </Field>

      <Field id="approve-improvements" label={reviewCopy.improvementsLabel}>
        <Textarea id="approve-improvements" name="improvements" rows={2} maxLength={2000} />
      </Field>

      <Field id="approve-general" label={reviewCopy.generalCommentLabel}>
        <Textarea id="approve-general" name="generalComment" rows={2} maxLength={2000} />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{reviewCopy.skillsToValidate}</legend>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">{reviewCopy.skillsEmpty}</p>
        ) : (
          <>
            <p className="text-xs text-muted">{reviewCopy.skillsToValidateHint}</p>
            <div className="space-y-2 pt-1">
              {pending.map((skill) => (
                <Checkbox
                  key={skill.id}
                  id={`validate-${skill.id}`}
                  name="validatedSkillIds"
                  value={skill.id}
                  label={skill.name}
                />
              ))}
            </div>
          </>
        )}
      </fieldset>

      <FormMessages state={state} />

      <SubmitButton size="sm" pendingLabel="Aprovando...">
        {reviewCopy.approveAction}
      </SubmitButton>
    </form>
  );
}

function RequestChangesForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(requestChangesAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <Field
        id="changes-comment"
        label={reviewCopy.changesCommentLabel}
        hint={reviewCopy.changesCommentHint}
        required
      >
        <Textarea id="changes-comment" name="comment" rows={3} maxLength={2000} required />
      </Field>

      <Field id="changes-strengths" label={reviewCopy.strengthsLabel}>
        <Textarea id="changes-strengths" name="strengths" rows={2} maxLength={2000} />
      </Field>

      <Field id="changes-improvements" label={reviewCopy.improvementsLabel}>
        <Textarea id="changes-improvements" name="improvements" rows={2} maxLength={2000} />
      </Field>

      <FormMessages state={state} />

      <SubmitButton size="sm" variant="secondary" pendingLabel="Enviando...">
        {reviewCopy.changesAction}
      </SubmitButton>
    </form>
  );
}

function FeedbackForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(addFeedbackAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <Field id="feedback-strengths" label={reviewCopy.strengthsLabel}>
        <Textarea id="feedback-strengths" name="strengths" rows={2} maxLength={2000} />
      </Field>

      <Field id="feedback-improvements" label={reviewCopy.improvementsLabel}>
        <Textarea id="feedback-improvements" name="improvements" rows={2} maxLength={2000} />
      </Field>

      <Field id="feedback-general" label={reviewCopy.generalCommentLabel}>
        <Textarea id="feedback-general" name="generalComment" rows={2} maxLength={2000} />
      </Field>

      <FormMessages state={state} />

      <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
        {reviewCopy.feedbackAction}
      </SubmitButton>
    </form>
  );
}

function SkillValidationList({ skills }: { skills: ReviewSkill[] }) {
  if (skills.length === 0) return <p className="text-sm text-muted">{reviewCopy.skillsEmpty}</p>;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {skills.map((skill) => (
        <li key={skill.id} className="flex items-center gap-1">
          <SkillBadge name={skill.name} verified={skill.verified} />
          <form action={setSkillValidationAction}>
            <input type="hidden" name="projectSkillId" value={skill.id} />
            <input type="hidden" name="validate" value={skill.verified ? "false" : "true"} />
            <SubmitButton variant="ghost" size="sm" pendingLabel="...">
              {skill.verified ? reviewCopy.unvalidateSkill : reviewCopy.validateSkill}
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}

export function TeacherReviewPanel({
  projectId,
  status,
  skills,
  isFeatured,
  canFeature,
  canArchive,
  eventEntry,
}: TeacherReviewPanelProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <SectionTitle>{reviewCopy.title}</SectionTitle>
        <p className="text-sm text-muted">
          {status === "SUBMITTED" ? reviewCopy.subtitleSubmitted : null}
          {status === "APPROVED" ? reviewCopy.subtitleApproved : null}
          {status === "CHANGES_REQUESTED" ? reviewCopy.waitingStudent : null}
          {status === "ARCHIVED" ? reviewCopy.archivedNotice : null}
          {status === "DRAFT" ? reviewCopy.moderationOnly : null}
        </p>
      </div>

      {status === "SUBMITTED" ? (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{reviewCopy.approveTitle}</h3>
            </CardHeader>
            <CardBody>
              <ApproveForm projectId={projectId} skills={skills} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{reviewCopy.changesTitle}</h3>
            </CardHeader>
            <CardBody>
              <RequestChangesForm projectId={projectId} />
            </CardBody>
          </Card>
        </>
      ) : null}

      {status === "APPROVED" ? (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{reviewCopy.skillsToValidate}</h3>
            </CardHeader>
            <CardBody>
              <SkillValidationList skills={skills} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-ink">{reviewCopy.feedbackTitle}</h3>
            </CardHeader>
            <CardBody>
              <FeedbackForm projectId={projectId} />
            </CardBody>
          </Card>

          {canFeature ? (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-ink">{reviewCopy.featureTitle}</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <form action={toggleFeaturedAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                    {isFeatured ? reviewCopy.featureOff : reviewCopy.featureOn}
                  </SubmitButton>
                </form>

                {eventEntry ? (
                  <form action={toggleEventHighlightAction} className="space-y-2">
                    <input type="hidden" name="eventProjectId" value={eventEntry.id} />
                    <p className="text-sm text-muted">{eventEntry.eventName}</p>
                    <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                      {eventEntry.isHighlight ? reviewCopy.highlightOff : reviewCopy.highlightOn}
                    </SubmitButton>
                  </form>
                ) : null}

                <p className="text-xs text-muted">{reviewCopy.featureHint}</p>
              </CardBody>
            </Card>
          ) : null}
        </>
      ) : null}

      {canArchive ? (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-ink">{reviewCopy.archiveTitle}</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            <p className="text-sm text-muted">{reviewCopy.archiveConfirm}</p>
            <form action={status === "ARCHIVED" ? unarchiveProjectAction : archiveProjectAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <SubmitButton size="sm" variant="secondary" pendingLabel="Salvando...">
                {status === "ARCHIVED" ? reviewCopy.unarchiveAction : reviewCopy.archiveAction}
              </SubmitButton>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </section>
  );
}
