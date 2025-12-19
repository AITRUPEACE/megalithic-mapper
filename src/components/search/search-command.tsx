"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Map,
	MapPin,
	Search,
	Clock,
	FileText,
	Users,
	MessageSquare,
	BookOpen,
	Compass,
	Activity,
	Calendar,
	Microscope,
	Link2,
	Loader2,
} from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/shared/ui/command";
import { Badge } from "@/shared/ui/badge";
import { siteRows, zoneRows } from "@/shared/mocks/map-records";

// Quick actions/pages
const quickActions = [
	{ id: "map", name: "Explore Map", icon: Map, href: "/map", keywords: ["explore", "browse", "view"] },
	{ id: "activity", name: "Recent Activity", icon: Activity, href: "/activity", keywords: ["feed", "updates", "latest"] },
	{ id: "research", name: "Research Projects", icon: Microscope, href: "/research", keywords: ["projects", "studies"] },
	{ id: "texts", name: "Text Library", icon: BookOpen, href: "/texts", keywords: ["documents", "papers", "library"] },
	{ id: "connections", name: "Connections", icon: Link2, href: "/connections", keywords: ["links", "related"] },
	{ id: "forum", name: "Community Forum", icon: MessageSquare, href: "/forum", keywords: ["discuss", "community"] },
	{ id: "events", name: "Events & Tours", icon: Calendar, href: "/events", keywords: ["meetups", "tours"] },
	{ id: "contribute", name: "Add Contribution", icon: Compass, href: "/contribute", keywords: ["add", "submit", "new"] },
];

interface SearchResult {
	id: string;
	name: string;
	type: "site" | "zone" | "page" | "user";
	description?: string;
	href: string;
	meta?: string;
}

