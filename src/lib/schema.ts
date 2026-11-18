import { z } from "zod";
import { GOVERNORATES, OPTIONS, OTHER, CONSENT_YES, CONSENT_NO } from "./questions";
import { normalizePhone, phoneOk } from "./phone";

type Opts = readonly [string, ...string[]];

const many = (o: Opts, min: number, max: number) =>
  z
    .array(z.enum(o))
    .min(min)
    .max(max)
    .refine((a) => new Set(a).size === a.length, "duplicate values");

// Campaign tags are cleaned instead of rejected, so a strange link never blocks a real answer.
const tag = (fallback: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").replace(/[^A-Za-z0-9_\-. +]/g, "").slice(0, 60) || fallback);

export const submissionSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
    source: tag("direct"),
    medium: tag(""),
    campaign: tag("not-set"),
    role: z.enum(OPTIONS.role),
    experience: z.enum(OPTIONS.experience),
    governorate: z.enum(GOVERNORATES),
    challenges: many(OPTIONS.challenges, 1, 3),
    challengeOther: z.string().trim().max(200).default(""),
    interests: many(OPTIONS.interests, 1, OPTIONS.interests.length),
    primary: z.enum(OPTIONS.interests),
    days: many(OPTIONS.days, 1, OPTIONS.days.length),
    hours: many(OPTIONS.hours, 1, OPTIONS.hours.length),
    duration: z.enum(OPTIONS.duration),
    format: z.enum(OPTIONS.format),
    budget: z.enum(OPTIONS.budget),
    payer: z.enum(OPTIONS.payer),
    intent: z.enum(OPTIONS.intent),
    barriers: many(OPTIONS.barriers, 1, OPTIONS.barriers.length),
    expectations: many(OPTIONS.expectations, 1, 3),
    distance: z.enum(OPTIONS.distance),
    name: z.string().trim().max(80).default(""),
    phone: z
      .string()
      .trim()
      .max(30)
      .default("")
      .transform(normalizePhone)
      .refine(phoneOk, "invalid phone"),
    consent: z.enum([CONSENT_YES, CONSENT_NO]).default(CONSENT_NO),
  })
  .superRefine((d, ctx) => {
    if (!d.interests.includes(d.primary)) {
      ctx.addIssue({ code: "custom", path: ["primary"], message: "primary must be one of interests" });
    }
  })
  .transform((d) => ({
    ...d,
    challengeOther: d.challenges.includes(OTHER) ? d.challengeOther : "",
  }));

export type Submission = z.infer<typeof submissionSchema>;

/** Flattens a validated submission into the text values stored in the Google Sheet. */
export function buildRow(d: Submission): Record<string, string> {
  const J = (a: string[]) => a.join(" | ");
  return {
    submissionId: d.id,
    source: d.medium ? `${d.source} / ${d.medium}` : d.source,
    campaign: d.campaign,
    role: d.role,
    experience: d.experience,
    governorate: d.governorate,
    challenges: J(d.challenges),
    challengeOther: d.challengeOther,
    interests: J(d.interests),
    primary: d.primary,
    days: J(d.days),
    hours: J(d.hours),
    duration: d.duration,
    format: d.format,
    budget: d.budget,
    payer: d.payer,
    intent: d.intent,
    barriers: J(d.barriers),
    expectations: J(d.expectations),
    distance: d.distance,
    name: d.name,
    phone: d.phone,
    consent: d.consent === CONSENT_YES ? "Yes" : "No",
  };
}
