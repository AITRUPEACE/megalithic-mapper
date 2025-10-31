"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { Profile } from "@/lib/supabase/types"
import { saveProfileAction, type ProfileFormState } from "../profile/actions"

const initialState: ProfileFormState = { status: "idle" }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  )
}

interface ProfileEditFormProps {
  profile: Profile
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [state, formAction] = useFormState(saveProfileAction, initialState)

  return (
    <Card className="shadow-md">
      <form action={formAction} className="space-y-6">
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update how the community sees your expertise and contributions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="display_name" className="text-sm font-medium">
                Display name
              </label>
              <Input id="display_name" name="display_name" defaultValue={profile.display_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="tagline" className="text-sm font-medium">
                Tagline
              </label>
              <Input id="tagline" name="tagline" defaultValue={profile.tagline ?? ""} placeholder="Megastructures researcher" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input id="location" name="location" defaultValue={profile.location ?? ""} />
            </div>
            <div className="space-y-2">
              <label htmlFor="affiliation" className="text-sm font-medium">
                Affiliation
              </label>
              <Input id="affiliation" name="affiliation" defaultValue={profile.affiliation ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="specialties" className="text-sm font-medium">
                Specialties
              </label>
              <Input
                id="specialties"
                name="specialties"
                defaultValue={profile.specialties?.join(", ") ?? ""}
                placeholder="Monumental architecture, archaeoastronomy"
              />
              <p className="text-xs text-muted-foreground">Separate specialties with commas.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="interests" className="text-sm font-medium">
                Collaboration interests
              </label>
              <Input
                id="interests"
                name="interests"
                defaultValue={profile.interests?.join(", ") ?? ""}
                placeholder="Remote sensing, oral histories"
              />
              <p className="text-xs text-muted-foreground">Separate interests with commas.</p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} rows={6} />
          </div>
          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-medium">
              Website
            </label>
            <Input id="website" name="website" defaultValue={profile.website ?? ""} placeholder="https://example.com" />
          </div>
          {state.status === "error" ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
          ) : null}
          {state.status === "success" && state.message ? (
            <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{state.message}</p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Need to change your email or password? Manage credentials from the security tab.
          </p>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
