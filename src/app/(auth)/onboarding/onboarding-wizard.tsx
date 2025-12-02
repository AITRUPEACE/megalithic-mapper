"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  ImagePlus
} from "lucide-react";
import { z } from "zod";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { completeOnboarding } from "@/lib/supabase/profile-actions";
import { useUserStore } from "@/entities/user/model/user-store";
import { SocialLinksInput, type SocialLink } from "@/components/onboarding/social-links-input";
import { ProfilePreviewCard } from "@/components/onboarding/profile-preview-card";
import type { ProfileRecord, MapViewport } from "@/lib/supabase/profile";
import { DEFAULT_VIEWPORT } from "@/lib/supabase/profile";

// Simplified schema - minimal required fields
const creatorOnboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  fullName: z.string().min(2, "Please add your name"),
  headline: z.string().min(6, "Add a short headline about you"),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  socialLinks: z.array(z.object({
    id: z.string(),
    platform: z.enum(["youtube", "twitter", "instagram", "website", "other"]),
    url: z.string(),
    label: z.string().optional(),
  })).optional(),
  expertiseTags: z.array(z.string()).optional(),
});

type CreatorOnboardingValues = z.infer<typeof creatorOnboardingSchema>;

interface OnboardingWizardProps {
  profile: ProfileRecord | null;
}

const suggestedTags = [
  "Ancient Egypt",
  "Megalithic Structures", 
  "Lost Civilizations",
  "Archaeoastronomy",
  "Younger Dryas",
  "Pre-Columbian Americas",
  "Göbekli Tepe",
  "Ancient Technology",
  "Sacred Geometry",
  "Alternative History",
];

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const router = useRouter();
  const hydrateStore = useUserStore((state) => state.hydrateProfile);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [formValues, setFormValues] = useState<CreatorOnboardingValues>({
    username: profile?.username ?? "",
    fullName: profile?.full_name ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    avatarUrl: profile?.avatar_url ?? "",
    websiteUrl: profile?.website_url ?? "",
    socialLinks: [],
    expertiseTags: profile?.expertise_tags ?? [],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof CreatorOnboardingValues>(
    field: K, 
    value: CreatorOnboardingValues[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (formValues.expertiseTags?.includes(trimmed)) return;
    updateField("expertiseTags", [...(formValues.expertiseTags || []), trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    updateField(
      "expertiseTags",
      (formValues.expertiseTags || []).filter((t) => t !== tag)
    );
  };

  const handleSubmit = () => {
    const result = creatorOnboardingSchema.safeParse(formValues);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (key) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setServerError("Please fill in the required fields");
      return;
    }

    setServerError(null);
    startTransition(async () => {
      try {
        // Transform to the format expected by completeOnboarding
        const saved = await completeOnboarding({
          username: result.data.username,
          fullName: result.data.fullName,
          headline: result.data.headline,
          location: result.data.location || null,
          defaultViewport: DEFAULT_VIEWPORT,
          expertiseTags: result.data.expertiseTags || [],
          contributionIntent: "Creator profile - contributing sites and research",
          collaborationFocus: null,
          notifyResearch: true,
          notifyProduct: false,
        });
        
        hydrateStore(saved);
        setShowSuccess(true);
      } catch (error) {
        console.error(error);
        setServerError(
          error instanceof Error ? error.message : "Something went wrong"
        );
      }
    });
  };

  // Success state - show next steps
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        
        <h1 className="mb-2 font-serif text-3xl font-semibold">
          You're all set, {formValues.fullName.split(" ")[0]}!
        </h1>
        
        <p className="mb-8 text-muted-foreground">
          Your profile is live. Ready to add your first discovery to the map?
        </p>

        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={() => router.push("/map?action=add-site")}
          >
            <MapPin className="h-4 w-4" />
            Pin your first site
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full text-muted-foreground"
            onClick={() => router.push("/map")}
          >
            Just explore the map for now
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          You can always add sites later from any location on the map
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="h-4 w-4" />
          Welcome to Megalithic Mapper
        </div>
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">
          Set up your profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Takes about 2 minutes. You can always edit this later.
        </p>
      </motion.div>

      {/* Main content - form + preview */}
      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Basic info */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-6">
            <h2 className="mb-4 text-lg font-semibold">The basics</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Display name *
                </label>
                <Input
                  value={formValues.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Graham Hancock"
                  className={cn(fieldErrors.fullName && "border-destructive")}
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    value={formValues.username}
                    onChange={(e) => updateField("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="grahamhancock"
                    className={cn("pl-8", fieldErrors.username && "border-destructive")}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Location
                </label>
                <Input
                  value={formValues.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Bath, UK"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Headline *
                </label>
                <Input
                  value={formValues.headline}
                  onChange={(e) => updateField("headline", e.target.value)}
                  placeholder="Author & journalist exploring ancient civilizations"
                  className={cn(fieldErrors.headline && "border-destructive")}
                />
                {fieldErrors.headline && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.headline}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  One line about who you are and what you do
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  About you <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  value={formValues.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell your story... What drives your interest in ancient civilizations? What are you currently researching?"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-6">
            <h2 className="mb-1 text-lg font-semibold">Your links</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Where can people find your work?
            </p>
            
            <SocialLinksInput
              links={formValues.socialLinks || []}
              onChange={(links) => updateField("socialLinks", links)}
            />
          </div>

          {/* Focus areas */}
          <div className="rounded-xl border border-border/40 bg-card/50 p-6">
            <h2 className="mb-1 text-lg font-semibold">Focus areas</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              What topics are you into? (helps us connect you with others)
            </p>
            
            {/* Tag input */}
            <div className="mb-3 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add a topic..."
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => handleAddTag(tagInput)}
              >
                Add
              </Button>
            </div>

            {/* Selected tags */}
            {(formValues.expertiseTags?.length ?? 0) > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {formValues.expertiseTags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1.5">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested tags */}
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Quick add:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags
                  .filter((tag) => !formValues.expertiseTags?.includes(tag))
                  .slice(0, 6)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Creating profile..." : "Create my profile"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:sticky lg:top-8"
        >
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Preview
          </p>
          <ProfilePreviewCard
            displayName={formValues.fullName}
            username={formValues.username}
            headline={formValues.headline}
            avatarUrl={formValues.avatarUrl}
            location={formValues.location}
            socialLinks={formValues.socialLinks || []}
            expertiseTags={formValues.expertiseTags}
          />
        </motion.div>
      </div>
    </div>
  );
}
