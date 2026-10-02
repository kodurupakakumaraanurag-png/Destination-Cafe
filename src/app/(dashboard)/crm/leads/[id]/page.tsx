import { redirect } from "next/navigation";

interface CRMLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CRMLeadDetailPage({ params }: CRMLeadDetailPageProps) {
  const { id } = await params;
  redirect(`/leads/${id}`);
}
