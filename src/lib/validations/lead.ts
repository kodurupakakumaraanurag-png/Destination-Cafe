import { z } from "zod";
import { Priority, LeadStatus, ProjectAllocationStatus, ActivityType } from "@prisma/client";

const scoreSchema = z.coerce
  .number()
  .min(0, "Score must be at least 0")
  .max(5, "Score cannot exceed 5");

export const leadFormSchema = z.object({
  // 1. Company
  company: z.string().min(1, "Company name is required"),
  domain: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().nullable().optional(),

  // 2. Contact
  contactPerson: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Invalid email address").or(z.literal("")).nullable().optional(),

  // 3. Business
  businessUnderstanding: z.string().nullable().optional(),
  possibleProblem: z.string().nullable().optional(),
  requirement: z.string().nullable().optional(),
  opportunity: z.string().nullable().optional(),

  // 4. Pipeline
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(LeadStatus),
  nextAction: z.string().nullable().optional(),
  dateAdded: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  contactMethod: z.string().nullable().optional(),

  // 5. Scoring (0-5 fields)
  digitalPresenceScore: scoreSchema,
  hiringActivityScore: scoreSchema,
  techStackFitScore: scoreSchema,
  fundingRevenueScore: scoreSchema,
  projectUrgencyScore: scoreSchema,
  budgetClarityScore: scoreSchema,
  recordedLeadScore: z.coerce.number().min(0).max(30).nullable().optional(),

  // 6. Allocation
  projectAllocationStatus: z.nativeEnum(ProjectAllocationStatus),
  assignedUserId: z.string().nullable().optional(),
});

export const scoringFormSchema = z.object({
  digitalPresenceScore: scoreSchema,
  hiringActivityScore: scoreSchema,
  techStackFitScore: scoreSchema,
  fundingRevenueScore: scoreSchema,
  projectUrgencyScore: scoreSchema,
  budgetClarityScore: scoreSchema,
  recordedLeadScore: z.coerce.number().min(0).max(30).nullable().optional(),
});

export const activityFormSchema = z.object({
  type: z.nativeEnum(ActivityType),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
});

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  priority: z.nativeEnum(Priority),
  dueDate: z.string().nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
export type ScoringFormValues = z.infer<typeof scoringFormSchema>;
export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
