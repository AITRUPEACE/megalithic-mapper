import { DiscussionThread } from "@/shared/types/content";

export const sampleThreads: DiscussionThread[] = [
  {
    id: "thread-ritual-acoustics",
    title: "Chant cadence references in Bremner-Rhind Papyrus",
    category: "Texts & Translation",
    excerpt:
      "Cross-referencing the papyrus litany with recent acoustic captures from the King's Chamber. Looking for corroborating transliterations.",
    lastUpdated: "2024-10-12T11:04:00Z",
    replies: 18,
    tags: ["old kingdom", "translation"],
    isVerifiedOnly: true,
  },
  {
    id: "thread-quipu",
    title: "Quipu fiber resonance experiments",
    category: "Artifacts Lab",
    excerpt:
      "Shared slow-motion capture of dyed fiber bundles vibrating in response to flute frequencies. Need insights on knot tension encoding.",
    lastUpdated: "2024-09-22T08:40:00Z",
    replies: 32,
    tags: ["inca", "material science"],
  },
  {
    id: "thread-derinkuyu",
    title: "Ventilation mapping at Derinkuyu",
    category: "Field Logistics",
    excerpt:
      "Requesting volunteers to annotate 2024 tunnel lidar scans with airflow observations; will feed into myth cycle hypothesis.",
    lastUpdated: "2024-08-19T17:16:00Z",
    replies: 11,
    tags: ["anatolia", "collaboration"],
  },
  {
    id: "thread-harbor",
    title: "Sonar stitching workflow for submerged harbors",
    category: "Media Lab",
    excerpt:
      "Workflow outline for merging ROV video tiles into depth-colored mosaics. Looking for GPU optimization tips.",
    lastUpdated: "2024-06-30T13:55:00Z",
    replies: 9,
    tags: ["aegean", "media"],
  },
];
