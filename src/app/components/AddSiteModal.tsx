"use client";

import { useState } from "react";
import { Site, SITE_TYPES } from "../types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddSiteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (site: Partial<Site>) => void;
	coordinates?: [number, number];
}

export default function AddSiteModal({ isOpen, onClose, onSubmit, coordinates }: AddSiteModalProps) {
	const [formData, setFormData] = useState<Partial<Site>>({
		name: "",
		description: "",
		type: SITE_TYPES.other,
		coordinates: coordinates || [0, 0],
		status: "unverified",
		images: [],
		documents: [],
		tags: [],
	});

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/40 backdrop-blur-sm">
				<DialogHeader>
					<DialogTitle>Add New Archaeological Site</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit({
							...formData,
							dateAdded: new Date().toISOString(),
							lastUpdated: new Date().toISOString(),
						});
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							required
							className="min-h-[100px]"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="type">Type</Label>
						<Select value={formData.type?.code} onValueChange={(value) => setFormData({ ...formData, type: SITE_TYPES[value] })}>
							<SelectTrigger>
								<SelectValue placeholder="Select a type" />
							</SelectTrigger>
							<SelectContent>
								{Object.values(SITE_TYPES).map((type) => (
									<SelectItem key={type.code} value={type.code}>
										{type.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="civilization">Civilization (optional)</Label>
						<Input
							id="civilization"
							value={formData.civilization || ""}
							onChange={(e) => setFormData({ ...formData, civilization: e.target.value })}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags">Tags (comma-separated)</Label>
						<Input
							id="tags"
							value={formData.tags?.join(", ")}
							onChange={(e) =>
								setFormData({
									...formData,
									tags: e.target.value
										.split(",")
										.map((tag) => tag.trim())
										.filter(Boolean),
								})
							}
						/>
					</div>

					<div className="flex justify-end space-x-3 mt-6">
						<Button variant="outline" type="button" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Add Site</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
