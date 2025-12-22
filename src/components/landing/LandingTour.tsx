"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { MapPin, Filter, ThumbsUp, Bookmark, Users, Plus, ChevronRight, ChevronLeft, X, Play } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: "center";
}

const LANDING_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Megalithic Mapper",
    description:
      "Explore ancient sites, contribute discoveries, and connect with researchers worldwide. Let's take a quick tour of the key features.",
    icon: <MapPin className="h-8 w-8 text-primary" />,
    position: "center",
  },
  {
    id: "map",
    title: "Interactive Map",
    description: "Pan, zoom, and explore ancient sites around the world. Click on any pin to see detailed information, photos, and research links.",
    icon: <MapPin className="h-8 w-8 text-blue-500" />,
    position: "center",
  },
  {
    id: "filters",
    title: "Smart Filtering",
    description: "Filter sites by culture, era, type, and more. Toggle between Official (verified) and Community (user-submitted) layers.",
    icon: <Filter className="h-8 w-8 text-purple-500" />,
    position: "center",
  },
  {
    id: "details",
    title: "Site Details",
    description: "View comprehensive information including coordinates, media, documents, and discussion threads for each site.",
    icon: <Bookmark className="h-8 w-8 text-amber-500" />,
    position: "center",
  },
  {
    id: "voting",
    title: "Community Verification",
    description: "Help verify community submissions by voting. Sites with enough approvals get promoted to the Official layer.",
    icon: <ThumbsUp className="h-8 w-8 text-green-500" />,
    position: "center",
  },
  {
    id: "contribute",
    title: "Contribute Discoveries",
    description: "Submit new sites you've discovered or researched. Add photos, links, and documentation to support your contributions.",
    icon: <Plus className="h-8 w-8 text-emerald-500" />,
    position: "center",
  },
  {
    id: "community",
    title: "Join the Community",
    description: "Follow researchers, discuss findings, and earn badges for your contributions. Ready to explore?",
    icon: <Users className="h-8 w-8 text-pink-500" />,
    position: "center",
  },
];

interface LandingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingTour({ isOpen, onClose }: LandingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (currentStep < LANDING_TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onClose();
    }
  }, [currentStep, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleNext, handlePrev, handleSkip]);

  if (!isVisible) return null;

  const step = LANDING_TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === LANDING_TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] transition-opacity duration-300" 
        onClick={handleSkip} 
      />

      {/* Tour Card */}
      <Card
        className={cn(
          "fixed z-[9999] w-full max-w-md shadow-2xl border-primary/20 transition-all duration-300",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        {/* Close button */}
        <button 
          onClick={handleSkip} 
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-4">
            {LANDING_TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : index < currentStep 
                      ? "w-3 bg-primary/50" 
                      : "w-3 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">{step.icon}</div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-center mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-center text-sm mb-6">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrev} 
              disabled={isFirstStep} 
              className={cn(isFirstStep && "invisible")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {LANDING_TOUR_STEPS.length}
            </span>

            <Button size="sm" onClick={handleNext} className="gap-1">
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skip link */}
          {!isLastStep && (
            <div className="text-center mt-4">
              <button 
                onClick={handleSkip} 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Button component to trigger the tour
interface TourButtonProps {
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function TourButton({ onClick, variant = "outline", size = "default", className }: TourButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "gap-2",
        variant === "outline" && "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      <Play className="h-4 w-4" />
      Take the Tour
    </Button>
  );
}


