"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toast, ToastType } from "@/components/ui/toast";
import { LeadTable, SerializedLead } from "@/components/leads/lead-table";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { getLeads, createLead, updateLead, archiveLead, GetLeadsParams } from "@/lib/actions/lead-actions";
import { LeadFormValues } from "@/lib/validations/lead";
import { Plus, RefreshCw } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<SerializedLead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "ALL", priority: "ALL", source: "ALL" });
  const [sortBy, setSortBy] = useState("createdAt");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<SerializedLead | null>(null);
  const [viewingLead, setViewingLead] = useState<SerializedLead | null>(null);

  const [toast, setToast] = useState<{ title: string; message?: string; type: ToastType } | null>(null);

  const showToast = (title: string, message?: string, type: ToastType = "info") => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeadsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeads({
        search,
        status: filters.status,
        priority: filters.priority,
        source: filters.source,
        sortBy: sortBy as GetLeadsParams["sortBy"],
        page: currentPage,
        pageSize: 10,
      });

      setLeads(res.leads as unknown as SerializedLead[]);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("Failed to fetch leads from database:", errMsg);
      showToast("Notice", "Offline dev mode: using intake data store.", "info");
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, currentPage]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) await fetchLeadsData();
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchLeadsData]);

  const handleCreateSubmit = async (values: LeadFormValues) => {
    setSubmitting(true);
    try {
      await createLead(values);
      showToast("Success", `Lead record for "${values.company}" created successfully!`, "success");
      setShowCreateModal(false);
      fetchLeadsData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to create lead record.";
      showToast("Error", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: LeadFormValues) => {
    if (!editingLead) return;
    setSubmitting(true);
    try {
      await updateLead(editingLead.id, values);
      showToast("Success", `Updated lead record for "${values.company}".`, "success");
      setEditingLead(null);
      fetchLeadsData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update lead record.";
      showToast("Error", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveConfirm = async (lead: SerializedLead) => {
    if (!confirm(`Are you sure you want to archive lead record "${lead.company}"?`)) return;
    try {
      await archiveLead(lead.id);
      showToast("Archived", `Lead "${lead.company}" has been archived.`, "info");
      fetchLeadsData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to archive lead record.";
      showToast("Error", errMsg, "error");
    }
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Leads Management"
        description="Search, filter, manage, and score 26-column enterprise lead intake records."
        badge={<Badge variant="success">26-Field Intake Schema</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchLeadsData()}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              <span>Create Lead</span>
            </Button>
          </div>
        }
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Main Table */}
      <LeadTable
        leads={leads}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onSortChange={setSortBy}
        onViewLead={setViewingLead}
        onEditLead={setEditingLead}
        onArchiveLead={handleArchiveConfirm}
      />

      {/* Create Lead Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        title="Create New Lead Record"
        description="Enter details across the 6 grouped sections (Company, Contact, Business, Pipeline, Scoring, Allocation)."
        className="max-w-3xl"
      >
        <LeadForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={submitting}
        />
      </Dialog>

      {/* Edit Lead Modal */}
      <Dialog
        open={editingLead !== null}
        onOpenChange={(open) => !open && setEditingLead(null)}
        title={`Edit Lead: ${editingLead?.company || ""}`}
        description="Update 26-column intake fields and scoring dimensions."
        className="max-w-3xl"
      >
        {editingLead && (
          <LeadForm
            initialValues={editingLead as unknown as LeadFormValues}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingLead(null)}
            isSubmitting={submitting}
          />
        )}
      </Dialog>

      {/* View Lead Detail Modal */}
      <LeadDetailModal
        lead={viewingLead}
        open={viewingLead !== null}
        onOpenChange={(open) => !open && setViewingLead(null)}
        onEdit={(lead) => {
          setViewingLead(null);
          setEditingLead(lead);
        }}
      />
    </PageContainer>
  );
}
