/**
 * Forum Mock Data
 * Simplified flat board structure with 5 focused boards
 */

export interface ForumBoard {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  threadCount: number;
  postCount: number;
}

export interface ForumThread {
  id: string;
  boardId: string;
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
  isHot?: boolean;
  linkedSiteId?: string;
  linkedSiteName?: string;
}

// ============================================================================
// Boards - 5 focused discussion areas
// ============================================================================

export const forumBoards: ForumBoard[] = [
  {
    id: "board-sites",
    slug: "site-discussions",
    name: "Site Discussions",
    description: "Discuss specific megalithic sites on the map",
    icon: "MapPin",
    color: "text-emerald-400",
    threadCount: 567,
    postCount: 12456,
  },
  {
    id: "board-fieldwork",
    slug: "fieldwork",
    name: "Fieldwork",
    description: "Trip planning, field reports, and equipment",
    icon: "Compass",
    color: "text-orange-400",
    threadCount: 234,
    postCount: 4567,
  },
  {
    id: "board-research",
    slug: "research",
    name: "Research",
    description: "Theories, hypotheses, and academic discussions",
    icon: "FlaskConical",
    color: "text-blue-400",
    threadCount: 312,
    postCount: 6789,
  },
  {
    id: "board-discoveries",
    slug: "discoveries",
    name: "Discoveries",
    description: "Breaking news and new findings",
    icon: "Sparkles",
    color: "text-amber-400",
    threadCount: 189,
    postCount: 3456,
  },
  {
    id: "board-general",
    slug: "general",
    name: "General",
    description: "Community chat and introductions",
    icon: "MessageCircle",
    color: "text-purple-400",
    threadCount: 456,
    postCount: 8901,
  },
];

// ============================================================================
// Sample Threads
// ============================================================================

