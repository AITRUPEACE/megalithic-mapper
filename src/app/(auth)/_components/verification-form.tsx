"use client"

import { useMemo } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitVerificationRequest, type VerificationFormState } from "../verification/actions"

const initialState: VerificationFormState = { status: "idle" }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? "Submitting…" : "Submit for review"}
    </Button>
  )
}

export function VerificationForm({ existingEvidenceCount = 0 }: { existingEvidenceCount?: number }) {
  const [state, formAction] = useFormState(submitVerificationRequest, initialState)

  const helperText = useMemo(() => {
    if (existingEvidenceCount > 0) {
      return `You have ${existingEvidenceCount} files on record. Upload new documents to provide additional context.`
    }
    return "Upload supporting documents such as research letters, permits, or datasets."
  }, [existingEvidenceCount])

  return (
    <Card className="shadow-md">
      <form action={formAction} className="space-y-6" encType="multipart/form-data">
        <CardHeader>
          <CardTitle>Request verification</CardTitle>
          <CardDescription>
            Provide evidence that demonstrates your credibility. Our admin team will review submissions within 2-3 business
            days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="statement" className="text-sm font-medium">
              Statement of work
            </label>
            <Textarea
              id="statement"
              name="statement"
              required
              rows={6}
              placeholder="Summarize your background, relevant publications, and why your account should be verified."
            />
            <p className="text-xs text-muted-foreground">
              Include references to field work, publications, or institutional affiliations that can be validated.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="evidence" className="text-sm font-medium">
              Supporting evidence
            </label>
            <Input id="evidence" name="evidence" type="file" multiple accept="image/*,application/pdf" />
            <p className="text-xs text-muted-foreground">{helperText}</p>
          </div>
          {state.status === "error" ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
          ) : null}
          {state.status === "success" ? (
            <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{state.message}</p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Once submitted, your profile will be flagged for review and you&apos;ll receive email updates.
          </p>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
