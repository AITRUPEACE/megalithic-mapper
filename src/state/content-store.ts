import { create } from "zustand";
import { nanoid } from "nanoid";
import { ContentItem, ContentType, VerificationStatus, Comment, Rating } from "@/shared/types/content";
import { sampleContentItems } from "@/shared/mocks/sample-content";
import { sampleComments, sampleRatings } from "@/shared/mocks/sample-interactions";

export interface ContentFilters {
  search: string;
  types: ContentType[];
  civilizations: string[];
  eras: string[];
  verification: "all" | VerificationStatus;
  linkedToSite: string | null; // Filter by specific site ID
  hasNoSiteLink: boolean; // Show orphaned content
  tags: string[];
  submittedBy: string | null; // Filter by user
  minRating: number; // 0-5
  sortBy: "recent" | "popular" | "rating" | "comments";
}

interface ContentState {
  // Content
  contentItems: ContentItem[];
  selectedContentId: string | null;
  filters: ContentFilters;
  
  // Comments
  comments: Comment[];
  
  // Ratings
  ratings: Rating[];
  
  // Actions
  setFilters: (update: Partial<ContentFilters>) => void;
  clearFilters: () => void;
  selectContent: (contentId: string | null) => void;
  
  // Content CRUD
  addContent: (content: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "stats">) => ContentItem;
  updateContent: (content: ContentItem) => void;
  deleteContent: (contentId: string) => void;
  linkContentToSite: (contentId: string, siteId: string) => void;
  unlinkContentFromSite: (contentId: string, siteId: string) => void;
  
  // Comments
  addComment: (comment: Omit<Comment, "id" | "createdAt" | "likes" | "isEdited" | "isHidden" | "isDeleted" | "flagCount" | "replies" | "replyCount">) => Comment;
  updateComment: (commentId: string, body: string) => void;
  deleteComment: (commentId: string) => void;
  likeComment: (commentId: string, userId: string) => void;
  
  // Ratings
  addOrUpdateRating: (rating: Omit<Rating, "id" | "createdAt" | "updatedAt" | "helpfulCount" | "notHelpfulCount">) => Rating;
  deleteRating: (ratingId: string) => void;
  markRatingHelpful: (ratingId: string, helpful: boolean) => void;
  
  // User actions
  likeContent: (contentId: string, userId: string) => void;
  bookmarkContent: (contentId: string, userId: string) => void;
  shareContent: (contentId: string, userId: string) => void;
  viewContent: (contentId: string, userId: string) => void;
}

const DEFAULT_FILTERS: ContentFilters = {
  search: "",
  types: [],
  civilizations: [],
  eras: [],
  verification: "all",
  linkedToSite: null,
  hasNoSiteLink: false,
  tags: [],
  submittedBy: null,
  minRating: 0,
  sortBy: "recent",
};