export const forumThreads: ForumThread[] = [
  // Site Discussions
  {
    id: "thread-giza-shafts",
    boardId: "board-sites",
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
    tags: ["giza", "scanning", "pyramids"],
    isHot: true,
    linkedSiteId: "site-giza-gp",
    linkedSiteName: "Great Pyramid of Giza",
  },
  {
    id: "thread-stonehenge-alignment",
    boardId: "board-sites",
    slug: "stonehenge-winter-solstice-alignment",
    title: "Stonehenge winter solstice alignment observations",
    excerpt: "Documenting the precise alignment during this year's solstice. Comparing with historical records and astronomical calculations.",
    author: {
      id: "user-james",
      username: "stone.circle.james",
      displayName: "James Wright",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      isVerified: false,
    },
    createdAt: "2024-12-15T08:00:00Z",
    lastActivity: "2024-12-18T16:30:00Z",
    replyCount: 34,
    viewCount: 892,
    likeCount: 67,
    tags: ["stonehenge", "solstice", "alignment"],
    linkedSiteId: "site-stonehenge",
    linkedSiteName: "Stonehenge",
  },
  {
    id: "thread-gobekli-pillars",
    boardId: "board-sites",
    slug: "gobekli-tepe-pillar-carvings",
    title: "Cataloging the animal carvings on Göbekli Tepe pillars",
    excerpt: "Starting a collaborative effort to document and categorize all known animal carvings. Looking for high-res photo contributions.",
    author: {
      id: "user-ipek",
      username: "moderator.ipek",
      displayName: "Ipek Yilmaz",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ipek",
      isVerified: true,
      role: "Moderator",
    },
    createdAt: "2024-11-10T10:00:00Z",
    lastActivity: "2024-12-17T09:15:00Z",
    replyCount: 156,
    viewCount: 3421,
    likeCount: 234,
    tags: ["gobekli-tepe", "carvings", "collaboration"],
    isPinned: true,
    linkedSiteId: "site-gobekli-tepe",
    linkedSiteName: "Göbekli Tepe",
  },

  // Fieldwork
  {
    id: "thread-orkney-2024",
    boardId: "board-fieldwork",
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
    isHot: true,
  },
  {
    id: "thread-drone-tips",
    boardId: "board-fieldwork",
    slug: "drone-photography-megalithic-sites",
    title: "Drone photography tips for megalithic sites",
    excerpt: "What settings and techniques work best? Sharing my setup and looking for recommendations on flight patterns for site documentation.",
    author: {
      id: "user-carlos",
      username: "aerial.carlos",
      displayName: "Carlos Mendez",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
      isVerified: true,
      role: "Photographer",
    },
    createdAt: "2024-12-01T14:00:00Z",
    lastActivity: "2024-12-16T11:45:00Z",
    replyCount: 45,
    viewCount: 1234,
    likeCount: 89,
    tags: ["drone", "photography", "equipment"],
    isPinned: true,
  },
  {
    id: "thread-peru-expedition",
    boardId: "board-fieldwork",
    slug: "planning-peru-expedition-2025",
    title: "Planning Peru expedition - Spring 2025",
    excerpt: "Looking for travel companions to explore Sacsayhuamán, Ollantaytambo, and lesser-known sites. Tentative dates: March 15-30.",
    author: {
      id: "user-sarah",
      username: "wanderer.sarah",
      displayName: "Sarah Johnson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      isVerified: false,
    },
    createdAt: "2024-12-10T09:00:00Z",
    lastActivity: "2024-12-18T08:20:00Z",
    replyCount: 23,
    viewCount: 567,
    likeCount: 45,
    tags: ["peru", "expedition", "planning"],
  },

  // Research
  {
    id: "thread-acoustic-resonance",
    boardId: "board-research",
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
    isHot: true,
  },
  {
    id: "thread-quipu",
    boardId: "board-research",
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
    tags: ["inca", "quipu", "material-science"],
  },
  {
    id: "thread-carbon-dating",
    boardId: "board-research",
    slug: "carbon-dating-methodology-submerged",
    title: "Re-evaluating carbon dating for submerged sites",
    excerpt: "Proposing adjustments to standard methodology when dealing with sites that have been underwater. The marine reservoir effect needs better calibration.",
    author: {
      id: "user-martinez",
      username: "prof.martinez",
      displayName: "Prof. Martinez",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=martinez",
      isVerified: true,
      role: "Academic",
    },
    createdAt: "2024-10-20T11:00:00Z",
    lastActivity: "2024-12-01T09:15:00Z",
    replyCount: 28,
    viewCount: 789,
    likeCount: 56,
    tags: ["dating", "methodology", "underwater"],
  },

  // Discoveries
  {
    id: "thread-gobekli-2024",
    boardId: "board-discoveries",
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
  {
    id: "thread-underwater-japan",
    boardId: "board-discoveries",
    slug: "underwater-structures-yonaguni-update",
    title: "New underwater survey at Yonaguni Monument",
    excerpt: "Latest sonar mapping reveals additional geometric features previously obscured by sediment. Debate continues on natural vs. man-made origins.",
    author: {
      id: "user-tanaka",
      username: "dr.tanaka",
      displayName: "Dr. Kenji Tanaka",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka",
      isVerified: true,
      role: "Researcher",
    },
    createdAt: "2024-12-05T06:00:00Z",
    lastActivity: "2024-12-17T14:30:00Z",
    replyCount: 67,
    viewCount: 1890,
    likeCount: 123,
    tags: ["yonaguni", "underwater", "japan"],
    isHot: true,
  },
  {
    id: "thread-lidar-amazon",
    boardId: "board-discoveries",
    slug: "lidar-reveals-amazon-settlements",
    title: "LiDAR reveals extensive ancient settlements in Amazon",
    excerpt: "New aerial survey data shows network of interconnected settlements spanning hundreds of kilometers. Challenges previous assumptions about rainforest habitation.",
    author: {
      id: "user-silva",
      username: "dr.silva",
      displayName: "Dr. Ana Silva",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=silva",
      isVerified: true,
      role: "Archaeologist",
    },
    createdAt: "2024-12-12T10:00:00Z",
    lastActivity: "2024-12-18T11:00:00Z",
    replyCount: 89,
    viewCount: 2345,
    likeCount: 178,
    tags: ["amazon", "lidar", "settlements"],
  },

  // General
  {
    id: "thread-book-recs",
    boardId: "board-general",
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
    isPinned: true,
  },
  {
    id: "thread-intro-december",
    boardId: "board-general",
    slug: "december-introductions-thread",
    title: "December Introductions Thread",
    excerpt: "New to the community? Introduce yourself here! Tell us about your interests and what brought you to ancient civilizations research.",
    author: {
      id: "user-ipek",
      username: "moderator.ipek",
      displayName: "Ipek Yilmaz",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ipek",
      isVerified: true,
      role: "Moderator",
    },
    createdAt: "2024-12-01T00:00:00Z",
    lastActivity: "2024-12-18T17:30:00Z",
    replyCount: 78,
    viewCount: 1234,
    likeCount: 56,
    tags: ["introductions", "welcome", "community"],
    isPinned: true,
  },
  {
    id: "thread-documentaries",
    boardId: "board-general",
    slug: "best-documentaries-2024",
    title: "Best documentaries of 2024",
    excerpt: "What documentaries about ancient sites or civilizations have you watched this year? Looking for recommendations for the holiday break.",
    author: {
      id: "user-viewer",
      username: "doc.watcher",
      displayName: "Mike Roberts",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      isVerified: false,
    },
    createdAt: "2024-12-14T18:00:00Z",
    lastActivity: "2024-12-18T20:15:00Z",
    replyCount: 34,
    viewCount: 567,
    likeCount: 28,
    tags: ["documentaries", "media", "recommendations"],
  },
];

// ============================================================================
// Forum Stats
// ============================================================================

export const forumStats = {
  totalThreads: 1758,
  totalPosts: 36169,
  totalMembers: 12345,
  onlineNow: 234,
  newestMember: "curious.reader",
  topContributors: [
    { username: "dr.aminah.s", posts: 567, isVerified: true },
    { username: "explorer.maya", posts: 432, isVerified: false },
    { username: "moderator.ipek", posts: 389, isVerified: true },
    { username: "andes.lab", posts: 345, isVerified: true },
    { username: "field.reporter", posts: 312, isVerified: true },
  ],
};

// ============================================================================
// Helper functions
// ============================================================================

export function getBoardById(id: string): ForumBoard | undefined {
  return forumBoards.find((b) => b.id === id);
}

export function getBoardBySlug(slug: string): ForumBoard | undefined {
  return forumBoards.find((b) => b.slug === slug);
}

export function getThreadsByBoard(boardId: string): ForumThread[] {
  return forumThreads.filter((t) => t.boardId === boardId);
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

export function getPinnedThreads(boardId?: string): ForumThread[] {
  const threads = boardId ? getThreadsByBoard(boardId) : forumThreads;
  return threads.filter((t) => t.isPinned);
}

export function getAllThreads(): ForumThread[] {
  return [...forumThreads].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );
}
