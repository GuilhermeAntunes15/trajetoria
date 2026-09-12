"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { review as reviewCopy } from "@/lib/copy";
import { getViewer } from "@/lib/session";
import {
  addFeedbackSchema,
  approveProjectSchema,
  eventProjectIdSchema,
  projectIdSchema,
  projectSkillValidationSchema,
  requestChangesSchema,
} from "@/lib/validation/validation.schema";
import {
  addFeedback,
  approveProject,
  archiveProject,
  requestChanges,
  ReviewError,
  setProjectSkillValidation,
  toggleEventHighlight,
  toggleFeatured,
  unarchiveProject,
  type ReviewTarget,
} from "@/server/services/validation.service";

export type ReviewFormState = { error?: string; success?: string };

function reviewError(error: unknown): ReviewFormState {
  if (error instanceof ReviewError) return { error: error.message };
  throw error;
}

function revalidateReview(target: ReviewTarget): void {
  revalidatePath(`/projects/${target.slug}`);
  revalidatePath("/projects");
  revalidatePath("/teacher");
  revalidatePath("/dashboard");
}

export async function approveProjectAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = approveProjectSchema.safeParse({
    projectId: formData.get("projectId"),
    strengths: formData.get("strengths") ?? "",
    improvements: formData.get("improvements") ?? "",
    generalComment: formData.get("generalComment") ?? "",
    validatedSkillIds: formData.getAll("validatedSkillIds").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  try {
    const target = await approveProject(viewer, parsed.data);
    revalidateReview(target);
    return { success: reviewCopy.approveDone };
  } catch (error) {
    return reviewError(error);
  }
}

export async function requestChangesAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = requestChangesSchema.safeParse({
    projectId: formData.get("projectId"),
    comment: formData.get("comment") ?? "",
    strengths: formData.get("strengths") ?? "",
    improvements: formData.get("improvements") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os campos do formulário." };
  }

  try {
    const target = await requestChanges(viewer, parsed.data);
    revalidateReview(target);
    return { success: reviewCopy.changesDone };
  } catch (error) {
    return reviewError(error);
  }
}

export async function addFeedbackAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = addFeedbackSchema.safeParse({
    projectId: formData.get("projectId"),
    strengths: formData.get("strengths") ?? "",
    improvements: formData.get("improvements") ?? "",
    generalComment: formData.get("generalComment") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? reviewCopy.feedbackEmpty };
  }

  try {
    const target = await addFeedback(viewer, parsed.data);
    revalidateReview(target);
    return { success: reviewCopy.feedbackDone };
  } catch (error) {
    return reviewError(error);
  }
}

export async function setSkillValidationAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectSkillValidationSchema.safeParse({
    projectSkillId: formData.get("projectSkillId"),
    validate: formData.get("validate"),
  });
  if (!parsed.success) throw new Error("Competência inválida.");

  const target = await setProjectSkillValidation(
    viewer,
    parsed.data.projectSkillId,
    parsed.data.validate === "true",
  );

  revalidateReview(target);
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) throw new Error("Projeto inválido.");

  const target = await toggleFeatured(viewer, parsed.data.projectId);

  revalidateReview(target);
}

export async function toggleEventHighlightAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = eventProjectIdSchema.safeParse({ eventProjectId: formData.get("eventProjectId") });
  if (!parsed.success) throw new Error("Evento inválido.");

  const target = await toggleEventHighlight(viewer, parsed.data.eventProjectId);

  revalidateReview(target);
  revalidatePath("/events");
}

export async function archiveProjectAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) throw new Error("Projeto inválido.");

  const target = await archiveProject(viewer, parsed.data.projectId);

  revalidateReview(target);
}

export async function unarchiveProjectAction(formData: FormData): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) throw new Error("Projeto inválido.");

  const target = await unarchiveProject(viewer, parsed.data.projectId);

  revalidateReview(target);
}
