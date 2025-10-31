"use client"

import { useFormState, useFormStatus } from "react-dom"
import Link from "next/link"
import { AuthCard } from "./auth-card"
import { signInAction, signUpAction, type AuthFormState } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const initialState: AuthFormState = { status: "idle" }

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  )
}

export function SignInForm() {
  const [state, formAction] = useFormState(signInAction, initialState)

  return (
    <AuthCard
      title="Sign in"
      description="Access your research workspace and collaborative tools."
      footer={
        <span>
          Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline">Create one</Link>
        </span>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {state.status === "error" ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
        ) : null}
        <SubmitButton label="Sign in" />
      </form>
    </AuthCard>
  )
}

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, initialState)

  return (
    <AuthCard
      title="Create your account"
      description="Join the Megalithic Mapper community and start contributing insights."
      footer={
        <span>
          Already registered? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </span>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" type="text" required placeholder="Jane Archaeologist" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
        </div>
        {state.status === "error" ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
        ) : null}
        {state.status === "success" && state.message ? (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{state.message}</p>
        ) : null}
        <SubmitButton label="Create account" />
      </form>
    </AuthCard>
  )
}
