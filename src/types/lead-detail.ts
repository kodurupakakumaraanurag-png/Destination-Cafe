import { Priority, LeadStatus, ProjectAllocationStatus, ActivityType, TaskStatus } from "@prisma/client";

export interface LeadUser {
  id: string;
  name: string | null;
  email: string;
  userRole?: string;
}

export interface LeadActivity {
  id: string;
  leadId?: string | null;
  userId?: string | null;
  user?: LeadUser | null;
  type: ActivityType;
  title: string;
  description?: string | null;
  createdAt: Date | string;
}

export interface LeadTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | string | null;
  leadId?: string | null;
  assignedUserId?: string | null;
  assignedUser?: LeadUser | null;
  createdAt?: Date | string;
}

export interface LeadAuditLog {
  id: string;
  userId?: string | null;
  user?: LeadUser | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: Date | string;
}

export interface LeadDetailRecord {
  id: string;
  company: string;
  domain?: string | null;
  location?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  designation?: string | null;
  phone?: string | null;
  email?: string | null;
  businessUnderstanding?: string | null;
  possibleProblem?: string | null;
  requirement?: string | null;
  opportunity?: string | null;
  priority: Priority;
  status: LeadStatus;
  nextAction?: string | null;
  dateAdded?: Date | string | null;
  source?: string | null;
  contactMethod?: string | null;
  digitalPresenceScore: number;
  hiringActivityScore: number;
  techStackFitScore: number;
  fundingRevenueScore: number;
  projectUrgencyScore: number;
  budgetClarityScore: number;
  recordedLeadScore?: number | null;
  calculatedLeadScore?: number | null;
  projectAllocationStatus: ProjectAllocationStatus | string;
  assignedUserId?: string | null;
  assignedUser?: LeadUser | null;
  activities?: LeadActivity[];
  tasks?: LeadTask[];
  contacts?: Record<string, unknown>[];
  leadScores?: Record<string, unknown>[];
  opportunities?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
