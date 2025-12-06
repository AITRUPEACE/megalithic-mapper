import type { ReactNode } from "react";
import { AppSidebar } from "@/widgets/navigation/app-sidebar";
import { AppTopbar } from "@/widgets/navigation/app-topbar";
import { MobileNavbar } from "@/widgets/navigation/mobile-navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
			<AppSidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<AppTopbar />
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950/80 p-3 pb-20 sm:p-4 md:p-6 md:pb-6">
					<div className="mx-auto flex w-full max-w-[110rem] flex-col gap-4 sm:gap-6">{children}</div>
				</main>
				<MobileNavbar />
			</div>
		</div>
	);
}
