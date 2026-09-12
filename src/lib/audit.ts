import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditInput = {
  schoolId: string | null;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        schoolId: input.schoolId,
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("[audit] falha ao registrar", input.action, error);
  }
}
