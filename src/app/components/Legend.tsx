"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SITE_TYPES } from "../types/types";

export default function Legend() {
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className="absolute bottom-4 left-4">
			<Card className="bg-background/70 backdrop-blur-sm w-48">
				<CardHeader className="bg-background/40 py-2 px-4">
					<div className="flex justify-between items-center">
						<CardTitle className="text-sm">Legend</CardTitle>
						<Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => setIsExpanded(!isExpanded)}>
							{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
						</Button>
					</div>
				</CardHeader>
				{isExpanded && (
					<CardContent className="bg-background/40 py-2 px-4">
						<div className="space-y-2">
							{Object.values(SITE_TYPES).map((type) => (
								<div key={type.name} className="flex items-center gap-2">
									<div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: type.color }} />
									<span className="text-xs text-foreground capitalize">{type.name.replace(/-/g, " ")}</span>
								</div>
							))}
						</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
