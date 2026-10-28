import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const issueCredentialSchema = z.object({
  subjectUserId: z.string().uuid("Invalid citizen subject user ID."),
  type: z.enum([
    "IdentityCredential",
    "AgeCredential",
    "StudentCredential",
    "AddressCredential",
  ]),
  attributes: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one credential attribute must be provided.",
    }),
  validityDays: z
    .number()
    .int()
    .min(1, "Validity must be at least 1 day.")
    .max(3650, "Validity cannot exceed 10 years.")
    .default(365),
});

export const revokeCredentialSchema = z.object({
  reasonCode: z
    .string()
    .min(3, "Revocation reason must be at least 3 characters.")
    .max(200, "Revocation reason cannot exceed 200 characters."),
});

export const createVerificationRequestSchema = z.object({
  subjectUserId: z.string().uuid("Invalid subject citizen ID."),
  purpose: z
    .string()
    .min(5, "Purpose must be at least 5 characters.")
    .max(300, "Purpose cannot exceed 300 characters."),
  requestedAttributes: z
    .array(z.string().min(1))
    .min(1, "At least one attribute must be requested."),
  validitySeconds: z.number().int().min(60).max(86400).default(3600),
});

export const respondToRequestSchema = z.object({
  decision: z.enum(["APPROVED", "DECLINED"]),
  selectedAttributes: z.array(z.string()).default([]),
});

export const verifyProofSchema = z.object({
  jwtRaw: z.string().min(20, "A valid signed VC-JWT string is required."),
  disclosures: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.union([z.string(), z.number(), z.boolean()]),
        salt: z.string().min(1),
      })
    )
    .optional(),
  requestId: z.string().uuid().optional(),
});

export const outageToggleSchema = z.object({
  simulateOutage: z.boolean(),
});

export const settingsSchema = z.object({
  dataRetentionDays: z.number().int().min(1).max(3650).default(365),
  requireConsentSignature: z.boolean().default(true),
});
