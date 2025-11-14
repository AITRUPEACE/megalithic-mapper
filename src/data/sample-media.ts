import { MediaAssetRecord } from "@/types/media";

export const sampleMediaAssets: MediaAssetRecord[] = [
  {
    id: "media-sphinx-striation",
    title: "Sphinx erosion striation composite",
    description: "Layered captures combining 1970s scans with modern lidar sweeps.",
    type: "image",
    uri: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80",
    attachment: {
      entityType: "site",
      entityId: "giza-sphinx",
    },
    attribution: {
      contributorHandle: "curator.laila",
      contributorName: "Laila Farouk",
      license: "CC-BY-SA 4.0",
    },
    tags: ["erosion", "stratigraphy"],
    createdAt: "2024-09-01T12:00:00Z",
  },
  {
    id: "media-quipu-slowmo",
    title: "Quipu resonance slow motion capture",
    description: "High-speed footage documenting vibrational plucks on replica fibers.",
    type: "video",
    uri: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
    attachment: {
      entityType: "site",
      entityId: "andes-machu",
    },
    attribution: {
      contributorHandle: "field.aurelia",
      contributorName: "Aurelia V.",
      sourceUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    },
    tags: ["experiment", "sound"],
    createdAt: "2024-09-24T09:00:00Z",
  },
  {
    id: "media-derinkuyu-cutaway",
    title: "Derinkuyu ventilation cutaway render",
    description: "3D render showing airshaft differentials inside the subterranean network.",
    type: "image",
    uri: "https://images.unsplash.com/photo-1526800544336-d04f0cbfd700?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1526800544336-d04f0cbfd700?auto=format&fit=crop&w=400&q=80",
    attachment: {
      entityType: "site",
      entityId: "anatolia-derinkuyu",
    },
    attribution: {
      contributorHandle: "moderator.ipek",
      contributorName: "İpek Demir",
      sourceUrl: "https://example.com/media/derinkuyu-cutaway",
    },
    tags: ["engineering", "visualization"],
    createdAt: "2024-08-12T10:20:00Z",
  },
  {
    id: "media-harbor-sonar",
    title: "Phalasarna sonar fly-through",
    description: "Annotated sonar scan of the submerged harbor entrance with tooltips.",
    type: "video",
    uri: "https://vimeo.com/105123456",
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    attachment: {
      entityType: "site",
      entityId: "mediterranean-phal",
    },
    attribution: {
      contributorHandle: "oceanic.eleni",
      contributorName: "Eleni Marinou",
    },
    tags: ["sonar", "harbor"],
    createdAt: "2024-06-28T14:35:00Z",
  },
];
