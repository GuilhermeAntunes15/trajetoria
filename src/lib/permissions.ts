import type { ProjectStatus, Role, Visibility } from "@prisma/client";

export type Viewer = {
  id: string;
  role: Role;
  schoolId: string;
} | null;

export type ProjectCtx = {
  id: string;
  schoolId: string;
  createdById: string;
  advisorId: string | null;
  status: ProjectStatus;
  visibility: Visibility;
  allowFork: boolean;
  memberIds: string[];
};

export type ProfileCtx = {
  id: string;
  schoolId: string;
  profileVisibility: Visibility;
};

export type SubmitCtx = Pick<ProjectCtx, "id" | "schoolId" | "createdById" | "memberIds" | "status"> & {
  title: string;
  summary: string;
  problem: string | null;
  solution: string | null;
  evidenceCount: number;
};

function isSameSchool(viewer: Viewer, schoolId: string): boolean {
  if (!viewer) return false;
  if (!viewer.schoolId || !schoolId) return false;
  return viewer.schoolId === schoolId;
}

function isStaff(viewer: Viewer): boolean {
  return viewer?.role === "TEACHER" || viewer?.role === "ADMIN";
}

export function isProjectMember(viewer: Viewer, project: Pick<ProjectCtx, "createdById" | "memberIds">): boolean {
  if (!viewer) return false;
  return viewer.id === project.createdById || project.memberIds.includes(viewer.id);
}

export function canViewProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (isProjectMember(viewer, project)) return true;
  if (isStaff(viewer) && isSameSchool(viewer, project.schoolId)) return true;
  if (project.status !== "APPROVED") return false;
  if (project.visibility === "PUBLIC") return true;
  if (project.visibility === "SCHOOL") return isSameSchool(viewer, project.schoolId);
  return false;
}

export function canCreateProject(viewer: Viewer): boolean {
  return viewer?.role === "STUDENT";
}

export function canEditProjectContent(viewer: Viewer, project: ProjectCtx): boolean {
  if (!isProjectMember(viewer, project)) return false;
  return project.status === "DRAFT" || project.status === "CHANGES_REQUESTED";
}

export function canModerateProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer || !isSameSchool(viewer, project.schoolId)) return false;
  return viewer.role === "ADMIN" || viewer.role === "TEACHER";
}

export function canChangeProjectVisibilityAsModerator(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer || !isSameSchool(viewer, project.schoolId)) return false;
  return viewer.role === "ADMIN";
}

export function canArchiveProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer || !isSameSchool(viewer, project.schoolId)) return false;
  return viewer.role === "ADMIN";
}

export function canDeleteProject(
  viewer: Viewer,
  project: ProjectCtx & { otherMemberCount?: number },
): boolean {
  if (!viewer) return false;
  if (project.status !== "DRAFT") return false;
  if (viewer.id === project.createdById) return true;
  if (viewer.role === "ADMIN" && isSameSchool(viewer, project.schoolId)) {
    return (project.otherMemberCount ?? 0) === 0;
  }
  return false;
}

export function canManageMembers(viewer: Viewer, project: ProjectCtx): boolean {
  return canEditProjectContent(viewer, project);
}

export function canManageEvidence(viewer: Viewer, project: ProjectCtx): boolean {
  return canEditProjectContent(viewer, project);
}

export function canSuggestSkill(viewer: Viewer, project: ProjectCtx): boolean {
  return canEditProjectContent(viewer, project);
}

export function isProjectComplete(project: Pick<SubmitCtx, "title" | "summary" | "problem" | "solution" | "evidenceCount">): boolean {
  return (
    project.title.trim().length > 0 &&
    project.summary.trim().length > 0 &&
    (project.problem ?? "").trim().length > 0 &&
    (project.solution ?? "").trim().length > 0 &&
    project.evidenceCount > 0
  );
}

export function canSubmitProject(viewer: Viewer, project: SubmitCtx): boolean {
  if (!isProjectMember(viewer, project)) return false;
  if (project.status !== "DRAFT" && project.status !== "CHANGES_REQUESTED") return false;
  return isProjectComplete(project);
}

export function canReviewProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer || !isStaff(viewer)) return false;
  if (!isSameSchool(viewer, project.schoolId)) return false;
  if (isProjectMember(viewer, project)) return false;
  return (
    project.status === "SUBMITTED" ||
    project.status === "APPROVED" ||
    project.status === "CHANGES_REQUESTED"
  );
}

export function canValidateSkill(viewer: Viewer, project: ProjectCtx): boolean {
  return canReviewProject(viewer, project);
}

export function canAddFeedback(viewer: Viewer, project: ProjectCtx): boolean {
  return canReviewProject(viewer, project);
}

export function canFeatureProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer || !isStaff(viewer)) return false;
  if (!isSameSchool(viewer, project.schoolId)) return false;
  return project.status === "APPROVED";
}

export function canPublishProject(viewer: Viewer, project: ProjectCtx): boolean {
  return isProjectMember(viewer, project);
}

export function canForkProject(viewer: Viewer, project: ProjectCtx): boolean {
  if (!viewer) return false;
  if (!canViewProject(viewer, project)) return false;
  return project.allowFork && project.status === "APPROVED";
}

export function canViewQr(viewer: Viewer, project: ProjectCtx): boolean {
  return canViewProject(viewer, project);
}

export function canViewProfile(viewer: Viewer, profile: ProfileCtx): boolean {
  if (viewer?.id === profile.id) return true;
  if (profile.profileVisibility === "PUBLIC") return true;
  if (profile.profileVisibility === "SCHOOL") return isSameSchool(viewer, profile.schoolId);
  return isStaff(viewer) && isSameSchool(viewer, profile.schoolId);
}

export function canEditProfile(viewer: Viewer, profile: ProfileCtx): boolean {
  return viewer?.id === profile.id;
}

export function canManageEvent(viewer: Viewer, schoolId: string): boolean {
  if (!viewer || !isStaff(viewer)) return false;
  return isSameSchool(viewer, schoolId);
}

export function canDeleteEvent(viewer: Viewer, schoolId: string): boolean {
  if (viewer?.role !== "ADMIN") return false;
  return isSameSchool(viewer, schoolId);
}

export function canManageSchoolEntity(viewer: Viewer, schoolId: string): boolean {
  if (viewer?.role !== "ADMIN") return false;
  return isSameSchool(viewer, schoolId);
}

export function canGrantBadge(viewer: Viewer, studentSchoolId: string): boolean {
  if (!viewer || !isStaff(viewer)) return false;
  return isSameSchool(viewer, studentSchoolId);
}

export function canIssueCertificate(viewer: Viewer, studentSchoolId: string): boolean {
  return canGrantBadge(viewer, studentSchoolId);
}

export function canUpload(viewer: Viewer): boolean {
  return viewer !== null;
}
