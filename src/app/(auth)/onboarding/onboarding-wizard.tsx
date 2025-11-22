"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles } from "lucide-react";
import {
  onboardingSchema,
  completeOnboarding,
  type OnboardingValues,
  type ProfileRecord,
  type MapViewport,
  DEFAULT_VIEWPORT,
} from "@/lib/supabase/profile";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { VerificationReadinessCard } from "@/features/verification/ui/verification-readiness-card";
import { useUserStore } from "@/entities/user/model/user-store";

const viewportPresets: { id: string; label: string; description: string; viewport: MapViewport }[] = [
  {
    id: "global",
    label: "Global overview",
    description: "Zoomed out for scanning planetary patterns.",
    viewport: { latitude: 20, longitude: 0, zoom: 2 },
  },
  {
    id: "mediterranean",
    label: "Mediterranean focus",
    description: "Centered on the Mediterranean, Levant, and Mesopotamia.",
    viewport: { latitude: 34, longitude: 15, zoom: 4 },
  },
  {
    id: "andes",
    label: "Andes + Mesoamerica",
    description: "Ideal for Olmec, Maya, and Inca research threads.",
    viewport: { latitude: 2, longitude: -72, zoom: 4 },
  },
  {
    id: "india",
    label: "Indus + South Asia",
    description: "Highlights Saraswati, Mohenjo-daro, and Indian Ocean trade.",
    viewport: { latitude: 22, longitude: 78, zoom: 4 },
  },
];

interface OnboardingWizardProps {
  profile: ProfileRecord | null;
}

const stepSchemas = [
  onboardingSchema.pick({ fullName: true, headline: true, location: true, defaultViewport: true }),
  onboardingSchema.pick({ expertiseTags: true }),
  onboardingSchema.pick({ contributionIntent: true, collaborationFocus: true }),
  onboardingSchema.pick({ notifyResearch: true, notifyProduct: true }),
];

