/**
 * Forum Mock Data
 * Structured forum with categories, sections, and threads
 */

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  order: number;
  isResearchZone?: boolean;
  zoneId?: string; // Link to map zone if applicable
}

export interface ForumSection {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  threadCount: number;
  postCount: number;
  lastActivity?: {
    threadId: string;
    threadTitle: string;
    author: string;
    timestamp: string;
  };
  isLocked?: boolean;
  isVerifiedOnly?: boolean;
}

export interface ForumThread {
  id: string;
  sectionId: string;
  slug: string;
  title: string;
  excerpt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
    role?: string;
  };
  createdAt: string;
  lastActivity: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  tags: string[];
  isPinned?: boolean;
  isLocked?: boolean;
  isVerifiedOnly?: boolean;
  isHot?: boolean;
  linkedSites?: string[];
  linkedZones?: string[];
}

// ============================================================================
// Categories
// ============================================================================

export const forumCategories: ForumCategory[] = [
  {
    id: "cat-research",
    slug: "research",
    name: "Research & Theories",
    description: "Academic discussions, hypothesis development, and peer review",
    icon: "FlaskConical",
    color: "text-blue-400",
    order: 1,
  },
  {
    id: "cat-discoveries",
    slug: "discoveries",
    name: "Discoveries & News",
    description: "Breaking findings, excavation updates, and archaeological news",
    icon: "Sparkles",
    color: "text-amber-400",
    order: 2,
  },
  {
    id: "cat-zones",
    slug: "zones",
    name: "Research Zones",
    description: "Discussions organized by geographic research areas",
    icon: "Map",
    color: "text-emerald-400",
    order: 3,
    isResearchZone: true,
  },
  {
    id: "cat-fieldwork",
    slug: "fieldwork",
    name: "Expeditions & Fieldwork",
    description: "Trip planning, equipment, logistics, and field reports",
    icon: "Compass",
    color: "text-orange-400",
    order: 4,
  },
  {
    id: "cat-community",
    slug: "community",
    name: "Community",
    description: "General discussion, introductions, and off-topic conversations",
    icon: "Users",
    color: "text-purple-400",
    order: 5,
  },
];

// ============================================================================
// Sections
// ============================================================================

