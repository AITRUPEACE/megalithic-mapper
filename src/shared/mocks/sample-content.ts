import { ContentItem, UserProfile } from "@/lib/types";

// Sample user profiles
export const sampleUsers: Record<string, UserProfile> = {
  "curator.laila": {
    userId: "user-001",
    username: "curator.laila",
    displayName: "Laila Hassan",
    avatar: "https://i.pravatar.cc/150?u=laila",
    verificationStatus: "verified",
    bio: "Egyptologist specializing in Old Kingdom architecture",
    affiliation: "Cairo Museum",
  },
  "field.aurelia": {
    userId: "user-002",
    username: "field.aurelia",
    displayName: "Aurelia Quispe",
    avatar: "https://i.pravatar.cc/150?u=aurelia",
    verificationStatus: "verified",
    bio: "Field researcher studying Andean acoustic properties",
    affiliation: "University of Cusco",
  },
  "dr.schmidt": {
    userId: "user-003",
    username: "dr.schmidt",
    displayName: "Dr. Klaus Schmidt",
    avatar: "https://i.pravatar.cc/150?u=klaus",
    verificationStatus: "verified",
    bio: "Lead archaeologist at Göbekli Tepe",
    affiliation: "German Archaeological Institute",
  },
  "explorer.maya": {
    userId: "user-004",
    username: "explorer.maya",
    displayName: "Maya Chen",
    avatar: "https://i.pravatar.cc/150?u=maya",
    verificationStatus: "unverified",
    bio: "Underwater archaeology enthusiast",
  },
  "citizen.rina": {
    userId: "user-005",
    username: "citizen.rina",
    displayName: "Rina Patel",
    avatar: "https://i.pravatar.cc/150?u=rina",
    verificationStatus: "under_review",
    bio: "Satellite imagery analyst and ancient mysteries researcher",
  },
};

