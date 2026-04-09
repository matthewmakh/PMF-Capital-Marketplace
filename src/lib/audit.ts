import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

interface LogActionParams {
  action: AuditAction;
  actorId?: string;
  targetUserId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Creates an immutable audit log entry.
 *
 * metadata should include:
 * - What changed (action-specific fields)
 * - Old values (for mutations)
 * - New values (for mutations)
 * - Reason (for reversals, denials, etc.)
 */
export async function logAction(params: LogActionParams) {
  return prisma.auditLog.create({
    data: {
      action: params.action,
      actorId: params.actorId,
      targetUserId: params.targetUserId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata ?? Prisma.JsonNull,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
