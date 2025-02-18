import { Site } from "../types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SiteInfoProps {
	site: Site;
	onClose: () => void;
	onUpdateLocation: () => void;
}

export default function SiteInfo({ site, onClose, onUpdateLocation }: SiteInfoProps) {
	return (
		<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 10, left: 10 }}>
			<Card className="w-[350px] bg-background/70 backdrop-blur-sm">
				<CardHeader className="bg-background/40">
					<CardTitle>{site.name}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 bg-background/40">
					<p className="text-sm text-foreground">{site.description}</p>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">{site.type.name}</Badge>
						{site.civilization && <Badge variant="secondary">{site.civilization}</Badge>}
					</div>
					<div className="flex flex-wrap gap-1">
						{site.tags.map((tag) => (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={onClose}>
							Close
						</Button>
						<Button variant="secondary" size="sm" onClick={onUpdateLocation}>
							Update Location
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
