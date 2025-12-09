import type { ReactNode } from "react";
import { AppSidebar } from "@/widgets/navigation/app-sidebar";
import { AppTopbar } from "@/widgets/navigation/app-topbar";
import { MobileNavbar } from "@/widgets/navigation/mobile-navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-[#0a0c10] text-foreground">
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<AppTopbar />
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0a0c10] p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
					<div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 sm:gap-6">{children}</div>
				</main>
				<MobileNavbar />
			</div>
		</div>
	);
}