interface SearchCommandProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
	const router = useRouter();
	const [query, setQuery] = React.useState("");
	const [isSearching, setIsSearching] = React.useState(false);

	// Get recent searches from localStorage
	const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (typeof window !== "undefined") {
			const stored = localStorage.getItem("megalithic-recent-searches");
			if (stored) {
				try {
					setRecentSearches(JSON.parse(stored).slice(0, 5));
				} catch {
					// ignore parse errors
				}
			}
		}
	}, [open]);

	// Save search to recent
	const saveRecentSearch = (searchTerm: string) => {
		if (!searchTerm.trim()) return;
		const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
		setRecentSearches(updated);
		localStorage.setItem("megalithic-recent-searches", JSON.stringify(updated));
	};

	// Search results - in real app this would be an API call
	const searchResults = React.useMemo(() => {
		if (!query.trim()) return { sites: [], zones: [], pages: [] };

		const q = query.toLowerCase();
		setIsSearching(true);

		// Simulate search delay
		setTimeout(() => setIsSearching(false), 100);

		// Search sites
		const sites: SearchResult[] = siteRows
			.filter((site) => site.name.toLowerCase().includes(q) || site.summary.toLowerCase().includes(q) || site.site_type.toLowerCase().includes(q))
			.slice(0, 5)
			.map((site) => ({
				id: site.id,
				name: site.name,
				type: "site" as const,
				description: site.summary,
				href: `/map?site=${site.slug}`,
				meta: site.site_type,
			}));

		// Search zones
		const zones: SearchResult[] = zoneRows
			.filter(
				(zone) =>
					zone.name.toLowerCase().includes(q) ||
					zone.description.toLowerCase().includes(q) ||
					zone.culture_focus.some((c) => c.toLowerCase().includes(q))
			)
			.slice(0, 3)
			.map((zone) => ({
				id: zone.id,
				name: zone.name,
				type: "zone" as const,
				description: zone.description,
				href: `/map?zone=${zone.slug}`,
				meta: zone.culture_focus.join(", "),
			}));

		// Search pages/actions
		const pages: SearchResult[] = quickActions
			.filter((action) => action.name.toLowerCase().includes(q) || action.keywords.some((k) => k.toLowerCase().includes(q)))
			.map((action) => ({
				id: action.id,
				name: action.name,
				type: "page" as const,
				href: action.href,
			}));

		return { sites, zones, pages };
	}, [query]);

	const hasResults = searchResults.sites.length > 0 || searchResults.zones.length > 0 || searchResults.pages.length > 0;

	const handleSelect = (href: string, searchTerm?: string) => {
		if (searchTerm) saveRecentSearch(searchTerm);
		onOpenChange(false);
		setQuery("");
		router.push(href);
	};

	const handleRecentSearch = (term: string) => {
		setQuery(term);
	};

	const clearRecentSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem("megalithic-recent-searches");
	};

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput placeholder="Search sites, zones, pages..." value={query} onValueChange={setQuery} />
			<CommandList>
				{isSearching && (
					<div className="flex items-center justify-center py-6">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}

				{!isSearching && !query && (
					<>
						{/* Recent Searches */}
						{recentSearches.length > 0 && (
							<CommandGroup
								heading={
									<div className="flex items-center justify-between">
										<span>Recent Searches</span>
										<button onClick={clearRecentSearches} className="text-xs text-muted-foreground hover:text-foreground">
											Clear
										</button>
									</div>
								}
							>
								{recentSearches.map((term) => (
									<CommandItem key={term} value={term} onSelect={() => handleRecentSearch(term)}>
										<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
										<span>{term}</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}

						{/* Quick Actions */}
						<CommandGroup heading="Quick Actions">
							{quickActions.slice(0, 6).map((action) => {
								const Icon = action.icon;
								return (
									<CommandItem key={action.id} value={action.name} onSelect={() => handleSelect(action.href)}>
										<Icon className="mr-2 h-4 w-4" />
										<span>{action.name}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>

						{/* Popular Sites */}
						<CommandGroup heading="Popular Sites">
							{siteRows.slice(0, 4).map((site) => (
								<CommandItem key={site.id} value={site.name} onSelect={() => handleSelect(`/map?site=${site.slug}`, site.name)}>
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span className="flex-1">{site.name}</span>
									<Badge variant="outline" className="ml-2 text-[10px]">
										{site.site_type}
									</Badge>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}

				{!isSearching && query && !hasResults && (
					<CommandEmpty>
						<div className="flex flex-col items-center gap-2 py-4">
							<Search className="h-8 w-8 text-muted-foreground/50" />
							<p>No results found for &ldquo;{query}&rdquo;</p>
							<p className="text-xs text-muted-foreground">Try searching for a site name, type, or location</p>
						</div>
					</CommandEmpty>
				)}

				{!isSearching && query && hasResults && (
					<>
						{/* Sites Results */}
						{searchResults.sites.length > 0 && (
							<CommandGroup heading="Sites">
								{searchResults.sites.map((result) => (
									<CommandItem key={result.id} value={result.name} onSelect={() => handleSelect(result.href, result.name)}>
										<MapPin className="mr-2 h-4 w-4 text-primary" />
										<div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
											<span className="truncate">{result.name}</span>
											{result.description && <span className="truncate text-xs text-muted-foreground">{result.description}</span>}
										</div>
										{result.meta && (
											<Badge variant="outline" className="ml-2 shrink-0 text-[10px]">
												{result.meta}
											</Badge>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						)}

						{/* Zones Results */}
						{searchResults.zones.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup heading="Research Zones">
									{searchResults.zones.map((result) => (
										<CommandItem key={result.id} value={result.name} onSelect={() => handleSelect(result.href, result.name)}>
											<Compass className="mr-2 h-4 w-4 text-blue-500" />
											<div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
												<span className="truncate">{result.name}</span>
												{result.meta && <span className="truncate text-xs text-muted-foreground">{result.meta}</span>}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}

						{/* Pages Results */}
						{searchResults.pages.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup heading="Pages">
									{searchResults.pages.map((result) => {
										const action = quickActions.find((a) => a.id === result.id);
										const Icon = action?.icon || FileText;
										return (
											<CommandItem key={result.id} value={result.name} onSelect={() => handleSelect(result.href)}>
												<Icon className="mr-2 h-4 w-4" />
												<span>{result.name}</span>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</>
						)}
					</>
				)}
			</CommandList>

			{/* Footer with keyboard hints */}
			<div className="flex items-center justify-between border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
				<div className="flex items-center gap-3">
					<span className="flex items-center gap-1">
						<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
						<span>Navigate</span>
					</span>
					<span className="flex items-center gap-1">
						<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
						<span>Select</span>
					</span>
					<span className="flex items-center gap-1">
						<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
						<span>Close</span>
					</span>
				</div>
			</div>
		</CommandDialog>
	);
}
