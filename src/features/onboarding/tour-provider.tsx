"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { WorldTour } from "./world-tour";

interface TourContextValue {
	startTour: () => void;
	isActive: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
	const context = useContext(TourContext);
	if (!context) {
		throw new Error("useTour must be used within TourProvider");
	}
	return context;
}

interface TourProviderProps {
	children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
	const [showTour, setShowTour] = useState(false);
	const [hasChecked, setHasChecked] = useState(false);

	// Check onboarding status on mount
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
				console.error("Failed to check onboarding status:", error);
			} finally {
				setHasChecked(true);
			}
		};

		// Small delay to let the page load first
		const timer = setTimeout(checkOnboarding, 1500);
		return () => clearTimeout(timer);
	}, []);

	const startTour = useCallback(() => {
		setShowTour(true);
	}, []);

	const completeTour = useCallback(async () => {
		setShowTour(false);

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

	return (
		<TourContext.Provider value={{ startTour, isActive: showTour }}>
			{children}
			{hasChecked && <WorldTour isOpen={showTour} onComplete={completeTour} onSkip={skipTour} />}
		</TourContext.Provider>
	);
}

