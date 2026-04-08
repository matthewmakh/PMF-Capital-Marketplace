import { AuditAction } from "@prisma/client";
import { prisma } from "./prisma";

interface LogActionParams {
  action: AuditAction;
  actorId?: string;
  targetUserId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(params: LogActionParams) {
  return prisma.auditLog.create({
    data: {
      action: params.action,
      actorId: params.actorId,
      targetUserId: params.targetUserId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata ?? undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