const steps = [
  { title: "Profile basics", description: "Name, location, and preferred map view" },
  { title: "Expertise", description: "Tags that describe your skills" },
  { title: "Intent", description: "How you plan to contribute" },
  { title: "Notifications", description: "Stay in the loop" },
];

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const router = useRouter();
  const hydrateStore = useUserStore((state) => state.hydrateProfile);
  const [currentStep, setCurrentStep] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initialValues: OnboardingValues = useMemo(
    () => ({
      fullName: profile?.full_name ?? "",
      headline: profile?.headline ?? "",
      location: profile?.location,
      defaultViewport: profile?.default_viewport ?? DEFAULT_VIEWPORT,
      expertiseTags: profile?.expertise_tags?.length ? profile.expertise_tags : [],
      contributionIntent: profile?.contribution_intent ?? "",
      collaborationFocus: profile?.collaboration_focus,
      notifyResearch: profile?.notify_research_activity ?? true,
      notifyProduct: profile?.notify_product_updates ?? false,
    }),
    [profile]
  );

  const [formValues, setFormValues] = useState<OnboardingValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof OnboardingValues, value: OnboardingValues[typeof field]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (index: number) => {
    const result = stepSchemas[index].safeParse(formValues);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (key) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (formValues.expertiseTags.includes(trimmed)) return;
    updateField("expertiseTags", [...formValues.expertiseTags, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    updateField(
      "expertiseTags",
      formValues.expertiseTags.filter((item) => item !== tag)
    );
  };

  const handleSubmit = () => {
    const result = onboardingSchema.safeParse(formValues);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (key) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setServerError("Please resolve the highlighted fields.");
      return;
    }

    setServerError(null);
    setServerSuccess(null);
    startTransition(async () => {
      try {
        const saved = await completeOnboarding(result.data);
        hydrateStore(saved);
        setServerSuccess("Profile saved. Redirecting to the map...");
        setTimeout(() => router.push("/map"), 1200);
      } catch (error) {
        console.error(error);
        setServerError(
          error instanceof Error ? error.message : "We could not save your onboarding data."
        );
      }
    });
  };

  const renderStepFields = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full name</label>
              <Input
                value={formValues.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Dr. Aiyana Reyes"
              />
              {fieldErrors.fullName && (
                <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Headline</label>
              <Input
                value={formValues.headline}
                onChange={(event) => updateField("headline", event.target.value)}
                placeholder="Geoarchaeologist mapping megalithic acoustics"
              />
              {fieldErrors.headline && (
                <p className="text-sm text-destructive">{fieldErrors.headline}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formValues.location ?? ""}
                onChange={(event) =>
                  updateField("location", event.target.value.trim() ? event.target.value : null)
                }
                placeholder="Cusco, Peru"
              />
              {fieldErrors.location && (
                <p className="text-sm text-destructive">{fieldErrors.location}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default map viewport</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {viewportPresets.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => updateField("defaultViewport", preset.viewport)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition",
                      formValues.defaultViewport.latitude === preset.viewport.latitude &&
                        formValues.defaultViewport.longitude === preset.viewport.longitude &&
                        formValues.defaultViewport.zoom === preset.viewport.zoom
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <p className="text-sm font-semibold">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
              {fieldErrors["defaultViewport"] && (
                <p className="text-sm text-destructive">{fieldErrors.defaultViewport}</p>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Expertise tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="e.g. archaeoastronomy"
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  Add
                </Button>
              </div>
              {fieldErrors.expertiseTags && (
                <p className="text-sm text-destructive">{fieldErrors.expertiseTags}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-3">
                {formValues.expertiseTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags added yet.</p>
                )}
                {formValues.expertiseTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-2">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Contribution intent</label>
              <Textarea
                value={formValues.contributionIntent}
                onChange={(event) => updateField("contributionIntent", event.target.value)}
                rows={4}
                placeholder="Share how you plan to document, analyze, or mentor within the community."
              />
              {fieldErrors.contributionIntent && (
                <p className="text-sm text-destructive">{fieldErrors.contributionIntent}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Collaboration focus (optional)</label>
              <Textarea
                value={formValues.collaborationFocus ?? ""}
                onChange={(event) =>
                  updateField(
                    "collaborationFocus",
                    event.target.value.trim() ? event.target.value : null
                  )
                }
                rows={3}
                placeholder="List the types of partners, digs, or comparative research you hope to join."
              />
              {fieldErrors.collaborationFocus && (
                <p className="text-sm text-destructive">{fieldErrors.collaborationFocus}</p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={formValues.notifyResearch}
                  onChange={(event) => updateField("notifyResearch", event.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold">Research activity recaps</p>
                  <p className="text-muted-foreground">
                    Weekly digests of dig logs, hypothesis debates, and map edits near your viewport.
                  </p>
                </div>
              </label>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={formValues.notifyProduct}
                  onChange={(event) => updateField("notifyProduct", event.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold">Product announcements</p>
                  <p className="text-muted-foreground">
                    Occasional updates about new map layers, verification tooling, and workshops.
                  </p>
                </div>
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-primary">Welcome aboard</p>
          <h1 className="text-3xl font-semibold">Finish setting up your contributor profile</h1>
          <p className="text-muted-foreground">
            These details personalize map recommendations, collaboration invites, and verification prep.
          </p>
        </div>
        <Card className="border-border/40 bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Step {currentStep + 1} of {steps.length}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={cn(
                    "rounded-lg border p-3 text-xs",
                    index === currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground"
                  )}
                >
                  <p className="font-semibold">{step.title}</p>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
            {renderStepFields()}
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {serverSuccess && (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {serverSuccess}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Progress saves automatically once you submit the final step.
              </div>
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button type="button" variant="ghost" onClick={handleBack} disabled={isPending}>
                    Back
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={isPending}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isPending}>
                    {isPending ? "Saving..." : "Finish onboarding"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <VerificationReadinessCard />
        <Card className="border-border/40 bg-background/40">
          <CardHeader>
            <CardTitle className="text-base">What happens after onboarding?</CardTitle>
            <CardDescription>
              Your preferred map viewport and collaboration cues personalize the in-app feed immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>• The site map centers on your chosen region by default.</p>
            <p>• Collaboration invites highlight members with overlapping expertise tags.</p>
            <p>• You can revisit these settings anytime from your profile.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
