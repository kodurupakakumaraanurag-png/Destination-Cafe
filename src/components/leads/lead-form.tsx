"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema, LeadFormValues } from "@/lib/validations/lead";
import { Priority, LeadStatus, ProjectAllocationStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, User, Briefcase, GitPullRequest, Star, Layers, CheckCircle2 } from "lucide-react";

import { createLead, updateLead } from "@/lib/actions/lead-actions";

interface LeadFormProps {
  initialValues?: Partial<LeadFormValues>;
  initialData?: Partial<LeadFormValues>;
  leadId?: string;
  onSubmit?: (values: LeadFormValues) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
  isSubmitting?: boolean;
  users?: { id: string; name: string | null; email: string }[];
}

export function LeadForm({
  initialValues,
  initialData,
  leadId,
  onSubmit,
  onCancel,
  onSuccess,
  isSubmitting: externalSubmitting = false,
  users = [],
}: LeadFormProps) {
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  const effectiveInitial = initialData || initialValues;
  const isSubmitting = externalSubmitting || internalSubmitting;

  const defaultDateAdded = effectiveInitial?.dateAdded
    ? new Date(effectiveInitial.dateAdded).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const handleFormSubmit = async (values: LeadFormValues) => {
    if (onSubmit) {
      await onSubmit(values);
      return;
    }

    setInternalSubmitting(true);
    try {
      if (leadId) {
        await updateLead(leadId, values);
      } else {
        await createLead(values);
      }
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } finally {
      setInternalSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      company: initialValues?.company || "",
      domain: initialValues?.domain || "",
      location: initialValues?.location || "",
      website: initialValues?.website || "",
      contactPerson: initialValues?.contactPerson || "",
      designation: initialValues?.designation || "",
      phone: initialValues?.phone || "",
      email: initialValues?.email || "",
      businessUnderstanding: initialValues?.businessUnderstanding || "",
      possibleProblem: initialValues?.possibleProblem || "",
      requirement: initialValues?.requirement || "",
      opportunity: initialValues?.opportunity || "",
      priority: initialValues?.priority || Priority.MEDIUM,
      status: initialValues?.status || LeadStatus.NEW,
      nextAction: initialValues?.nextAction || "",
      dateAdded: defaultDateAdded,
      source: initialValues?.source || "Website Lead",
      contactMethod: initialValues?.contactMethod || "LinkedIn / Email",
      digitalPresenceScore: initialValues?.digitalPresenceScore ?? 0,
      hiringActivityScore: initialValues?.hiringActivityScore ?? 0,
      techStackFitScore: initialValues?.techStackFitScore ?? 0,
      fundingRevenueScore: initialValues?.fundingRevenueScore ?? 0,
      projectUrgencyScore: initialValues?.projectUrgencyScore ?? 0,
      budgetClarityScore: initialValues?.budgetClarityScore ?? 0,
      recordedLeadScore: initialValues?.recordedLeadScore ?? 0,
      projectAllocationStatus: initialValues?.projectAllocationStatus || ProjectAllocationStatus.AVAILABLE_FOR_SELECTION,
      assignedUserId: initialValues?.assignedUserId || "",
    },
  });

  // Watch score inputs to display real-time calculated total
  const watchedScores = useWatch({
    control,
    name: [
      "digitalPresenceScore",
      "hiringActivityScore",
      "techStackFitScore",
      "fundingRevenueScore",
      "projectUrgencyScore",
      "budgetClarityScore",
    ],
  });
  const [dScore = 0, hScore = 0, tScore = 0, fScore = 0, uScore = 0, bScore = 0] = (watchedScores || []).map((v) => Number(v || 0));
  const calculatedTotal = dScore + hScore + tScore + fScore + uScore + bScore;

  const tabItems = [
    { id: "company", label: "1. Company" },
    { id: "contact", label: "2. Contact" },
    { id: "business", label: "3. Business" },
    { id: "pipeline", label: "4. Pipeline" },
    { id: "scoring", label: "5. Scoring" },
    { id: "allocation", label: "6. Allocation" },
  ];

  const userOptions = [
    { label: "Unassigned", value: "" },
    ...users.map((u) => ({ label: `${u.name || u.email} (${u.email})`, value: u.id })),
  ];

  return (
    <form onSubmit={handleSubmit((values) => handleFormSubmit(values as LeadFormValues))} className="space-y-6">
      {/* 6 Group Tab Headers */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Company */}
      {activeTab === "company" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                placeholder="e.g. Destination Cafe"
                {...register("company")}
                error={errors.company?.message}
              />
              <Input
                label="Industry / Domain"
                placeholder="e.g. Restaurant, Healthcare, IT"
                {...register("domain")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location / Address"
                placeholder="e.g. Cybercity, Kukatpally, Hyderabad"
                {...register("location")}
              />
              <Input
                label="Website URL"
                placeholder="e.g. https://destinationcafe.com"
                {...register("website")}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Contact */}
      {activeTab === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>Contact Person Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Person Name"
                placeholder="Leave empty if null/unknown"
                {...register("contactPerson")}
              />
              <Input
                label="Designation / Title"
                placeholder="e.g. General Manager, CTO"
                {...register("designation")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="e.g. +91 98765 43210"
                {...register("phone")}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. contact@destinationcafe.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Business */}
      {activeTab === "business" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Business Overview &amp; Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Business Understanding</label>
              <textarea
                rows={3}
                placeholder="Overview of client business model and tech requirements..."
                {...register("businessUnderstanding")}
                className="w-full rounded-md border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Possible Problem / Pain Point</label>
              <textarea
                rows={2}
                placeholder="Legacy workflows, manual processes..."
                {...register("possibleProblem")}
                className="w-full rounded-md border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Project Requirement</label>
                <textarea
                  rows={2}
                  placeholder="Custom enterprise web application..."
                  {...register("requirement")}
                  className="w-full rounded-md border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Opportunity Overview</label>
                <textarea
                  rows={2}
                  placeholder="High leverage live industry project..."
                  {...register("opportunity")}
                  className="w-full rounded-md border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Pipeline */}
      {activeTab === "pipeline" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-primary" />
              <span>Pipeline &amp; Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Priority"
                options={[
                  { label: "Low", value: Priority.LOW },
                  { label: "Medium", value: Priority.MEDIUM },
                  { label: "High", value: Priority.HIGH },
                  { label: "Urgent", value: Priority.URGENT },
                ]}
                {...register("priority")}
              />

              <Select
                label="Lead Status"
                options={[
                  { label: "New", value: LeadStatus.NEW },
                  { label: "Contacted", value: LeadStatus.CONTACTED },
                  { label: "In Progress", value: LeadStatus.IN_PROGRESS },
                  { label: "Qualified", value: LeadStatus.QUALIFIED },
                  { label: "Unqualified", value: LeadStatus.UNQUALIFIED },
                  { label: "Converted", value: LeadStatus.CONVERTED },
                  { label: "Archived", value: LeadStatus.ARCHIVED },
                ]}
                {...register("status")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Next Action"
                placeholder="e.g. Contact management for proposal"
                {...register("nextAction")}
              />

              <DateInput
                label="Date Added"
                {...register("dateAdded")}
              />

              <Input
                label="Source"
                placeholder="e.g. Google Sheet Import, Website"
                {...register("source")}
              />
            </div>

            <Input
              label="Contact Method"
              placeholder="e.g. LinkedIn / Email, Phone"
              {...register("contactMethod")}
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Scoring */}
      {activeTab === "scoring" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>6 Dimensional Lead Scoring (0 to 5)</span>
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Calculated Score Total:</span>
                <span className="font-bold px-2.5 py-0.5 rounded bg-primary text-white">
                  {calculatedTotal} / 30
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="Digital Presence (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("digitalPresenceScore")}
                error={errors.digitalPresenceScore?.message}
              />
              <Input
                label="Hiring Activity (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("hiringActivityScore")}
                error={errors.hiringActivityScore?.message}
              />
              <Input
                label="Tech Stack Fit (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("techStackFitScore")}
                error={errors.techStackFitScore?.message}
              />
              <Input
                label="Funding / Revenue (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("fundingRevenueScore")}
                error={errors.fundingRevenueScore?.message}
              />
              <Input
                label="Project Urgency (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("projectUrgencyScore")}
                error={errors.projectUrgencyScore?.message}
              />
              <Input
                label="Budget Clarity (0-5)"
                type="number"
                min={0}
                max={5}
                {...register("budgetClarityScore")}
                error={errors.budgetClarityScore?.message}
              />
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Recorded Lead Score (Discrepancy Preservation)</span>
                <span>Optional Dossier Intake Field</span>
              </div>
              <Input
                placeholder="e.g. 18 (Recorded score in intake dossier)"
                type="number"
                min={0}
                max={30}
                {...register("recordedLeadScore")}
              />
              <p className="text-[11px] text-muted-foreground">
                Preserves recorded lead score from original dossier (such as Destination Cafe recorded score 18 vs calculated score 0).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 6: Allocation */}
      {activeTab === "allocation" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Project Allocation &amp; Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Project Allocation Status"
                options={[
                  { label: "Available for Selection", value: ProjectAllocationStatus.AVAILABLE_FOR_SELECTION },
                  { label: "Unassigned", value: ProjectAllocationStatus.UNASSIGNED },
                  { label: "Allocated", value: ProjectAllocationStatus.ALLOCATED },
                  { label: "Completed", value: ProjectAllocationStatus.COMPLETED },
                ]}
                {...register("projectAllocationStatus")}
              />

              <Select
                label="Assigned User / Team Member"
                options={userOptions}
                {...register("assignedUserId")}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Server-side Zod validation active</span>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving Lead..." : "Save Lead Record"}
          </Button>
        </div>
      </div>
    </form>
  );
}
