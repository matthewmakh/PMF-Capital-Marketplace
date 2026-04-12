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
 * Extract IP address and user-agent from a Request object.
 * Works with Next.js middleware and API routes behind reverse proxies.
 */
export function getRequestContext(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
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
