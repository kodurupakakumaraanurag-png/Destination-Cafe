"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createContact, updateContact, deleteContact } from "@/lib/actions/contact-actions";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Edit3,
  Trash2,
  FileText,
} from "lucide-react";

interface LeadOption {
  id: string;
  company: string;
}

interface ContactItem {
  id: string;
  leadId: string;
  name: string | null;
  designation: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isPrimary: boolean;
  createdAt: Date | string;
  lead: {
    id: string;
    company: string;
    domain: string | null;
  };
}

interface ContactsViewProps {
  initialContacts: ContactItem[];
  leads: LeadOption[];
}

export function ContactsView({ initialContacts, leads }: ContactsViewProps) {
  const [contacts, setContacts] = React.useState<ContactItem[]>(initialContacts);
  const [search, setSearch] = React.useState("");
  const [selectedLeadId, setSelectedLeadId] = React.useState("ALL");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<ContactItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [leadId, setLeadId] = React.useState("");
  const [name, setName] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);

  const { addToast } = useToast();

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesLead = selectedLeadId === "ALL" || c.leadId === selectedLeadId;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.designation && c.designation.toLowerCase().includes(q)) ||
      (c.lead && c.lead.company.toLowerCase().includes(q));

    return matchesLead && matchesSearch;
  });

  const resetForm = () => {
    setLeadId(leads[0]?.id || "");
    setName("");
    setDesignation("");
    setPhone("");
    setEmail("");
    setNotes("");
    setIsPrimary(false);
    setEditingContact(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (contact: ContactItem) => {
    setEditingContact(contact);
    setLeadId(contact.leadId);
    setName(contact.name || "");
    setDesignation(contact.designation || "");
    setPhone(contact.phone || "");
    setEmail(contact.email || "");
    setNotes(contact.notes || "");
    setIsPrimary(contact.isPrimary);
    setIsCreateOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Contact name is required.", "error");
      return;
    }
    if (!leadId) {
      addToast("Please select an associated company/lead.", "error");
      return;
    }

    setLoading(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, {
          name,
          designation,
          phone,
          email,
          notes,
          isPrimary,
        });
        addToast(`Updated contact "${name}"`, "success");
      } else {
        await createContact({
          leadId,
          name,
          designation,
          phone,
          email,
          notes,
          isPrimary,
        });
        addToast(`Created contact "${name}"`, "success");
      }

      setIsCreateOpen(false);
      resetForm();
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contact: ContactItem) => {
    if (!confirm(`Are you sure you want to delete contact "${contact.name}"?`)) return;

    try {
      await deleteContact(contact.id);
      addToast(`Deleted contact "${contact.name}"`, "success");
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete contact";
      addToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search contacts, company, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="w-48">
            <Select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              options={[
                { value: "ALL", label: "All Companies" },
                ...leads.map((l) => ({ value: l.id, label: l.company })),
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Contact
        </Button>
      </div>

      {/* Contact Cards Grid */}
      {filteredContacts.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground space-y-2">
          <User className="w-8 h-8 mx-auto text-muted-foreground/60" />
          <p className="font-semibold text-foreground">No contacts found</p>
          <p>Try adjusting search keywords or company filters, or create a new contact.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-5 space-y-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                    {contact.name ? contact.name[0].toUpperCase() : "C"}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{contact.name || "Unnamed Contact"}</span>
                      {contact.isPrimary && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-muted-foreground" />
                      <span>{contact.designation || "No designation specified"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors rounded"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Company Association */}
              <div className="p-2.5 rounded-md bg-muted/40 border border-border/50 text-xs flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-muted-foreground block font-medium">ASSOCIATED COMPANY</span>
                  <Link href={`/leads/${contact.leadId}`} className="font-bold text-foreground hover:text-primary hover:underline truncate block">
                    {contact.lead.company}
                  </Link>
                </div>
              </div>

              {/* Contact Methods */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{contact.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-foreground font-medium truncate">{contact.email || "—"}</span>
                </div>
                {contact.notes && (
                  <div className="p-2 rounded bg-background border border-border/60 text-[11px] text-muted-foreground flex items-start gap-1.5 mt-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{contact.notes}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Contact Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingContact ? "Edit Contact Details" : "Add New Contact"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Select
            label="Associated Company / Lead *"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            disabled={Boolean(editingContact)}
            options={leads.map((l) => ({ value: l.id, label: l.company }))}
            required
          />

          <Input
            label="Contact Full Name *"
            placeholder="e.g. Vikram Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Designation / Role"
              placeholder="e.g. Head of Operations"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Email Address"
            placeholder="e.g. vikram@company.demo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Notes & Key Insights</label>
            <textarea
              className="w-full min-h-[70px] p-2.5 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Record personal preferences, decision-making authority, or availability..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <span>Set as Primary Contact for this company</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingContact ? "Save Changes" : "Create Contact"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
