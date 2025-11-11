"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message?: string }

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Please share your name"),
})

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("\n")
    return { status: "error", message }
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { status: "error", message: error.message }
  }

  redirect("/onboarding")
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  })

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("\n")
    return { status: "error", message }
  }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      },
    },
  })

  if (error) {
    return { status: "error", message: error.message }
  }

  return {
    status: "success",
    message: "Check your email to confirm your account before signing in.",
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut({ scope: "global" })
  redirect("/")
}
