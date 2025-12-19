"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { sampleSites } from "@/shared/mocks/sample-sites";
import {
	Link2,
	Search,
	Plus,
	Building2,
	BookOpen,
	Sparkles,
	Globe,
	ArrowRight,
	Users,
	Star,
	MessageSquare,
	Filter,
	TrendingUp,
	Compass,
	Mountain,
	Waves,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Connection categories
const connectionCategories = [
	{
		id: "architecture",
		label: "Architecture",
		icon: Building2,
		description: "Shared construction techniques and structural patterns",
		color: "text-emerald-400",
		bgColor: "bg-emerald-500/10",
	},
	{
		id: "symbolism",
		label: "Symbolism",
		icon: Sparkles,
		description: "Common symbols, motifs, and iconography",
		color: "text-purple-400",
		bgColor: "bg-purple-500/10",
	},
	{
		id: "scripture",
		label: "Scripture",
		icon: BookOpen,
		description: "Textual references and mythological parallels",
		color: "text-amber-400",
		bgColor: "bg-amber-500/10",
	},
	{
		id: "astronomy",
		label: "Astronomy",
		icon: Star,
		description: "Celestial alignments and astronomical correlations",
		color: "text-cyan-400",
		bgColor: "bg-cyan-500/10",
	},
	{
		id: "geography",
		label: "Geography",
		icon: Globe,
		description: "Geodetic placements and ley line theories",
		color: "text-rose-400",
		bgColor: "bg-rose-500/10",
	},
	{
		id: "acoustics",
		label: "Acoustics",
		icon: Waves,
		description: "Sound properties and resonance characteristics",
		color: "text-blue-400",
		bgColor: "bg-blue-500/10",
	},
];

// Mock connection data
const mockConnections = [
	{
		id: "conn-1",
		title: "Cyclopean Masonry Worldwide",
		category: "architecture",
		sites: ["cusco-sacsayhuaman", "giza-gp", "anatolia-ayanis"],
		description: "Exploring the shared polygonal stone-fitting techniques found across ancient civilizations from Peru to Egypt to Anatolia.",
		contributors: 12,
		comments: 45,
		upvotes: 234,
		status: "active",
		tags: ["cyclopean", "polygonal", "precision"],
	},
	{
		id: "conn-2",
		title: "Serpent Symbolism Patterns",
		category: "symbolism",
		sites: ["anatolia-gobekli", "giza-sphinx", "andes-machu"],
		description: "Comparing serpent/dragon motifs across temple complexes and their potential astronomical correlations.",
		contributors: 8,
		comments: 32,
		upvotes: 189,
		status: "active",
		tags: ["serpent", "dragon", "mythology"],
	},
	{
		id: "conn-3",
		title: "Flood Narratives in Architecture",
		category: "scripture",
		sites: ["anatolia-derinkuyu", "indus-dholavira"],
		description: "Cross-referencing flood myth texts with hydraulic engineering features at ancient sites.",
		contributors: 6,
		comments: 28,
		upvotes: 156,
		status: "active",
		tags: ["flood", "mythology", "hydrology"],
	},
	{
		id: "conn-4",
		title: "Solstice Alignment Network",
		category: "astronomy",
		sites: ["giza-gp", "andes-machu", "anatolia-gobekli"],
		description: "Mapping structures that demonstrate precise solar alignments during solstices and equinoxes.",
		contributors: 15,
		comments: 67,
		upvotes: 312,
		status: "active",
		tags: ["solstice", "equinox", "alignment"],
	},
	{
		id: "conn-5",
		title: "Acoustic Chamber Resonance",
		category: "acoustics",
		sites: ["giza-gp", "cusco-sacsayhuaman"],
		description: "Studying the acoustic properties of enclosed chambers and their potential ceremonial purposes.",
		contributors: 9,
		comments: 41,
		upvotes: 198,
		status: "active",
		tags: ["resonance", "frequency", "ceremony"],
	},
];

export default function ConnectionsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState("all");

	const filteredConnections = activeCategory === "all" ? mockConnections : mockConnections.filter((conn) => conn.category === activeCategory);

	const searchedConnections = searchTerm
		? filteredConnections.filter(
				(conn) =>
					conn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					conn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					conn.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
		  )
		: filteredConnections;

	const getSiteById = (id: string) => sampleSites.find((site) => site.id === id);
	const getCategoryInfo = (categoryId: string) => connectionCategories.find((cat) => cat.id === categoryId);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex items-center gap-2 mb-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
							<Link2 className="h-5 w-5 text-cyan-400" />
						</div>
						<div>
							<h1 className="text-xl font-bold sm:text-2xl">Connections</h1>
							<Badge variant="secondary" className="mt-0.5">
								NEW
							</Badge>
						</div>
					</div>
					<p className="text-sm text-muted-foreground max-w-xl">
						Discover and research relationships between ancient sites across civilizations. Explore shared architecture, symbolism, scriptural
						references, and more.
					</p>
				</div>
				<Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
					<Plus className="h-4 w-4" />
					New Connection
				</Button>
			</div>

			{/* Search */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search connections..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9 bg-card border-border/40"
				/>
			</div>

			{/* Categories */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
				<button
					onClick={() => setActiveCategory("all")}
					className={cn(
						"flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
						activeCategory === "all" ? "border-primary bg-primary/10" : "border-border/30 bg-card hover:border-border/50"
					)}
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
						<Compass className="h-5 w-5 text-primary" />
					</div>
					<span className="text-sm font-medium">All</span>
				</button>
				{connectionCategories.map((category) => {
					const Icon = category.icon;
					return (
						<button
							key={category.id}
							onClick={() => setActiveCategory(category.id)}
							className={cn(
								"flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
								activeCategory === category.id ? "border-primary bg-primary/10" : "border-border/30 bg-card hover:border-border/50"
							)}
						>
							<div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", category.bgColor)}>
								<Icon className={cn("h-5 w-5", category.color)} />
							</div>
							<span className="text-sm font-medium">{category.label}</span>
						</button>
					);
				})}
			</div>

			{/* Connections Grid */}
			<div className="grid gap-4 md:grid-cols-2">
				{searchedConnections.map((connection) => {
					const categoryInfo = getCategoryInfo(connection.category);
					const CategoryIcon = categoryInfo?.icon ?? Link2;
					const sites = connection.sites.map(getSiteById).filter(Boolean);

					return (
						<Card key={connection.id} className="group bg-card border-border/30 hover:border-border/50 transition-all">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", categoryInfo?.bgColor)}>
											<CategoryIcon className={cn("h-5 w-5", categoryInfo?.color)} />
										</div>
										<div>
											<CardTitle className="text-base group-hover:text-primary transition-colors">{connection.title}</CardTitle>
											<Badge variant="outline" className="mt-1 text-[10px]">
												{categoryInfo?.label}
											</Badge>
										</div>
									</div>
									<Badge variant={connection.status === "active" ? "success" : "secondary"} className="shrink-0">
										{connection.status}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<CardDescription className="line-clamp-2">{connection.description}</CardDescription>

								{/* Connected Sites */}
								<div className="space-y-2">
									<p className="text-xs font-medium text-muted-foreground">Connected Sites</p>
									<div className="flex flex-wrap gap-2">
										{sites.map((site) => (
											<Link
												key={site?.id}
												href={`/map?focus=${site?.id}`}
												className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-xs hover:bg-secondary transition-colors"
											>
												<Mountain className="h-3 w-3 text-muted-foreground" />
												{site?.name}
											</Link>
										))}
									</div>
								</div>

								{/* Tags */}
								<div className="flex flex-wrap gap-1.5">
									{connection.tags.map((tag) => (
										<span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
											#{tag}
										</span>
									))}
								</div>

								{/* Footer Stats */}
								<div className="flex items-center justify-between pt-3 border-t border-border/20">
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Users className="h-3.5 w-3.5" />
											{connection.contributors} contributors
										</span>
										<span className="flex items-center gap-1">
											<MessageSquare className="h-3.5 w-3.5" />
											{connection.comments}
										</span>
										<span className="flex items-center gap-1">
											<TrendingUp className="h-3.5 w-3.5" />
											{connection.upvotes}
										</span>
									</div>
									<Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
										<Link href={`/connections/${connection.id}`}>
											Explore
											<ArrowRight className="h-3.5 w-3.5" />
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Empty State */}
			{searchedConnections.length === 0 && (
				<Card className="bg-card border-border/30">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<Link2 className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-lg font-medium text-muted-foreground mb-2">No connections found</p>
						<p className="text-sm text-muted-foreground mb-4">Try adjusting your search or explore a different category</p>
						<Button variant="outline" onClick={() => setActiveCategory("all")}>
							View all connections
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Call to Action */}
			<Card className="bg-gradient-to-br from-card to-muted/50 border-primary/30">
				<CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
					<div className="text-center sm:text-left">
						<h3 className="text-lg font-semibold mb-1">Discover a new connection?</h3>
						<p className="text-sm text-muted-foreground">Help the community by documenting relationships between ancient sites</p>
					</div>
					<Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
						<Plus className="h-4 w-4" />
						Propose Connection
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
