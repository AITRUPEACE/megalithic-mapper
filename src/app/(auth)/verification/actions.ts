"use server"

import { Buffer } from "node:buffer"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type VerificationFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string }

const verificationSchema = z.object({
  statement: z.string().min(20, "Share details that help administrators verify your work."),
})

export async function submitVerificationRequest(
  _: VerificationFormState,
  formData: FormData
): Promise<VerificationFormState> {
  const parsed = verificationSchema.safeParse({ statement: formData.get("statement") })

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("\n")
    return { status: "error", message }
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { status: "error", message: "You must be signed in to request verification." }
  }

  const files = formData.getAll("evidence") as File[]
  const evidencePaths: string[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue

    const arrayBuffer = await file.arrayBuffer()
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}${fileExt ? `.${fileExt}` : ""}`

    const { error: uploadError } = await supabase.storage
      .from("verification")
      .upload(fileName, Buffer.from(arrayBuffer), {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      })

    if (uploadError) {
      return { status: "error", message: uploadError.message }
    }

    evidencePaths.push(fileName)
  }

  const { error: insertError } = await supabase.from("verification_requests").insert({
    user_id: user.id,
    statement: parsed.data.statement,
    evidence_paths: evidencePaths,
    status: "pending",
  })

  if (insertError) {
    return { status: "error", message: insertError.message }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      needs_verification_review: true,
      verification_status: "pending",
    })
    .eq("id", user.id)

  if (updateError) {
    return { status: "error", message: updateError.message }
  }

  await revalidatePath("/verification", "page")

  return {
    status: "success",
    message: "Your verification request has been submitted. Our admin team will follow up soon.",
  }
}