export const useContentStore = create<ContentState>((set, get) => ({
  contentItems: sampleContentItems,
  selectedContentId: null,
  filters: DEFAULT_FILTERS,
  comments: sampleComments,
  ratings: sampleRatings,
  
  setFilters: (update) =>
    set((state) => ({
      filters: { ...state.filters, ...update },
    })),
  
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  
  selectContent: (contentId) => set({ selectedContentId: contentId }),
  
  addContent: (contentInput) => {
    const id = nanoid(12);
    const now = new Date().toISOString();
    
    const newContent: ContentItem = {
      ...contentInput,
      id,
      createdAt: now,
      updatedAt: now,
      stats: {
        views: 0,
        likes: 0,
        bookmarks: 0,
        comments: 0,
        shares: 0,
        rating: {
          average: 0,
          count: 0,
        },
      },
    };
    
    set((state) => ({ contentItems: [...state.contentItems, newContent] }));
    set({ selectedContentId: id });
    return newContent;
  },
  
  updateContent: (content) =>
    set((state) => ({
      contentItems: state.contentItems.map((existing) =>
        existing.id === content.id 
          ? { ...content, updatedAt: new Date().toISOString() } 
          : existing
      ),
    })),
  
  deleteContent: (contentId) =>
    set((state) => ({
      contentItems: state.contentItems.filter((item) => item.id !== contentId),
      selectedContentId: state.selectedContentId === contentId ? null : state.selectedContentId,
    })),
  
  linkContentToSite: (contentId, siteId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId && !(item.linkedSites || []).includes(siteId)
          ? { 
              ...item, 
              linkedSites: [...(item.linkedSites || []), siteId],
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    })),
  
  unlinkContentFromSite: (contentId, siteId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId
          ? { 
              ...item, 
              linkedSites: (item.linkedSites || []).filter((id) => id !== siteId),
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    })),
  
  // Comments
  addComment: (commentInput) => {
    const id = nanoid(12);
    const now = new Date().toISOString();
    
    const newComment: Comment = {
      ...commentInput,
      id,
      createdAt: now,
      likes: 0,
      isEdited: false,
      isHidden: false,
      isDeleted: false,
      flagCount: 0,
      replies: [],
      replyCount: 0,
    };
    
    set((state) => {
      // Update comment count on content
      const contentItems = state.contentItems.map((item) =>
        item.id === commentInput.contentId
          ? { 
              ...item, 
              stats: { 
                ...item.stats, 
                comments: item.stats.comments + 1,
              },
            }
          : item
      );
      
      return {
        comments: [...state.comments, newComment],
        contentItems,
      };
    });
    
    return newComment;
  },
  
  updateComment: (commentId, body) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? { 
              ...comment, 
              body, 
              updatedAt: new Date().toISOString(),
              isEdited: true,
            }
          : comment
      ),
    })),
  
  deleteComment: (commentId) =>
    set((state) => {
      const comment = state.comments.find((c) => c.id === commentId);
      if (!comment) return state;
      
      return {
        comments: state.comments.map((c) =>
          c.id === commentId
            ? { ...c, isDeleted: true, body: "[deleted]" }
            : c
        ),
        contentItems: state.contentItems.map((item) =>
          item.id === comment.contentId
            ? { 
                ...item, 
                stats: { 
                  ...item.stats, 
                  comments: Math.max(0, item.stats.comments - 1),
                },
              }
            : item
        ),
      };
    }),
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  likeComment: (commentId, _userId) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ),
    })),
  
  // Ratings
  addOrUpdateRating: (ratingInput) => {
    const existingRating = get().ratings.find(
      (r) => r.contentId === ratingInput.contentId && r.user.userId === ratingInput.user.userId
    );
    
    if (existingRating) {
      // Update existing rating
      const updatedRating: Rating = {
        ...existingRating,
        ...ratingInput,
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => {
        const ratings = state.ratings.map((r) =>
          r.id === existingRating.id ? updatedRating : r
        );
        
        // Recalculate average rating
        const contentRatings = ratings.filter((r) => r.contentId === ratingInput.contentId);
        const avgRating = contentRatings.reduce((sum, r) => sum + r.rating, 0) / contentRatings.length;
        
        return {
          ratings,
          contentItems: state.contentItems.map((item) =>
            item.id === ratingInput.contentId
              ? {
                  ...item,
                  stats: {
                    ...item.stats,
                    rating: {
                      average: avgRating,
                      count: contentRatings.length,
                    },
                  },
                }
              : item
          ),
        };
      });
      
      return updatedRating;
    } else {
      // Create new rating
      const id = nanoid(12);
      const now = new Date().toISOString();
      
      const newRating: Rating = {
        ...ratingInput,
        id,
        createdAt: now,
        helpfulCount: 0,
        notHelpfulCount: 0,
      };
      
      set((state) => {
        const ratings = [...state.ratings, newRating];
        const contentRatings = ratings.filter((r) => r.contentId === ratingInput.contentId);
        const avgRating = contentRatings.reduce((sum, r) => sum + r.rating, 0) / contentRatings.length;
        
        return {
          ratings,
          contentItems: state.contentItems.map((item) =>
            item.id === ratingInput.contentId
              ? {
                  ...item,
                  stats: {
                    ...item.stats,
                    rating: {
                      average: avgRating,
                      count: contentRatings.length,
                    },
                  },
                }
              : item
          ),
        };
      });
      
      return newRating;
    }
  },
  
  deleteRating: (ratingId) =>
    set((state) => {
      const rating = state.ratings.find((r) => r.id === ratingId);
      if (!rating) return state;
      
      const ratings = state.ratings.filter((r) => r.id !== ratingId);
      const contentRatings = ratings.filter((r) => r.contentId === rating.contentId);
      const avgRating = contentRatings.length > 0
        ? contentRatings.reduce((sum, r) => sum + r.rating, 0) / contentRatings.length
        : 0;
      
      return {
        ratings,
        contentItems: state.contentItems.map((item) =>
          item.id === rating.contentId
            ? {
                ...item,
                stats: {
                  ...item.stats,
                  rating: {
                    average: avgRating,
                    count: contentRatings.length,
                  },
                },
              }
            : item
        ),
      };
    }),
  
  markRatingHelpful: (ratingId, helpful) =>
    set((state) => ({
      ratings: state.ratings.map((rating) =>
        rating.id === ratingId
          ? {
              ...rating,
              helpfulCount: helpful ? rating.helpfulCount + 1 : rating.helpfulCount,
              notHelpfulCount: !helpful ? rating.notHelpfulCount + 1 : rating.notHelpfulCount,
            }
          : rating
      ),
    })),
  
  // User actions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  likeContent: (contentId, _userId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId
          ? {
              ...item,
              stats: {
                ...item.stats,
                likes: item.stats.likes + 1,
              },
            }
          : item
      ),
    })),
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bookmarkContent: (contentId, _userId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId
          ? {
              ...item,
              stats: {
                ...item.stats,
                bookmarks: item.stats.bookmarks + 1,
              },
            }
          : item
      ),
    })),
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shareContent: (contentId, _userId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId
          ? {
              ...item,
              stats: {
                ...item.stats,
                shares: item.stats.shares + 1,
              },
            }
          : item
      ),
    })),
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewContent: (contentId, _userId) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === contentId
          ? {
              ...item,
              stats: {
                ...item.stats,
                views: item.stats.views + 1,
              },
            }
          : item
      ),
    })),
}));

