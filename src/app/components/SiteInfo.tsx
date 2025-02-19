import { Site, Resource } from "../types/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteStore } from "../store/useSiteStore";
import { UploadCloud, FileText, MessageCircle, Info, Link, Youtube, Image as ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SiteInfoProps {
	site: Site;
	onClose: () => void;
	onUpdateLocation: () => void;
}

// Overview Tab Content Component
function OverviewTab({ site }: { site: Site }) {
	return (
		<div className="space-y-4">
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
		</div>
	);
}

// Images Tab Content Component
function ImagesTab({ site }: { site: Site }) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const addImage = useSiteStore((state) => state.addImage);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError("Image size must be less than 5MB");
			return;
		}

		setIsUploading(true);
		setError(null);
		try {
			// TODO: Implement actual file upload to a storage service
			// For now, we'll just create a fake URL
			const fakeUrl = URL.createObjectURL(file);

			addImage(site.id, {
				url: fakeUrl,
				caption: file.name,
				dateUploaded: new Date().toISOString(),
				uploadedBy: "user", // TODO: Add actual user management
			});
		} catch (error) {
			console.error("Failed to upload image:", error);
			setError("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-medium">Images ({site.images.length})</h3>
				<div className="relative">
					<input
						type="file"
						accept="image/*"
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						onChange={handleImageUpload}
						disabled={isUploading}
					/>
					<Button variant="outline" size="sm" disabled={isUploading}>
						{isUploading ? (
							<>
								<span className="animate-spin mr-2">⏳</span>
								Uploading...
							</>
						) : (
							<>
								<UploadCloud className="w-4 h-4 mr-2" />
								Upload Image
							</>
						)}
					</Button>
				</div>
			</div>

			{error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}

			{site.images.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">No images uploaded yet</p>
			) : (
				<div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
					{site.images.map((image) => (
						<div key={image.url} className="relative group">
							<img src={image.url} alt={image.caption} className="w-full h-32 object-cover rounded-md" />
							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
								<p className="text-xs text-white p-2">{image.caption}</p>
								<div className="absolute bottom-2 right-2">
									<Button variant="ghost" size="sm" className="h-6 text-white hover:text-white" onClick={() => window.open(image.url, "_blank")}>
										View
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Documents Tab Content Component
function DocumentsTab({ site }: { site: Site }) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const addDocument = useSiteStore((state) => state.addDocument);

	const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setError("Document size must be less than 10MB");
			return;
		}

		setIsUploading(true);
		setError(null);
		try {
			// TODO: Implement actual file upload to a storage service
			// For now, we'll just create a fake URL
			const fakeUrl = URL.createObjectURL(file);

			addDocument(site.id, {
				url: fakeUrl,
				title: file.name,
				type: "other",
				dateUploaded: new Date().toISOString(),
				uploadedBy: "user", // TODO: Add actual user management
			});
		} catch (error) {
			console.error("Failed to upload document:", error);
			setError("Failed to upload document. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-medium">Documents ({site.documents.length})</h3>
				<div className="relative">
					<input
						type="file"
						accept=".pdf,.doc,.docx,.txt"
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						onChange={handleDocumentUpload}
						disabled={isUploading}
					/>
					<Button variant="outline" size="sm" disabled={isUploading}>
						{isUploading ? (
							<>
								<span className="animate-spin mr-2">⏳</span>
								Uploading...
							</>
						) : (
							<>
								<FileText className="w-4 h-4 mr-2" />
								Upload Document
							</>
						)}
					</Button>
				</div>
			</div>

			{error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}

			{site.documents.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet</p>
			) : (
				<div className="space-y-2 max-h-[400px] overflow-y-auto">
					{site.documents.map((doc) => (
						<div key={doc.url} className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/50 transition-colors">
							<div className="flex items-center space-x-2">
								<FileText className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">{doc.title}</p>
									<p className="text-xs text-muted-foreground">Added {new Date(doc.dateUploaded).toLocaleDateString()}</p>
								</div>
							</div>
							<Button variant="ghost" size="sm" asChild>
								<a href={doc.url} target="_blank" rel="noopener noreferrer">
									View
								</a>
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Resource Add Dialog Component
function AddResourceDialog({
	onAdd,
	isOpen,
	onOpenChange,
}: {
	onAdd: (resource: Omit<Resource, "id" | "dateAdded" | "addedBy">) => void;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [url, setUrl] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState<Resource["type"]>("article");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onAdd({
			url,
			title,
			description,
			type,
		});
		setUrl("");
		setTitle("");
		setDescription("");
		setType("article");
		onOpenChange(false);
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Add Resource</DialogTitle>
			</DialogHeader>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="url">URL</Label>
					<Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="description">Description (optional)</Label>
					<Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
				</div>
				<div className="space-y-2">
					<Label htmlFor="type">Type</Label>
					<select
						id="type"
						value={type}
						onChange={(e) => setType(e.target.value as Resource["type"])}
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					>
						<option value="article">Article</option>
						<option value="video">Video</option>
						<option value="image">Image</option>
						<option value="other">Other</option>
					</select>
				</div>
				<div className="flex justify-end">
					<Button type="submit">Add Resource</Button>
				</div>
			</form>
		</DialogContent>
	);
}

// Resources Tab Content Component
function ResourcesTab({ site }: { site: Site }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const addResource = useSiteStore((state) => state.addResource);
	const removeResource = useSiteStore((state) => state.removeResource);

	const handleAddResource = (resourceData: Omit<Resource, "id" | "dateAdded" | "addedBy">) => {
		try {
			const newResource: Resource = {
				...resourceData,
				id: crypto.randomUUID(),
				dateAdded: new Date().toISOString(),
				addedBy: "user",
				thumbnail:
					resourceData.type === "video"
						? `https://img.youtube.com/vi/${getYouTubeVideoId(resourceData.url)}/mqdefault.jpg`
						: resourceData.type === "image"
						? resourceData.url
						: undefined,
			};

			addResource(site.id, newResource);
			setError(null);
		} catch (err) {
			console.error("Error adding resource:", err);
			setError("Failed to add resource. Please try again.");
		}
	};

	const getYouTubeVideoId = (url: string) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	const getResourceIcon = (type: Resource["type"]) => {
		switch (type) {
			case "article":
				return <FileText className="w-4 h-4" />;
			case "video":
				return <Youtube className="w-4 h-4" />;
			case "image":
				return <ImageIcon className="w-4 h-4" />;
			default:
				return <Link className="w-4 h-4" />;
		}
	};

	const getResourcePreview = (resource: Resource) => {
		if (resource.type === "video" && resource.thumbnail) {
			return <img src={resource.thumbnail} alt={resource.title} className="w-24 h-16 object-cover rounded" />;
		} else if (resource.type === "image") {
			return (
				<img
					src={resource.url}
					alt={resource.title}
					className="w-24 h-16 object-cover rounded"
					onError={(e) => {
						// If image fails to load, show the icon instead
						const target = e.target as HTMLImageElement;
						target.style.display = "none";
						target.parentElement?.classList.add("fallback-icon");
					}}
				/>
			);
		}
		return <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">{getResourceIcon(resource.type)}</div>;
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-sm font-medium">Resources ({site.resources.length})</h3>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<Link className="w-4 h-4 mr-2" />
							Add Resource
						</Button>
					</DialogTrigger>
					<AddResourceDialog onAdd={handleAddResource} isOpen={dialogOpen} onOpenChange={setDialogOpen} />
				</Dialog>
			</div>

			{error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}

			{site.resources.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">No resources added yet</p>
			) : (
				<div className="space-y-3 max-h-[400px] overflow-y-auto">
					{site.resources.map((resource) => (
						<div key={resource.id} className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
							<div className="relative fallback-icon-container">
								{getResourcePreview(resource)}
								<div className="absolute inset-0 bg-muted rounded flex items-center justify-center fallback-icon hidden">
									{getResourceIcon(resource.type)}
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<h4 className="text-sm font-medium truncate">{resource.title}</h4>
									<div className="flex items-center gap-1 flex-shrink-0">
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(resource.url, "_blank")}>
											<ExternalLink className="w-4 h-4" />
										</Button>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeResource(site.id, resource.id)}>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
								{resource.description && <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>}
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="secondary" className="text-xs">
										{resource.type}
									</Badge>
									<span className="text-xs text-muted-foreground">Added {new Date(resource.dateAdded).toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Comments Tab Content Component
function CommentsTab() {
	return (
		<div className="py-8 text-center">
			<MessageCircle className="w-8 h-8 mx-auto text-muted-foreground" />
			<p className="text-sm text-muted-foreground mt-2">Comments feature coming soon</p>
		</div>
	);
}

export default function SiteInfo({ site, onClose, onUpdateLocation }: SiteInfoProps) {
	console.log("SiteInfo rendering with site:", site);

	return (
		<div className="mapboxgl-ctrl" style={{ position: "absolute", top: 10, left: 10 }}>
			<Card className="w-[400px] bg-background/70 backdrop-blur-sm">
				<CardHeader className="bg-background/40">
					<CardTitle>{site.name}</CardTitle>
				</CardHeader>
				<CardContent className="bg-background/40">
					<Tabs defaultValue="overview" className="space-y-4">
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="overview">
								<Info className="w-4 h-4 mr-2" />
								Info
							</TabsTrigger>
							<TabsTrigger value="images">
								<UploadCloud className="w-4 h-4 mr-2" />
								Images
							</TabsTrigger>
							<TabsTrigger value="documents">
								<FileText className="w-4 h-4 mr-2" />
								Docs
							</TabsTrigger>
							<TabsTrigger value="resources">
								<Link className="w-4 h-4 mr-2" />
								Links
							</TabsTrigger>
							<TabsTrigger value="comments">
								<MessageCircle className="w-4 h-4 mr-2" />
								Comments
							</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-4" key={`overview-${site.lastUpdated}`}>
							<OverviewTab site={site} />
						</TabsContent>

						<TabsContent value="images" key={`images-${site.lastUpdated}`}>
							<ImagesTab site={site} />
						</TabsContent>

						<TabsContent value="documents" key={`documents-${site.lastUpdated}`}>
							<DocumentsTab site={site} />
						</TabsContent>

						<TabsContent value="resources" key={`resources-${site.lastUpdated}`}>
							<ResourcesTab site={site} />
						</TabsContent>

						<TabsContent value="comments" key={`comments-${site.lastUpdated}`}>
							<CommentsTab />
						</TabsContent>

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" size="sm" onClick={onClose}>
								Close
							</Button>
							<Button variant="secondary" size="sm" onClick={onUpdateLocation}>
								Update Location
							</Button>
						</div>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
