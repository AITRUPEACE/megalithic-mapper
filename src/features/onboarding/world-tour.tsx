"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";
import { MapPin, Filter, ThumbsUp, Bookmark, Users, Plus, ChevronRight, ChevronLeft, X } from "lucide-react";

interface TourStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	target?: string; // CSS selector for element to highlight
	position?: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
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
		target: "[data-tour='map-container']",
		position: "bottom",
	},
	{
		id: "filters",
		title: "Smart Filtering",
		description: "Filter sites by culture, era, type, and more. Toggle between Official (verified) and Community (user-submitted) layers.",
		icon: <Filter className="h-8 w-8 text-purple-500" />,
		target: "[data-tour='filters']",
		position: "right",
	},
	{
		id: "details",
		title: "Site Details",
		description: "View comprehensive information including coordinates, media, documents, and discussion threads for each site.",
		icon: <Bookmark className="h-8 w-8 text-amber-500" />,
		target: "[data-tour='detail-panel']",
		position: "left",
	},
	{
		id: "voting",
		title: "Community Verification",
		description: "Help verify community submissions by voting. Sites with enough approvals get promoted to the Official layer.",
		icon: <ThumbsUp className="h-8 w-8 text-green-500" />,
		target: "[data-tour='voting']",
		position: "top",
	},
	{
		id: "contribute",
		title: "Contribute Discoveries",
		description: "Submit new sites you've discovered or researched. Add photos, links, and documentation to support your contributions.",
		icon: <Plus className="h-8 w-8 text-emerald-500" />,
		target: "[data-tour='contribute']",
		position: "bottom",
	},
	{
		id: "community",
		title: "Join the Community",
		description: "Follow researchers, discuss findings, and earn badges for your contributions. Welcome to the community!",
		icon: <Users className="h-8 w-8 text-pink-500" />,
		position: "center",
	},
];

interface WorldTourProps {
	isOpen: boolean;
	onComplete: () => void;
	onSkip: () => void;
}

export function WorldTour({ isOpen, onComplete, onSkip }: WorldTourProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			setCurrentStep(0);
		}
	}, [isOpen]);

	const handleNext = useCallback(() => {
		if (currentStep < TOUR_STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			// Complete the tour
			setIsVisible(false);
			onComplete();
		}
	}, [currentStep, onComplete]);

	const handlePrev = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	}, [currentStep]);

	const handleSkip = useCallback(() => {
		setIsVisible(false);
		onSkip();
	}, [onSkip]);

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

	const step = TOUR_STEPS[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === TOUR_STEPS.length - 1;
	const isCentered = step.position === "center" || !step.target;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/70 z-[9998] transition-opacity duration-300" onClick={handleSkip} />

			{/* Tour Card */}
			<Card
				className={cn(
					"fixed z-[9999] w-full max-w-md shadow-2xl border-primary/20 transition-all duration-300",
					isCentered && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
					!isCentered && step.position === "bottom" && "left-1/2 top-24 -translate-x-1/2",
					!isCentered && step.position === "top" && "left-1/2 bottom-24 -translate-x-1/2",
					!isCentered && step.position === "left" && "right-8 top-1/2 -translate-y-1/2",
					!isCentered && step.position === "right" && "left-8 top-1/2 -translate-y-1/2"
				)}
			>
				{/* Close button */}
				<button onClick={handleSkip} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors">
					<X className="h-5 w-5" />
				</button>

				<CardContent className="p-6">
					{/* Step indicator */}
					<div className="flex items-center gap-1 mb-4">
						{TOUR_STEPS.map((_, index) => (
							<div
								key={index}
								className={cn(
									"h-1.5 rounded-full transition-all duration-300",
									index === currentStep ? "w-6 bg-primary" : index < currentStep ? "w-3 bg-primary/50" : "w-3 bg-muted"
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
						<Button variant="ghost" size="sm" onClick={handlePrev} disabled={isFirstStep} className={cn(isFirstStep && "invisible")}>
							<ChevronLeft className="h-4 w-4 mr-1" />
							Back
						</Button>

						<span className="text-xs text-muted-foreground">
							{currentStep + 1} / {TOUR_STEPS.length}
						</span>

						<Button size="sm" onClick={handleNext} className="gap-1">
							{isLastStep ? "Get Started" : "Next"}
							{!isLastStep && <ChevronRight className="h-4 w-4" />}
						</Button>
					</div>

					{/* Skip link */}
					{!isLastStep && (
						<div className="text-center mt-4">
							<button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
								Skip tour
							</button>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}

// Hook to manage tour state
export function useWorldTour() {
	const [showTour, setShowTour] = useState(false);

	const startTour = useCallback(() => {
		setShowTour(true);
	}, []);

	const completeTour = useCallback(async () => {
		setShowTour(false);

		// Save completion to profile
		try {
			await fetch("/api/profile/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ completed: true }),
			});
		} catch (error) {
			console.error("Failed to save onboarding status:", error);
		}
	}, []);

	const skipTour = useCallback(async () => {
		setShowTour(false);

		// Save skip to profile
		try {
			await fetch("/api/profile/onboarding", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ skipped: true }),
			});
		} catch (error) {
			console.error("Failed to save onboarding status:", error);
		}
	}, []);

	// Check if user needs onboarding on mount
	useEffect(() => {
		const checkOnboarding = async () => {
			try {
				const response = await fetch("/api/profile/onboarding");
				if (response.ok) {
					const data = await response.json();
					if (!data.completed && !data.skipped) {
						setShowTour(true);
					}
				}
			} catch (error) {
				// Silently fail - don't show tour if we can't check status
			}
		};

		// Small delay to let the page load first
		const timer = setTimeout(checkOnboarding, 1000);
		return () => clearTimeout(timer);
	}, []);

	return {
		showTour,
		startTour,
		completeTour,
		skipTour,
	};
}


