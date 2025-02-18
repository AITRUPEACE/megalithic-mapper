"use client";

import { useState } from "react";
import { Site, SITE_TYPES } from "../types/types";

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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
			<div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold mb-4">Add New Archaeological Site</h2>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit({
							...formData,
							dateAdded: new Date().toISOString(),
							lastUpdated: new Date().toISOString(),
						});
					}}
				>
					<div className="space-y-4">
						<div>
							<label className="label">Name</label>
							<input
								type="text"
								className="input"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</div>

						<div>
							<label className="label">Description</label>
							<textarea
								className="input"
								rows={4}
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								required
							/>
						</div>

						<div>
							<label className="label">Type</label>
							<select
								className="input"
								value={formData.type?.code || ""}
								onChange={(e) => setFormData({ ...formData, type: SITE_TYPES[e.target.value] })}
							>
								{Object.values(SITE_TYPES).map((type) => (
									<option key={type.code} value={type.code}>
										{type.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="label">Civilization (optional)</label>
							<input
								type="text"
								className="input"
								value={formData.civilization || ""}
								onChange={(e) => setFormData({ ...formData, civilization: e.target.value })}
							/>
						</div>

						<div>
							<label className="label">Tags (comma-separated)</label>
							<input
								type="text"
								className="input"
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
							<button type="button" onClick={onClose} className="btn btn-secondary">
								Cancel
							</button>
							<button type="submit" className="btn btn-primary">
								Add Site
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
