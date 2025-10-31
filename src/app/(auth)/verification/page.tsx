import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { VerificationForm } from "../_components/verification-form"

export const metadata = {
  title: "Verification",
}

export default async function VerificationPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login?next=/verification")
  }

  const { data: existingRequests } = await supabase
    .from("verification_requests")
    .select("evidence_paths")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const evidenceCount = existingRequests?.[0]?.evidence_paths?.length ?? 0

  return <VerificationForm existingEvidenceCount={evidenceCount} />
}