export const forumSections: ForumSection[] = [
  // Research & Theories
  {
    id: "sec-hypotheses",
    categoryId: "cat-research",
    slug: "hypotheses",
    name: "Hypothesis Development",
    description: "Propose and discuss new theories about ancient civilizations",
    icon: "Lightbulb",
    threadCount: 156,
    postCount: 2341,
    lastActivity: {
      threadId: "thread-acoustic-resonance",
      threadTitle: "Acoustic resonance patterns in megalithic chambers",
      author: "dr.aminah.s",
      timestamp: "2024-12-02T14:30:00Z",
    },
    isVerifiedOnly: true,
  },
  {
    id: "sec-peer-review",
    categoryId: "cat-research",
    slug: "peer-review",
    name: "Peer Review",
    description: "Submit research for community review and feedback",
    icon: "FileCheck",
    threadCount: 89,
    postCount: 1567,
    lastActivity: {
      threadId: "thread-carbon-dating",
      threadTitle: "Re-evaluating carbon dating methodology for submerged sites",
      author: "prof.martinez",
      timestamp: "2024-12-01T09:15:00Z",
    },
    isVerifiedOnly: true,
  },
  {
    id: "sec-texts",
    categoryId: "cat-research",
    slug: "texts-translation",
    name: "Texts & Translation",
    description: "Ancient texts, inscriptions, and translation discussions",
    icon: "ScrollText",
    threadCount: 234,
    postCount: 4521,
    lastActivity: {
      threadId: "thread-hieratic",
      threadTitle: "Hieratic script variations in Middle Kingdom papyri",
      author: "scribe.elena",
      timestamp: "2024-12-02T11:45:00Z",
    },
  },
  {
    id: "sec-methodology",
    categoryId: "cat-research",
    slug: "methodology",
    name: "Research Methodology",
    description: "Best practices, tools, and techniques for archaeological research",
    icon: "Microscope",
    threadCount: 78,
    postCount: 892,
  },

  // Discoveries & News
  {
    id: "sec-breaking",
    categoryId: "cat-discoveries",
    slug: "breaking-news",
    name: "Breaking Discoveries",
    description: "Latest findings and excavation announcements",
    icon: "Newspaper",
    threadCount: 312,
    postCount: 5678,
    lastActivity: {
      threadId: "thread-gobekli-2024",
      threadTitle: "New enclosure discovered at Göbekli Tepe - December 2024",
      author: "field.reporter",
      timestamp: "2024-12-02T16:00:00Z",
    },
  },
  {
    id: "sec-excavations",
    categoryId: "cat-discoveries",
    slug: "excavation-updates",
    name: "Excavation Updates",
    description: "Progress reports from ongoing archaeological digs",
    icon: "Shovel",
    threadCount: 189,
    postCount: 3456,
  },
  {
    id: "sec-reinterpretations",
    categoryId: "cat-discoveries",
    slug: "reinterpretations",
    name: "Site Reinterpretations",
    description: "New perspectives on known sites and artifacts",
    icon: "RefreshCw",
    threadCount: 145,
    postCount: 2890,
  },

  // Research Zones
  {
    id: "sec-zone-egypt",
    categoryId: "cat-zones",
    slug: "egypt-nile",
    name: "Egypt & Nile Valley",
    description: "Pyramids, temples, and the mysteries of ancient Egypt",
    icon: "Pyramid",
    threadCount: 567,
    postCount: 12456,
    lastActivity: {
      threadId: "thread-giza-shafts",
      threadTitle: "New scan results from the Great Pyramid air shafts",
      author: "dr.aminah.s",
      timestamp: "2024-12-02T13:20:00Z",
    },
  },
  {
    id: "sec-zone-americas",
    categoryId: "cat-zones",
    slug: "americas",
    name: "Americas",
    description: "Mesoamerican, South American, and North American sites",
    icon: "Mountain",
    threadCount: 423,
    postCount: 8934,
  },
  {
    id: "sec-zone-europe",
    categoryId: "cat-zones",
    slug: "europe-megalithic",
    name: "European Megaliths",
    description: "Stone circles, dolmens, and passage tombs of Europe",
    icon: "Milestone",
    threadCount: 389,
    postCount: 7234,
  },
  {
    id: "sec-zone-asia",
    categoryId: "cat-zones",
    slug: "asia-pacific",
    name: "Asia & Pacific",
    description: "Ancient sites across Asia and the Pacific islands",
    icon: "Waves",
    threadCount: 234,
    postCount: 4567,
  },
  {
    id: "sec-zone-submerged",
    categoryId: "cat-zones",
    slug: "submerged-sites",
    name: "Submerged & Coastal Sites",
    description: "Underwater archaeology and coastal erosion studies",
    icon: "Anchor",
    threadCount: 156,
    postCount: 2890,
  },

  // Expeditions & Fieldwork
  {
    id: "sec-trip-planning",
    categoryId: "cat-fieldwork",
    slug: "trip-planning",
    name: "Trip Planning",
    description: "Organize visits, share itineraries, and find travel companions",
    icon: "CalendarDays",
    threadCount: 234,
    postCount: 4567,
  },
  {
    id: "sec-equipment",
    categoryId: "cat-fieldwork",
    slug: "equipment",
    name: "Equipment & Gear",
    description: "Cameras, drones, survey tools, and field equipment discussions",
    icon: "Wrench",
    threadCount: 167,
    postCount: 2345,
  },
  {
    id: "sec-field-reports",
    categoryId: "cat-fieldwork",
    slug: "field-reports",
    name: "Field Reports",
    description: "Share your experiences and findings from site visits",
    icon: "FileText",
    threadCount: 289,
    postCount: 5678,
    lastActivity: {
      threadId: "thread-orkney-2024",
      threadTitle: "Orkney stone circles - November 2024 visit report",
      author: "explorer.maya",
      timestamp: "2024-11-28T19:30:00Z",
    },
  },

  // Community
  {
    id: "sec-introductions",
    categoryId: "cat-community",
    slug: "introductions",
    name: "Introductions",
    description: "Welcome new members and share your background",
    icon: "HandMetal",
    threadCount: 456,
    postCount: 2345,
  },
  {
    id: "sec-general",
    categoryId: "cat-community",
    slug: "general-discussion",
    name: "General Discussion",
    description: "Off-topic conversations and community chat",
    icon: "MessageCircle",
    threadCount: 567,
    postCount: 8901,
    lastActivity: {
      threadId: "thread-book-recs",
      threadTitle: "Book recommendations for beginners",
      author: "curious.reader",
      timestamp: "2024-12-02T15:45:00Z",
    },
  },
  {
    id: "sec-media-showcase",
    categoryId: "cat-community",
    slug: "media-showcase",
    name: "Media Showcase",
    description: "Share your photos, videos, and artwork",
    icon: "Image",
    threadCount: 345,
    postCount: 4567,
  },
  {
    id: "sec-feedback",
    categoryId: "cat-community",
    slug: "feedback",
    name: "Site Feedback",
    description: "Suggestions, bug reports, and platform improvements",
    icon: "MessageSquarePlus",
    threadCount: 123,
    postCount: 890,
  },
];

