"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/supabase/types"

export type ProfileFormState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string }

const profileSchema = z.object({
  display_name: z.string().min(2, "Display name is required"),
  tagline: z.string().max(140).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  affiliation: z.string().max(120).optional().or(z.literal("")),
  specialties: z.string().optional().or(z.literal("")),
  interests: z.string().optional().or(z.literal("")),
  bio: z.string().max(1200).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
})

type PersistOptions = {
  markOnboardingComplete?: boolean
}

async function persistProfile(formData: FormData, options: PersistOptions = {}) {
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    tagline: formData.get("tagline"),
    location: formData.get("location"),
    affiliation: formData.get("affiliation"),
    specialties: formData.get("specialties"),
    interests: formData.get("interests"),
    bio: formData.get("bio"),
    website: formData.get("website"),
  })

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("\n")
    return { status: "error" as const, message }
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { status: "error" as const, message: "You need to sign in to update your profile." }
  }

  const specialties = parsed.data.specialties
    ? parsed.data.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const interests = parsed.data.interests
    ? parsed.data.interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const payload: Partial<Profile> = {
    display_name: parsed.data.display_name,
    tagline: parsed.data.tagline || null,
    location: parsed.data.location || null,
    affiliation: parsed.data.affiliation || null,
    specialties,
    interests,
    bio: parsed.data.bio || null,
    website: parsed.data.website || null,
  }

  if (options.markOnboardingComplete) {
    payload.onboarding_complete = true
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { status: "error" as const, message: error.message }
  }

  await revalidatePath("/profile", "page")

  return { status: "success" as const }
}

export async function saveProfileAction(_: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const result = await persistProfile(formData)
  if (result.status === "error") {
    return result
  }

  return { status: "success", message: "Profile updated" }
}

export async function completeOnboardingAction(
  _: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const result = await persistProfile(formData, { markOnboardingComplete: true })

  if (result.status === "error") {
    return result
  }

  redirect("/")
}
