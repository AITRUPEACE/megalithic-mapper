"use client"

import { useMemo, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { Profile } from "@/lib/supabase/types"
import { completeOnboardingAction, type ProfileFormState } from "../profile/actions"

const initialState: ProfileFormState = { status: "idle" }

const steps = [
  {
    title: "Introduce yourself",
    description: "Share how other researchers should refer to you.",
  },
  {
    title: "Focus areas",
    description: "Tell us about the regions and topics you study.",
  },
  {
    title: "Collaboration goals",
    description: "Help reviewers understand how to support you.",
  },
]

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving profile…" : label}
    </Button>
  )
}

interface OnboardingWizardProps {
  profile?: Profile | null
}

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const [state, formAction] = useFormState(completeOnboardingAction, initialState)
  const [step, setStep] = useState(0)

  const currentStep = useMemo(() => steps[step], [step])
  const totalSteps = steps.length

  return (
    <Card className="shadow-xl">
      <form action={formAction} className="space-y-6">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>
            Step {step + 1} of {totalSteps}: {currentStep.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row">
            {steps.map((item, index) => (
              <div key={item.title} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex-1 rounded-full px-3 py-1 text-center text-xs font-medium ${
                    index === step
                      ? "bg-primary/10 text-primary"
                      : index < step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {item.title}
                </span>
                {index < totalSteps - 1 ? <Separator orientation="vertical" className="hidden h-8 md:block" /> : null}
              </div>
            ))}
          </div>
          <section className={step === 0 ? "space-y-4" : "hidden"} aria-hidden={step !== 0}>
            <div className="space-y-2">
              <label htmlFor="display_name" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="display_name"
                name="display_name"
                required
                defaultValue={profile?.display_name ?? ""}
                placeholder="Dr. Jane Archaeologist"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tagline" className="text-sm font-medium">
                Tagline
              </label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue={profile?.tagline ?? ""}
                placeholder="Archaeologist specializing in megalithic structures"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                name="location"
                defaultValue={profile?.location ?? ""}
                placeholder="Lisbon, Portugal"
              />
            </div>
          </section>
          <section className={step === 1 ? "space-y-4" : "hidden"} aria-hidden={step !== 1}>
            <div className="space-y-2">
              <label htmlFor="affiliation" className="text-sm font-medium">
                Affiliation or organization
              </label>
              <Input
                id="affiliation"
                name="affiliation"
                defaultValue={profile?.affiliation ?? ""}
                placeholder="University, research collective, or institution"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="specialties" className="text-sm font-medium">
                Specialties
              </label>
              <Input
                id="specialties"
                name="specialties"
                defaultValue={profile?.specialties?.join(", ") ?? ""}
                placeholder="Ceremonial architecture, archaeoastronomy"
              />
              <p className="text-xs text-muted-foreground">Separate each specialty with a comma.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="interests" className="text-sm font-medium">
                Collaboration interests
              </label>
              <Input
                id="interests"
                name="interests"
                defaultValue={profile?.interests?.join(", ") ?? ""}
                placeholder="Field surveys, 3D reconstruction, oral histories"
              />
              <p className="text-xs text-muted-foreground">Separate each interest with a comma.</p>
            </div>
          </section>
          <section className={step === 2 ? "space-y-4" : "hidden"} aria-hidden={step !== 2}>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                About your work
              </label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                rows={5}
                placeholder="Summarize your current research, past expeditions, and collaboration goals."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website or portfolio
              </label>
              <Input
                id="website"
                name="website"
                defaultValue={profile?.website ?? ""}
                placeholder="https://your-portfolio.example.com"
              />
            </div>
          </section>
          {state.status === "error" ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
          ) : null}
          <input type="hidden" name="current_step" value={String(step)} />
        </CardContent>
        <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
          <div className="flex w-full flex-col gap-2 md:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              className="w-full md:w-auto"
            >
              Back
            </Button>
            {step < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((value) => Math.min(totalSteps - 1, value + 1))}
                className="w-full md:w-auto"
              >
                Continue
              </Button>
            ) : (
              <SubmitButton label="Finish onboarding" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            You can update this information at any time from your profile settings.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
