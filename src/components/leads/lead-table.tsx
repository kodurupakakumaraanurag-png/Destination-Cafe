"use client";

import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Priority, LeadStatus } from "@prisma/client";
import {
  Search,
  Columns,
  Eye,
  Edit,
  Archive,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Building2,
  Users,
} from "lucide-react";

export interface SerializedLead {
  id: string;
  company: string;
  domain: string | null;
  location: string | null;
  website: string | null;
  contactPerson: string | null;
  designation: string | null;
  phone: string | null;
  email: string | null;
  businessUnderstanding: string | null;
  possibleProblem: string | null;
  requirement: string | null;
  opportunity: string | null;
  priority: Priority;
  status: LeadStatus;
  nextAction: string | null;
  dateAdded: Date | null;
  source: string | null;
  contactMethod: string | null;
  digitalPresenceScore: number;
  hiringActivityScore: number;
  techStackFitScore: number;
  fundingRevenueScore: number;
  projectUrgencyScore: number;
  budgetClarityScore: number;
  recordedLeadScore: number | null;
  calculatedLeadScore: number | null;
  projectAllocationStatus: string;
  assignedUser: { id: string; name: string | null; email: string } | null;
  createdAt: Date;
  updatedAt: Date;
  activities?: { createdAt: Date; title: string }[];
  tasks?: { title: string; dueDate: Date | null }[];
}

interface LeadTableProps {
  leads: SerializedLead[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: { status: string; priority: string; source: string }) => void;
  onSortChange: (sortBy: string) => void;
  onViewLead: (lead: SerializedLead) => void;
  onEditLead: (lead: SerializedLead) => void;
  onArchiveLead: (lead: SerializedLead) => void;
  users?: { id: string; name: string | null; email: string }[];
}

