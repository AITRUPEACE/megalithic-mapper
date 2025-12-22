import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppSidebar } from "@/widgets/navigation/app-sidebar";
import { AppTopbar } from "@/widgets/navigation/app-topbar";
import { MobileNavbar } from "@/widgets/navigation/mobile-navbar";
import { TourProvider } from "@/features/onboarding";
import { NavigationProgress } from "@/components/providers/NavigationProgress";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<TourProvider>
			<Suspense fallback={null}>
				<NavigationProgress />
			</Suspense>
			<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
				<AppSidebar />
				<div className="flex min-w-0 flex-1 flex-col">
					<AppTopbar />
					<main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">{children}</main>
					<MobileNavbar />
				</div>
			</div>
		</TourProvider>
	);
}