// ============================================================================
// Sample Threads
// ============================================================================

export const forumThreads: ForumThread[] = [
  // Research threads
  {
    id: "thread-acoustic-resonance",
    sectionId: "sec-hypotheses",
    slug: "acoustic-resonance-megalithic-chambers",
    title: "Acoustic resonance patterns in megalithic chambers",
    excerpt: "Cross-referencing infrasound measurements from multiple sites reveals consistent frequency patterns. Could these structures have been designed as acoustic instruments?",
    author: {
      id: "user-aminah",
      username: "dr.aminah.s",
      displayName: "Dr. Aminah Sayed",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=aminah",
      isVerified: true,
      role: "Expert",
    },
    createdAt: "2024-11-15T10:30:00Z",
    lastActivity: "2024-12-02T14:30:00Z",
    replyCount: 47,
    viewCount: 1234,
    likeCount: 89,
    tags: ["acoustics", "megalithic", "hypothesis"],
    isPinned: true,
    isVerifiedOnly: true,
    isHot: true,
    linkedSites: ["site-giza-gp", "site-newgrange"],
  },
  {
    id: "thread-ritual-acoustics",
    sectionId: "sec-texts",
    slug: "chant-cadence-bremner-rhind",
    title: "Chant cadence references in Bremner-Rhind Papyrus",
    excerpt: "Cross-referencing the papyrus litany with recent acoustic captures from the King's Chamber. Looking for corroborating transliterations.",
    author: {
      id: "user-elena",
      username: "scribe.elena",
      displayName: "Elena Kowalski",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
      isVerified: true,
      role: "Researcher",
    },
    createdAt: "2024-10-05T08:15:00Z",
    lastActivity: "2024-12-02T11:45:00Z",
    replyCount: 23,
    viewCount: 567,
    likeCount: 34,
    tags: ["old-kingdom", "translation", "acoustics"],
    isVerifiedOnly: true,
    linkedSites: ["site-giza-gp"],
  },
  
  // Discovery threads
  {
    id: "thread-gobekli-2024",
    sectionId: "sec-breaking",
    slug: "new-enclosure-gobekli-tepe-2024",
    title: "New enclosure discovered at Göbekli Tepe - December 2024",
    excerpt: "Breaking: German Archaeological Institute announces discovery of a previously unknown enclosure with unique T-pillar configurations. Initial dating suggests it may predate known structures.",
    author: {
      id: "user-reporter",
      username: "field.reporter",
      displayName: "Archaeological News",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=reporter",
      isVerified: true,
      role: "News",
    },
    createdAt: "2024-12-02T08:00:00Z",
    lastActivity: "2024-12-02T16:00:00Z",
    replyCount: 156,
    viewCount: 4567,
    likeCount: 234,
    tags: ["gobekli-tepe", "breaking", "neolithic"],
    isPinned: true,
    isHot: true,
  },

  // Zone threads
  {
    id: "thread-giza-shafts",
    sectionId: "sec-zone-egypt",
    slug: "great-pyramid-air-shafts-scan",
    title: "New scan results from the Great Pyramid air shafts",
    excerpt: "The ScanPyramids project has released new muon tomography data. The void behind the Queen's Chamber shaft shows unexpected geometry.",
    author: {
      id: "user-aminah",
      username: "dr.aminah.s",
      displayName: "Dr. Aminah Sayed",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=aminah",
      isVerified: true,
      role: "Expert",
    },
    createdAt: "2024-11-28T14:00:00Z",
    lastActivity: "2024-12-02T13:20:00Z",
    replyCount: 89,
    viewCount: 2345,
    likeCount: 156,
    tags: ["giza", "scanning", "voids"],
    isHot: true,
    linkedSites: ["site-giza-gp"],
    linkedZones: ["zone-lower-nile"],
  },

  // Fieldwork threads
  {
    id: "thread-orkney-2024",
    sectionId: "sec-field-reports",
    slug: "orkney-stone-circles-november-2024",
    title: "Orkney stone circles - November 2024 visit report",
    excerpt: "Just returned from a week exploring Brodgar, Stenness, and the lesser-known sites. Sharing photos, observations, and some unexpected discoveries.",
    author: {
      id: "user-maya",
      username: "explorer.maya",
      displayName: "Maya Chen",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
      isVerified: false,
      role: "Explorer",
    },
    createdAt: "2024-11-27T10:00:00Z",
    lastActivity: "2024-11-28T19:30:00Z",
    replyCount: 34,
    viewCount: 678,
    likeCount: 67,
    tags: ["orkney", "field-report", "stone-circles"],
    linkedSites: ["site-ring-of-brodgar"],
    linkedZones: ["zone-caledonia"],
  },

  // Community threads
  {
    id: "thread-book-recs",
    sectionId: "sec-general",
    slug: "book-recommendations-beginners",
    title: "Book recommendations for beginners",
    excerpt: "I'm new to ancient civilizations research. What are the must-read books that helped shape your understanding? Looking for both academic and accessible options.",
    author: {
      id: "user-reader",
      username: "curious.reader",
      displayName: "Alex Thompson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      isVerified: false,
    },
    createdAt: "2024-12-01T09:00:00Z",
    lastActivity: "2024-12-02T15:45:00Z",
    replyCount: 45,
    viewCount: 890,
    likeCount: 23,
    tags: ["books", "beginners", "resources"],
  },

  // More threads for variety
  {
    id: "thread-quipu",
    sectionId: "sec-hypotheses",
    slug: "quipu-fiber-resonance",
    title: "Quipu fiber resonance experiments",
    excerpt: "Shared slow-motion capture of dyed fiber bundles vibrating in response to flute frequencies. Need insights on knot tension encoding.",
    author: {
      id: "user-andes",
      username: "andes.lab",
      displayName: "Andean Research Lab",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=andes",
      isVerified: true,
      role: "Institution",
    },
    createdAt: "2024-09-15T12:00:00Z",
    lastActivity: "2024-11-22T08:40:00Z",
    replyCount: 32,
    viewCount: 456,
    likeCount: 45,
    tags: ["inca", "material-science", "quipu"],
    isVerifiedOnly: true,
  },
  {
    id: "thread-derinkuyu",
    sectionId: "sec-zone-asia",
    slug: "derinkuyu-ventilation-mapping",
    title: "Ventilation mapping at Derinkuyu",
    excerpt: "Requesting volunteers to annotate 2024 tunnel lidar scans with airflow observations; will feed into myth cycle hypothesis.",
    author: {
      id: "user-ipek",
      username: "moderator.ipek",
      displayName: "Ipek Yilmaz",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ipek",
      isVerified: true,
      role: "Moderator",
    },
    createdAt: "2024-08-10T14:30:00Z",
    lastActivity: "2024-11-19T17:16:00Z",
    replyCount: 11,
    viewCount: 234,
    likeCount: 18,
    tags: ["anatolia", "collaboration", "lidar"],
    linkedSites: ["site-derinkuyu"],
  },
];

