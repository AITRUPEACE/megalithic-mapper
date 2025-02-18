"use client";

import { useState } from "react";
import { Site } from "../types/types";
import { useSiteStore } from "../store/useSiteStore";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SiteList() {
	const { sites, setSelectedSite, setViewState } = useSiteStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);

	const filteredSites = sites.filter(
		(site) =>
			site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(site.civilization?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
			site.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
			site.type.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSiteClick = (site: Site) => {
		setSelectedSite(site);
		setViewState({
			longitude: site.coordinates[0],
			latitude: site.coordinates[1],
			zoom: 12,
			bearing: 0,
			pitch: 0,
		});
	};

	return (
		<div className={`absolute bottom-4 right-4 transition-all duration-300 ${isExpanded ? "w-80" : "w-20 h-20"}`}>
			<Button
				variant="ghost"
				size="icon"
				className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-blue-950 shadow-md hover:bg-blue-800 z-10 text-white"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				{isExpanded ? <X className="h-10 w-10" /> : <Search className="h-10 w-10" />}
			</Button>

			{isExpanded && (
				<Card className="h-96 bg-background/80 backdrop-blur-sm">
					<CardHeader className="bg-background/40 pb-2">
						<CardTitle className="text-lg">Sites Directory</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 bg-background/40 p-3">
						<div className="relative">
							<Input
								type="text"
								placeholder="Search sites..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>
						<ScrollArea className="flex-1 h-64 w-full rounded-md">
							<div className="space-y-1 pr-4">
								{filteredSites.map((site) => (
									<button
										key={site.id}
										onClick={() => handleSiteClick(site)}
										className="w-full text-left px-2 py-1.5 rounded hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-gray-200"
									>
										<div className="font-medium text-sm">{site.name}</div>
										<div className="text-xs text-muted-foreground">{site.civilization || "Unknown Civilization"}</div>
									</button>
								))}
							</div>
						</ScrollArea>
						<div className="text-xs text-muted-foreground pt-2">
							Showing {filteredSites.length} of {sites.length} sites
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
