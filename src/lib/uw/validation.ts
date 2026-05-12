import { z } from "zod";
import { UwDocType } from "@prisma/client";

export const ownerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  ssn: z
    .string()
    .regex(/^\d{3}-?\d{2}-?\d{4}$/)
    .optional()
    .or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  ownershipPct: z.coerce.number().min(0).max(100),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  homeAddress: z.string().optional().or(z.literal("")),
  ficoClaim: z.coerce.number().int().min(300).max(850).optional().or(z.literal("")),
  pgConsent: z.coerce.boolean().optional(),
});

export const intakeSchema = z.object({
  legalName: z.string().min(1).max(255),
  dba: z.string().optional().or(z.literal("")),
  ein: z
    .string()
    .regex(/^\d{2}-?\d{7}$/)
    .optional()
    .or(z.literal("")),
  entityType: z.string().optional().or(z.literal("")),
  naics: z.string().optional().or(z.literal("")),
  state: z.string().length(2).optional().or(z.literal("")),
  businessPhone: z.string().optional().or(z.literal("")),
  businessEmail: z.string().email().optional().or(z.literal("")),
  businessAddress: z.string().optional().or(z.literal("")),
  timeInBusinessMonths: z.coerce.number().int().min(0).max(1200).optional(),
  requestedAmount: z.coerce.number().min(0).max(10_000_000).optional(),
  useOfFunds: z.string().max(500).optional().or(z.literal("")),
  monthlyRevenueClaim: z.coerce.number().min(0).max(100_000_000).optional(),
  owners: z.array(ownerSchema).min(1),
});

export const presignSchema = z.object({
  docType: z.nativeEnum(UwDocType),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(120),
  sizeBytes: z.number().int().min(1).max(50 * 1024 * 1024),
  statementMonth: z.number().int().min(1).max(12).optional(),
  statementYear: z.number().int().min(2000).max(2100).optional(),
});

export const registerDocSchema = z.object({
  docType: z.nativeEnum(UwDocType),
  s3Key: z.string().min(1).max(500),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(120),
  sizeBytes: z.number().int().min(1),
  statementMonth: z.number().int().min(1).max(12).optional(),
  statementYear: z.number().int().min(2000).max(2100).optional(),
});

export const decisionSchema = z.object({
  decision: z.enum(["approve", "decline", "request_stips"]),
  notes: z.string().max(2000).optional(),
});