export const sampleContentItems: ContentItem[] = [
  // Images
  {
    id: "content-img-001",
    type: "image",
    title: "Great Pyramid Inner Chamber Scan",
    description: "High-resolution 3D laser scan of the King's Chamber showing granite blocks and ventilation shafts. The precision of the stonework is remarkable.",
    submittedBy: sampleUsers["curator.laila"],
    createdAt: "2024-10-12T14:30:00Z",
    updatedAt: "2024-10-12T14:30:00Z",
    verificationStatus: "verified",
    trustTier: "promoted",
    content: {
      type: "image",
      data: {
        url: "https://images.unsplash.com/photo-1568322445389-f64ac2515020",
        thumbnail: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=400&q=80",
        width: 4000,
        height: 3000,
        format: "jpg",
        source: "Cairo Museum Digital Archive",
        license: "CC BY-NC-SA 4.0",
      },
    },
    linkedSites: ["giza-gp"],
    linkedContent: [],
    tags: ["3d-scan", "interior", "granite", "engineering"],
    civilization: "Ancient Egyptian",
    era: "Old Kingdom",
    geography: {
      continent: "Africa",
      country: "Egypt",
      zone: "Giza Plateau",
    },
    stats: {
      views: 1247,
      likes: 89,
      bookmarks: 34,
      comments: 12,
      shares: 8,
      rating: {
        average: 4.8,
        count: 23,
      },
    },
  },
  {
    id: "content-img-002",
    type: "image",
    title: "Sphinx Erosion Patterns - Western Face",
    description: "Detailed photograph showing water erosion patterns on the western face of the Sphinx, supporting theories of much older construction dates.",
    submittedBy: sampleUsers["curator.laila"],
    createdAt: "2024-09-01T12:00:00Z",
    updatedAt: "2024-09-01T12:00:00Z",
    verificationStatus: "verified",
    content: {
      type: "image",
      data: {
        url: "https://images.unsplash.com/photo-1549887534-1541e9326642",
        thumbnail: "https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80",
        width: 3200,
        height: 2400,
        format: "jpg",
        source: "Field Survey 2024",
        license: "CC BY 4.0",
      },
    },
    linkedSites: ["giza-sphinx"],
    linkedContent: [],
    tags: ["erosion", "stratigraphy", "weathering", "sphinx"],
    civilization: "Ancient Egyptian",
    era: "Old Kingdom",
    stats: {
      views: 892,
      likes: 67,
      bookmarks: 28,
      comments: 18,
      shares: 5,
      rating: {
        average: 4.6,
        count: 19,
      },
    },
  },
  {
    id: "content-img-003",
    type: "image",
    title: "Sacsayhuamán Interlocking Stones Close-Up",
    description: "Macro photography of the precision-cut interlocking stones. No mortar used, yet the fit is so precise a knife blade cannot fit between them.",
    submittedBy: sampleUsers["field.aurelia"],
    createdAt: "2024-08-20T16:45:00Z",
    updatedAt: "2024-08-20T16:45:00Z",
    verificationStatus: "verified",
    trustTier: "promoted",
    content: {
      type: "image",
      data: {
        url: "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
        thumbnail: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=400&q=80",
        width: 5000,
        height: 3333,
        format: "jpg",
      },
    },
    linkedSites: ["cusco-sacsayhuaman"],
    linkedContent: [],
    tags: ["masonry", "precision", "engineering", "megalithic"],
    civilization: "Inca",
    era: "Late Horizon",
    stats: {
      views: 1543,
      likes: 124,
      bookmarks: 67,
      comments: 31,
      shares: 14,
      rating: {
        average: 4.9,
        count: 42,
      },
    },
  },
  
  // YouTube Videos
  {
    id: "content-yt-001",
    type: "youtube",
    title: "Acoustic Resonance in Andean Temples",
    description: "Dr. Aurelia Quispe demonstrates the remarkable acoustic properties of Sacsayhuamán's stone walls. When struck at specific points, the walls produce distinct tones.",
    submittedBy: sampleUsers["field.aurelia"],
    createdAt: "2024-09-24T09:00:00Z",
    updatedAt: "2024-09-24T09:00:00Z",
    verificationStatus: "verified",
    trustTier: "gold",
    content: {
      type: "youtube",
      data: {
        videoId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
        duration: 847, // 14:07
        channelName: "Andean Acoustics Research",
        channelId: "UCxxxxx",
      },
    },
    linkedSites: ["cusco-sacsayhuaman", "andes-machu"],
    linkedContent: ["content-img-003"],
    tags: ["acoustics", "sound", "experiment", "resonance"],
    civilization: "Inca",
    era: "Late Horizon",
    stats: {
      views: 2341,
      likes: 187,
      bookmarks: 92,
      comments: 45,
      shares: 23,
      rating: {
        average: 4.7,
        count: 67,
      },
    },
  },
  {
    id: "content-yt-002",
    type: "youtube",
    title: "Underwater Survey of Bimini Road",
    description: "Complete underwater photogrammetry survey of the controversial Bimini Road formation. Filmed with 4K underwater cameras and processed with photogrammetry software.",
    submittedBy: sampleUsers["explorer.maya"],
    createdAt: "2024-09-20T17:42:00Z",
    updatedAt: "2024-09-20T17:42:00Z",
    verificationStatus: "under_review",
    trustTier: "bronze",
    content: {
      type: "youtube",
      data: {
        videoId: "abc123xyz",
        thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80",
        duration: 1245, // 20:45
        channelName: "Underwater Mysteries",
        channelId: "UCyyyyyy",
      },
    },
    linkedSites: ["community-bimini"],
    linkedContent: [],
    tags: ["underwater", "photogrammetry", "survey", "bimini"],
    civilization: "Atlantis Theories",
    era: "Speculative",
    stats: {
      views: 456,
      likes: 34,
      bookmarks: 12,
      comments: 8,
      shares: 3,
      rating: {
        average: 3.8,
        count: 11,
      },
    },
  },
  
  // Documents
  {
    id: "content-doc-001",
    type: "document",
    title: "Göbekli Tepe Excavation Report 2024",
    description: "Comprehensive excavation report detailing findings from the 2024 season, including newly discovered T-pillars and animal reliefs.",
    submittedBy: sampleUsers["dr.schmidt"],
    createdAt: "2024-10-15T14:22:00Z",
    updatedAt: "2024-10-15T14:22:00Z",
    verificationStatus: "verified",
    trustTier: "promoted",
    content: {
      type: "document",
      data: {
        url: "https://example.com/docs/gobekli-2024.pdf",
        fileType: "pdf",
        fileSize: 15728640, // 15 MB
        pages: 127,
        author: "Dr. Klaus Schmidt et al.",
        language: "English",
      },
    },
    linkedSites: ["anatolia-gobekli"],
    linkedContent: [],
    tags: ["excavation", "report", "academic", "neolithic"],
    civilization: "Anatolian",
    era: "Pre-Pottery Neolithic",
    stats: {
      views: 678,
      likes: 54,
      bookmarks: 89,
      comments: 23,
      shares: 31,
      rating: {
        average: 4.9,
        count: 34,
      },
    },
  },
  
  // Texts (Ancient texts/translations)
  {
    id: "content-text-001",
    type: "text",
    title: "Bremner-Rhind Papyrus - Sound Harmonics Translation",
    description: "New translation focusing on references to sound, resonance, and cyclical invocations. Cross-referenced with Giza acoustic measurements.",
    submittedBy: sampleUsers["curator.laila"],
    createdAt: "2024-09-10T11:20:00Z",
    updatedAt: "2024-09-15T16:30:00Z",
    verificationStatus: "verified",
    content: {
      type: "text",
      data: {
        body: `# Bremner-Rhind Papyrus - Chant Cycle Analysis

## Introduction

The Bremner-Rhind Papyrus (British Museum EA 10188) contains a series of liturgical texts from the Late Period of Ancient Egypt. This analysis focuses on passages that reference sound harmonics and cyclical invocations.

## Key Passages

### Column IV, Lines 1-5

> "The voice rises as the waters recede, creating harmony with the celestial patterns..."

This passage suggests an understanding of acoustic properties in relation to architectural design.

## Analysis

The references to "voice rising" and "harmony" may indicate:
1. Deliberate acoustic design in temple construction
2. Use of chanting in ritual contexts
3. Connection between sound and architectural resonance

## Cross-References

- Giza Pyramid acoustic measurements (see resonant-chambers project)
- Similar patterns in Mesopotamian temple hymns
- Modern acoustic studies of Egyptian temples`,
        author: "British Museum Transcription Team",
        originalLanguage: "Middle Egyptian",
        translatedBy: "Laila Hassan",
        sourceReference: "British Museum EA 10188",
      },
    },
    linkedSites: ["giza-gp"],
    linkedContent: [],
    tags: ["translation", "papyrus", "acoustics", "ritual"],
    civilization: "Ancient Egyptian",
    era: "Late Period",
    stats: {
      views: 543,
      likes: 43,
      bookmarks: 67,
      comments: 19,
      shares: 12,
      rating: {
        average: 4.7,
        count: 28,
      },
    },
  },
  
  // Posts (Blog-style content)
  {
    id: "content-post-001",
    type: "post",
    title: "The Mystery of Precision Stonework in Megalithic Cultures",
    description: "An analysis of the remarkable precision found in megalithic architecture across different continents and time periods. How did ancient builders achieve such accuracy?",
    submittedBy: sampleUsers["field.aurelia"],
    createdAt: "2024-10-01T10:00:00Z",
    updatedAt: "2024-10-03T14:20:00Z",
    verificationStatus: "verified",
    content: {
      type: "post",
      data: {
        body: `# The Mystery of Precision Stonework

One of the most fascinating aspects of ancient megalithic construction is the incredible precision achieved without modern tools.

## Examples Across Cultures

### Egyptian Precision
The granite blocks in the King's Chamber of the Great Pyramid fit together with tolerances measured in thousandths of an inch.

### Inca Masonry
At Sacsayhuamán, massive stones weighing hundreds of tons are fitted together so precisely that a knife blade cannot be inserted between them.

### Anatolian Construction
The T-pillars at Göbekli Tepe show sophisticated carving and placement, predating the development of metallurgy.

## Theories and Techniques

Several theories attempt to explain these achievements:

1. **Advanced Stone-Working Tools**: Perhaps lost techniques using harder stones as abrasives
2. **Sound and Resonance**: Some researchers suggest acoustic methods for cutting
3. **Time and Patience**: Gradual fitting through repeated trial and error
4. **Collaborative Knowledge**: Information sharing between distant cultures

## Open Questions

- How were measurements standardized?
- What role did acoustic properties play?
- Were there common techniques shared across cultures?

*This post is part of an ongoing research project examining engineering methods in ancient civilizations.*`,
        featuredImage: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80",
        category: "Research Analysis",
      },
    },
    linkedSites: ["giza-gp", "cusco-sacsayhuaman", "anatolia-gobekli"],
    linkedContent: ["content-img-001", "content-img-003", "content-yt-001"],
    tags: ["engineering", "precision", "megalithic", "analysis"],
    civilization: "Multiple",
    era: "Multiple",
    stats: {
      views: 1876,
      likes: 143,
      bookmarks: 98,
      comments: 52,
      shares: 27,
      rating: {
        average: 4.8,
        count: 56,
      },
    },
  },
  
  // Links (External resources)
  {
    id: "content-link-001",
    type: "link",
    title: "National Geographic: Göbekli Tepe Discovery",
    description: "Comprehensive article about the discovery and ongoing excavation of Göbekli Tepe, the world's oldest known temple complex.",
    submittedBy: sampleUsers["dr.schmidt"],
    createdAt: "2024-09-05T08:15:00Z",
    updatedAt: "2024-09-05T08:15:00Z",
    verificationStatus: "verified",
    content: {
      type: "link",
      data: {
        url: "https://www.nationalgeographic.com/archaeology/gobekli-tepe",
        domain: "nationalgeographic.com",
        favicon: "https://www.nationalgeographic.com/favicon.ico",
        preview: {
          title: "Göbekli Tepe: The World's First Temple?",
          description: "Predating Stonehenge by 6,000 years, Turkey's stunning Göbekli Tepe upends the conventional view of the rise of civilization.",
          image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&w=1200&q=80",
        },
      },
    },
    linkedSites: ["anatolia-gobekli"],
    linkedContent: ["content-doc-001"],
    tags: ["article", "discovery", "archaeology", "reference"],
    civilization: "Anatolian",
    era: "Pre-Pottery Neolithic",
    stats: {
      views: 432,
      likes: 38,
      bookmarks: 54,
      comments: 7,
      shares: 19,
      rating: {
        average: 4.5,
        count: 15,
      },
    },
  },
  
  // Orphaned content (not linked to any site)
  {
    id: "content-img-orphan-001",
    type: "image",
    title: "Mysterious Stone Formation in Australian Outback",
    description: "Discovered via satellite imagery. Geometric patterns suggesting possible ancient construction, but location is remote and unverified.",
    submittedBy: sampleUsers["citizen.rina"],
    createdAt: "2024-10-05T09:32:00Z",
    updatedAt: "2024-10-05T09:32:00Z",
    verificationStatus: "under_review",
    trustTier: "silver",
    content: {
      type: "image",
      data: {
        url: "https://images.unsplash.com/photo-1523567830207-96731740fa71",
        thumbnail: "https://images.unsplash.com/photo-1523567830207-96731740fa71?auto=format&fit=crop&w=400&q=80",
        width: 4000,
        height: 3000,
        format: "jpg",
        source: "Google Earth Satellite Imagery",
      },
    },
    linkedSites: [], // Orphaned - no site link yet
    linkedContent: [],
    tags: ["satellite", "unknown", "geometric", "investigation"],
    civilization: "Unknown",
    era: "Unknown",
    geography: {
      continent: "Oceania",
      country: "Australia",
      region: "Northern Territory",
    },
    stats: {
      views: 234,
      likes: 18,
      bookmarks: 9,
      comments: 14,
      shares: 2,
      rating: {
        average: 3.2,
        count: 8,
      },
    },
  },
  {
    id: "content-post-orphan-001",
    type: "post",
    title: "Acoustic Levitation in Ancient Construction - Myth or Possibility?",
    description: "Exploring the controversial theory that ancient builders may have used sound waves to move massive stones. A critical analysis of the evidence.",
    submittedBy: sampleUsers["explorer.maya"],
    createdAt: "2024-08-15T13:30:00Z",
    updatedAt: "2024-08-15T13:30:00Z",
    verificationStatus: "unverified",
    trustTier: "bronze",
    content: {
      type: "post",
      data: {
        body: `# Acoustic Levitation: Ancient Technology or Modern Fantasy?

The theory that ancient civilizations used sound to levitate massive stones has captured public imagination for decades. But what does the evidence really say?

## The Claims

Proponents suggest that:
- Ancient texts describe "singing" stones
- Certain structures show evidence of acoustic design
- Modern acoustic levitation experiments prove the concept

## The Science

Modern acoustic levitation works at microscopic scales using ultrasonic frequencies. Scaling this to multi-ton stones would require:
- Sound pressures exceeding 200 dB (lethal to humans)
- Perfectly controlled interference patterns
- Power sources not evident in archaeological record

## The Reality

While ancient builders clearly understood acoustics and incorporated them into architecture, there's no credible evidence for acoustic levitation of building materials.

## Conclusion

The precision of ancient construction is amazing enough without invoking speculative technologies. Let's focus on understanding the techniques they actually used.`,
        category: "Critical Analysis",
      },
    },
    linkedSites: [], // Not linked to specific site - general topic
    linkedContent: ["content-yt-001"], // References acoustic research
    tags: ["acoustics", "levitation", "skeptical", "analysis", "debunk"],
    stats: {
      views: 789,
      likes: 45,
      bookmarks: 23,
      comments: 67, // Controversial topics get more comments
      shares: 8,
      rating: {
        average: 3.4,
        count: 42,
      },
    },
  },
];

// Helper function to get content by site
export function getContentBySite(siteId: string): ContentItem[] {
  return sampleContentItems.filter((item) => item.linkedSites.includes(siteId));
}

// Helper function to get orphaned content
export function getOrphanedContent(): ContentItem[] {
  return sampleContentItems.filter((item) => item.linkedSites.length === 0);
}

// Helper function to get content by type
export function getContentByType(type: string): ContentItem[] {
  return sampleContentItems.filter((item) => item.type === type);
}

// Helper function to get content by user
export function getContentByUser(username: string): ContentItem[] {
  return sampleContentItems.filter((item) => item.submittedBy.username === username);
}

