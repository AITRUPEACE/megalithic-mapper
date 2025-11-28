import { ResearchTopic } from "@/shared/types/content";
import { sampleUsers } from "./sample-content";

export const sampleTopics: ResearchTopic[] = [
  {
    id: "topic-stonework",
    slug: "stonework",
    title: "Precision Stonework",
    description: "Investigation into the methods and tools used to achieve high-precision masonry in ancient structures, focusing on fitting tolerances and surface finishes.",
    coverImage: "https://images.unsplash.com/photo-1599739291060-4578e77dac5d?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 124,
      followers: 850,
      contributors: 42,
    },
    topContributors: [sampleUsers["field.aurelia"], sampleUsers["dr.schmidt"]],
  },
  {
    id: "topic-nubs",
    slug: "protruding-nubs",
    title: "Protruding Nubs",
    description: "Theories surrounding the function and purpose of the ubiquitous 'nubs' or bosses found on megalithic stones across the world.",
    coverImage: "https://images.unsplash.com/photo-1590664076291-cfc9086ade24?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 45,
      followers: 320,
      contributors: 15,
    },
    topContributors: [sampleUsers["citizen.rina"]],
  },
  {
    id: "topic-machining",
    slug: "machining-evidence",
    title: "Machining Evidence",
    description: "Analysis of tool marks, drill holes, and saw cuts that suggest the use of powered or advanced mechanical tools in antiquity.",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 89,
      followers: 560,
      contributors: 28,
    },
    topContributors: [sampleUsers["explorer.maya"], sampleUsers["dr.schmidt"]],
  },
  {
    id: "topic-geopolymer",
    slug: "geopolymer-theory",
    title: "Geopolymer Theory",
    description: "Investigating the hypothesis that some ancient stones were cast as a type of concrete or geopolymer rather than quarried and carved.",
    coverImage: "https://images.unsplash.com/photo-1591871233827-6f81c953372c?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 67,
      followers: 410,
      contributors: 19,
    },
    topContributors: [sampleUsers["curator.laila"]],
  },
  {
    id: "topic-interlocking",
    slug: "co-interlocking-blocks",
    title: "Co-interlocking Blocks",
    description: "Comparative study of polygonal masonry and interlocking block techniques found in Peru, Egypt, Greece, and Japan.",
    coverImage: "https://images.unsplash.com/photo-1528543666782-297924d55b0a?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 156,
      followers: 920,
      contributors: 56,
    },
    topContributors: [sampleUsers["field.aurelia"], sampleUsers["explorer.maya"]],
  },
  {
    id: "topic-symbology",
    slug: "cross-cultural-symbology",
    title: "Cross-Cultural Symbology",
    description: "Cataloging and analyzing recurring symbols (e.g., the 'handbag', pinecone, serpent) found in unconnected ancient cultures.",
    coverImage: "https://images.unsplash.com/photo-1555440787-872f9c882903?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 210,
      followers: 1200,
      contributors: 85,
    },
    topContributors: [sampleUsers["curator.laila"], sampleUsers["citizen.rina"]],
  },
  {
    id: "topic-alignments",
    slug: "archaeoastronomy",
    title: "Alignments & Archaeoastronomy",
    description: "Study of site orientations, ley lines, and celestial alignments of ancient structures.",
    coverImage: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 134,
      followers: 780,
      contributors: 34,
    },
    topContributors: [sampleUsers["citizen.rina"]],
  },
  {
    id: "topic-myths",
    slug: "myths-and-figures",
    title: "Myths & Mythical Figures",
    description: "Analysis of common mythological figures (e.g., Viracocha, Oannes, Osiris) and flood myths across different civilizations.",
    coverImage: "https://images.unsplash.com/photo-1599707367072-cd6ad66aa1e8?auto=format&fit=crop&w=800&q=80",
    stats: {
      posts: 178,
      followers: 950,
      contributors: 62,
    },
    topContributors: [sampleUsers["curator.laila"]],
  },
];