// Filter function
export const filterContent = (items: ContentItem[], filters: Partial<ContentFilters>): ContentItem[] => {
  // Merge with defaults to ensure all properties exist
  const safeFilters: ContentFilters = {
    search: filters.search ?? "",
    types: filters.types ?? [],
    civilizations: filters.civilizations ?? [],
    eras: filters.eras ?? [],
    verification: filters.verification ?? "all",
    linkedToSite: filters.linkedToSite ?? null,
    hasNoSiteLink: filters.hasNoSiteLink ?? false,
    tags: filters.tags ?? [],
    submittedBy: filters.submittedBy ?? null,
    minRating: filters.minRating ?? 0,
    sortBy: filters.sortBy ?? "recent",
  };
  
  const filtered = items.filter((item) => {
    // Search
    const matchesSearch = safeFilters.search
      ? [item.title, item.description, (item.tags || []).join(" "), item.civilization || "", item.era || ""]
          .join(" ")
          .toLowerCase()
          .includes(safeFilters.search.toLowerCase())
      : true;
    
    // Types
    const matchesType = safeFilters.types.length === 0 || safeFilters.types.includes(item.type);
    
    // Civilizations
    const matchesCivilization = 
      safeFilters.civilizations.length === 0 || 
      (item.civilization && safeFilters.civilizations.includes(item.civilization));
    
    // Eras
    const matchesEra = 
      safeFilters.eras.length === 0 || 
      (item.era && safeFilters.eras.includes(item.era));
    
    // Verification
    const matchesVerification = 
      safeFilters.verification === "all" || 
      item.verificationStatus === safeFilters.verification;
    
    // Site link
    const matchesSiteLink = safeFilters.linkedToSite
      ? (item.linkedSites || []).includes(safeFilters.linkedToSite)
      : true;
    
    // Orphaned content
    const matchesOrphaned = safeFilters.hasNoSiteLink
      ? (item.linkedSites || []).length === 0
      : true;
    
    // Tags
    const matchesTags = 
      safeFilters.tags.length === 0 || 
      safeFilters.tags.some((tag) => (item.tags || []).includes(tag));
    
    // Submitted by
    const matchesSubmitter = safeFilters.submittedBy
      ? item.submittedBy.username === safeFilters.submittedBy
      : true;
    
    // Min rating
    const matchesRating = (item.stats?.rating?.average ?? 0) >= safeFilters.minRating;
    
    return (
      matchesSearch &&
      matchesType &&
      matchesCivilization &&
      matchesEra &&
      matchesVerification &&
      matchesSiteLink &&
      matchesOrphaned &&
      matchesTags &&
      matchesSubmitter &&
      matchesRating
    );
  });
  
  // Sort
  switch (safeFilters.sortBy) {
    case "recent":
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "popular":
      filtered.sort((a, b) => 
        ((b.stats?.likes ?? 0) + (b.stats?.bookmarks ?? 0) + (b.stats?.shares ?? 0)) - 
        ((a.stats?.likes ?? 0) + (a.stats?.bookmarks ?? 0) + (a.stats?.shares ?? 0))
      );
      break;
    case "rating":
      filtered.sort((a, b) => (b.stats?.rating?.average ?? 0) - (a.stats?.rating?.average ?? 0));
      break;
    case "comments":
      filtered.sort((a, b) => (b.stats?.comments ?? 0) - (a.stats?.comments ?? 0));
      break;
  }
  
  return filtered;
};

// Helper to get content by ID
export const getContentById = (items: ContentItem[], id: string): ContentItem | null => {
  return items.find((item) => item.id === id) ?? null;
};

// Helper to get comments for content (with threading)
export const getCommentsForContent = (
  comments: Comment[], 
  contentId: string
): Comment[] => {
  return comments.filter((comment) => 
    comment.contentId === contentId && 
    !comment.parentCommentId &&
    !comment.isDeleted
  );
};

// Helper to get ratings for content
export const getRatingsForContent = (
  ratings: Rating[], 
  contentId: string
): Rating[] => {
  return ratings.filter((rating) => rating.contentId === contentId);
};

