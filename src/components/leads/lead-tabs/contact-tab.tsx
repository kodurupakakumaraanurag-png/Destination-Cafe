"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, User, Phone, Mail, MapPin, Globe, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadDetailRecord } from "@/types/lead-detail";

interface ContactTabProps {
  lead: LeadDetailRecord;
  onOpenEditModal: () => void;
}

export function ContactTab({ lead, onOpenEditModal }: ContactTabProps) {
  const isDestinationCafe = lead.company === "Destination Cafe";
  const hasContactInfo = Boolean(lead.contactPerson || lead.email || lead.phone);

  return (
    <div className="space-y-6">
      {/* Destination Cafe Specific Dossier Notice */}
      {isDestinationCafe && !hasContactInfo && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-md text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Destination Cafe Dossier Notice: Missing Direct Contact Data
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              The original intake dossier for Destination Cafe contained no verified contact person, designation, direct phone number, or email address. In accordance with platform governance rules, missing intake values are displayed as empty/null rather than fabricated.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Contact Person Card */}
        <Card>
          <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Primary Contact Person
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpenEditModal}>
              Edit Contact
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base">
                {lead.contactPerson ? lead.contactPerson[0].toUpperCase() : "C"}
              </div>
              <div>
                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                  {lead.contactPerson || "Not Provided"}
                  {lead.contactPerson && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Primary
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">{lead.designation || "No designation specified"}</div>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 border border-border/40">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block">Phone Number</span>
                  <span className="text-foreground font-medium">{lead.phone || "Empty / Null"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 border border-border/40">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block">Email Address</span>
                  <span className="text-foreground font-medium">{lead.email || "Empty / Null"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/30 border border-border/40">
                <Briefcase className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium block">Designation / Role</span>
                  <span className="text-foreground font-medium">{lead.designation || "Empty / Null"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company & Location Card */}
        <Card>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Company Location & Web Presence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="p-3 rounded-md bg-muted/30 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Physical Location & Address
              </span>
              <p className="text-foreground leading-relaxed font-medium">
                {lead.location || "No location address specified."}
              </p>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium block flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-primary" /> Official Website
              </span>
              <p className="text-foreground font-medium">
                {lead.website || "No website URL recorded."}
              </p>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border border-border/40 space-y-1">
              <span className="text-[10px] text-muted-foreground font-medium block">Intake Preferred Contact Method</span>
              <p className="text-foreground font-medium">{lead.contactMethod || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
