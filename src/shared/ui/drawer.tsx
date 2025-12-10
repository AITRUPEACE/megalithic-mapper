"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/shared/lib/utils";

const DrawerOverlayContext = React.createContext(true);

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
	showOverlay?: boolean;
};

function Drawer({ showOverlay = true, ...props }: DrawerProps) {
	return (
		<DrawerOverlayContext.Provider value={showOverlay}>
			<DrawerPrimitive.Root data-slot="drawer" {...props} />
		</DrawerOverlayContext.Provider>
	);
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	const showOverlay = React.useContext(DrawerOverlayContext);
	if (!showOverlay) {
		return null;
	}
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[1200] bg-black/50",
				className
			)}
			{...props}
		/>
	);
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	return (
		<DrawerPortal data-slot="drawer-portal">
			<DrawerOverlay {...props} />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					"group/drawer-content fixed z-[1201] flex flex-col bg-card shadow-lg",
					"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300",
					// Bottom drawer: use max-h with snap points, positioned at bottom
					"data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:max-h-[95dvh] data-[vaul-drawer-direction=bottom]:w-full data-[vaul-drawer-direction=bottom]:rounded-t-[20px] data-[vaul-drawer-direction=bottom]:border-t",
					"data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:h-auto data-[vaul-drawer-direction=top]:w-full data-[vaul-drawer-direction=top]:rounded-b-[20px] data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:data-[state=open]:translate-y-0 data-[vaul-drawer-direction=top]:data-[state=closed]:-translate-y-full",
					"data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:w-[360px] data-[vaul-drawer-direction=right]:md:w-[420px] data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:data-[state=open]:translate-x-0 data-[vaul-drawer-direction=right]:data-[state=closed]:translate-x-full",
					"data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:sm:w-[360px] data-[vaul-drawer-direction=left]:md:w-[420px] data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:data-[state=open]:translate-x-0 data-[vaul-drawer-direction=left]:data-[state=closed]:-translate-x-full",
					className
				)}
				{...props}
			>
				{/* Drag handle for bottom drawer */}
				<div className="bg-muted-foreground/40 mx-auto mt-3 mb-2 hidden h-1.5 w-12 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
				className
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="drawer-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("text-foreground font-semibold", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