export function LeadTable({
  leads,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onViewLead,
  onEditLead,
  onArchiveLead,
}: LeadTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    company: true,
    domain: true,
    status: true,
    priority: true,
    score: true,
    source: true,
    contactMethod: true,
    assignedTo: true,
    nextFollowUp: true,
    createdDate: true,
    actions: true,
  });

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchTerm);
  };

  const handleFilterApply = (status: string, priority: string, source: string) => {
    setStatusFilter(status);
    setPriorityFilter(priority);
    setSourceFilter(source);
    onFilterChange({ status, priority, source });
  };

  const priorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return <Badge variant="destructive">Urgent</Badge>;
      case Priority.HIGH:
        return <Badge variant="warning">High</Badge>;
      case Priority.MEDIUM:
        return <Badge variant="default">Medium</Badge>;
      case Priority.LOW:
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const statusBadge = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW:
        return <Badge variant="default">New</Badge>;
      case LeadStatus.CONTACTED:
        return <Badge variant="secondary">Contacted</Badge>;
      case LeadStatus.IN_PROGRESS:
        return <Badge variant="warning">In Progress</Badge>;
      case LeadStatus.QUALIFIED:
        return <Badge variant="success">Qualified</Badge>;
      case LeadStatus.CONVERTED:
        return <Badge variant="success">Converted</Badge>;
      case LeadStatus.ARCHIVED:
        return <Badge variant="outline">Archived</Badge>;
      case LeadStatus.UNQUALIFIED:
      default:
        return <Badge variant="secondary">Unqualified</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Column Visibility */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-lg bg-card border border-border">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search company, domain, contact, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-md bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </form>

        {/* Filters & Column Visibility */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            className="h-9 text-xs w-32"
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "New", value: LeadStatus.NEW },
              { label: "Contacted", value: LeadStatus.CONTACTED },
              { label: "In Progress", value: LeadStatus.IN_PROGRESS },
              { label: "Qualified", value: LeadStatus.QUALIFIED },
              { label: "Converted", value: LeadStatus.CONVERTED },
              { label: "Archived", value: LeadStatus.ARCHIVED },
            ]}
            value={statusFilter}
            onChange={(e) => handleFilterApply(e.target.value, priorityFilter, sourceFilter)}
          />

          <Select
            className="h-9 text-xs w-32"
            options={[
              { label: "All Priorities", value: "ALL" },
              { label: "Low", value: Priority.LOW },
              { label: "Medium", value: Priority.MEDIUM },
              { label: "High", value: Priority.HIGH },
              { label: "Urgent", value: Priority.URGENT },
            ]}
            value={priorityFilter}
            onChange={(e) => handleFilterApply(statusFilter, e.target.value, sourceFilter)}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnPicker(true)}
            className="h-9"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Columns</span>
          </Button>
        </div>
      </div>

      {/* Column Visibility Dialog */}
      <Dialog
        open={showColumnPicker}
        onOpenChange={setShowColumnPicker}
        title="Table Column Visibility"
        description="Select columns to display in the leads management table."
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          {Object.keys(visibleColumns).map((colKey) => (
            <label key={colKey} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={visibleColumns[colKey]}
                onChange={() => toggleColumn(colKey)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="capitalize">{colKey.replace(/([A-Z])/g, " $1")}</span>
            </label>
          ))}
        </div>
      </Dialog>

      {/* Table Data */}
      {leads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-muted-foreground" />}
          title="No Leads Found"
          description="No lead intake records matched your search query or filter criteria."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.company && (
                <TableHead onClick={() => onSortChange("company")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span>Company / Domain</span>
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns.priority && <TableHead>Priority</TableHead>}
              {visibleColumns.score && (
                <TableHead onClick={() => onSortChange("calculatedLeadScore")} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    <span>Lead Score</span>
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  </div>
                </TableHead>
              )}
              {visibleColumns.source && <TableHead>Source &amp; Method</TableHead>}
              {visibleColumns.assignedTo && <TableHead>Assigned To</TableHead>}
              {visibleColumns.nextFollowUp && <TableHead>Next Action</TableHead>}
              {visibleColumns.createdDate && <TableHead>Date Added</TableHead>}
              {visibleColumns.actions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {leads.map((lead) => {
              const hasDiscrepancy =
                lead.recordedLeadScore !== null &&
                lead.calculatedLeadScore !== null &&
                lead.recordedLeadScore !== lead.calculatedLeadScore;

              return (
                <TableRow key={lead.id}>
                  {/* Company */}
                  {visibleColumns.company && (
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                        {lead.domain && <p className="text-[11px] text-muted-foreground">{lead.domain}</p>}
                        {lead.contactPerson && (
                          <p className="text-[10px] text-muted-foreground">
                            Contact: <span className="text-foreground">{lead.contactPerson}</span>
                          </p>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Status */}
                  {visibleColumns.status && <TableCell>{statusBadge(lead.status)}</TableCell>}

                  {/* Priority */}
                  {visibleColumns.priority && <TableCell>{priorityBadge(lead.priority)}</TableCell>}

                  {/* Lead Score */}
                  {visibleColumns.score && (
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                            {lead.calculatedLeadScore ?? 0} / 30
                          </span>
                          {hasDiscrepancy && (
                            <span
                              title={`Discrepancy Callout: Recorded intake score is ${lead.recordedLeadScore} vs calculated score ${lead.calculatedLeadScore}`}
                              className="text-amber-500 cursor-help"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        {hasDiscrepancy && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                            Recorded: {lead.recordedLeadScore}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Source */}
                  {visibleColumns.source && (
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium">{lead.source || "—"}</p>
                        {lead.contactMethod && <p className="text-[10px] text-muted-foreground">{lead.contactMethod}</p>}
                      </div>
                    </TableCell>
                  )}

                  {/* Assigned To */}
                  {visibleColumns.assignedTo && (
                    <TableCell>
                      <span className="text-xs">
                        {lead.assignedUser?.name || lead.assignedUser?.email || "Unassigned"}
                      </span>
                    </TableCell>
                  )}

                  {/* Next Action */}
                  {visibleColumns.nextFollowUp && (
                    <TableCell>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-xs">
                        {lead.nextAction || "No action set"}
                      </p>
                    </TableCell>
                  )}

                  {/* Date Added */}
                  {visibleColumns.createdDate && (
                    <TableCell className="font-mono text-[11px]">
                      {lead.dateAdded ? new Date(lead.dateAdded).toLocaleDateString() : "—"}
                    </TableCell>
                  )}

                  {/* Actions */}
                  {visibleColumns.actions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewLead(lead)}
                          title="View Lead Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditLead(lead)}
                          title="Edit Lead"
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>

                        {lead.status !== LeadStatus.ARCHIVED && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onArchiveLead(lead)}
                            title="Archive Lead"
                          >
                            <Archive className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border text-xs">
        <span className="text-muted-foreground">
          Showing page <strong className="text-foreground">{currentPage}</strong> of{" "}
          <strong className="text-foreground">{totalPages || 1}</strong> ({totalCount} total leads)
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