// ============================================================================
// Forum Stats
// ============================================================================

export const forumStats = {
  totalThreads: 3456,
  totalPosts: 78901,
  totalMembers: 12345,
  onlineNow: 234,
  newestMember: "curious.reader",
  topContributors: [
    { username: "dr.aminah.s", posts: 567, isVerified: true },
    { username: "explorer.maya", posts: 432, isVerified: false },
    { username: "scribe.elena", posts: 389, isVerified: true },
    { username: "andes.lab", posts: 345, isVerified: true },
    { username: "field.reporter", posts: 312, isVerified: true },
  ],
};

// Helper functions
export function getCategoryById(id: string): ForumCategory | undefined {
  return forumCategories.find((c) => c.id === id);
}

export function getSectionsByCategory(categoryId: string): ForumSection[] {
  return forumSections.filter((s) => s.categoryId === categoryId);
}

export function getThreadsBySection(sectionId: string): ForumThread[] {
  return forumThreads.filter((t) => t.sectionId === sectionId);
}

export function getHotThreads(limit: number = 5): ForumThread[] {
  return forumThreads
    .filter((t) => t.isHot)
    .sort((a, b) => b.replyCount - a.replyCount)
    .slice(0, limit);
}

export function getRecentThreads(limit: number = 10): ForumThread[] {
  return [...forumThreads]
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, limit);
}







