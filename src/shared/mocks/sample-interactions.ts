import { Comment, Rating } from "@/lib/types";
import { sampleUsers } from "./sample-content";

export const sampleComments: Comment[] = [
  // Comments on content-img-001 (Great Pyramid scan)
  {
    id: "comment-001",
    contentId: "content-img-001",
    author: sampleUsers["field.aurelia"],
    body: "Incredible detail! The precision of these granite blocks is astounding. Have you done any acoustic analysis of the chamber?",
    createdAt: "2024-10-12T15:20:00Z",
    likes: 12,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [
      {
        id: "comment-001-reply-001",
        contentId: "content-img-001",
        parentCommentId: "comment-001",
        author: sampleUsers["curator.laila"],
        body: "Yes! We're collaborating with acoustic engineers. The chamber has fascinating resonant properties at specific frequencies. Will publish findings soon.",
        createdAt: "2024-10-12T16:45:00Z",
        likes: 8,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [],
        replyCount: 0,
      },
      {
        id: "comment-001-reply-002",
        contentId: "content-img-001",
        parentCommentId: "comment-001",
        author: sampleUsers["dr.schmidt"],
        body: "Would love to compare with acoustic measurements from Göbekli Tepe. There might be interesting parallels.",
        createdAt: "2024-10-13T09:15:00Z",
        likes: 5,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [],
        replyCount: 0,
      },
    ],
    replyCount: 2,
  },
  {
    id: "comment-002",
    contentId: "content-img-001",
    author: sampleUsers["citizen.rina"],
    body: "The scan quality is amazing. What equipment was used for this? I'm working on satellite imagery analysis and trying to understand scanning techniques.",
    createdAt: "2024-10-13T11:30:00Z",
    likes: 4,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [],
    replyCount: 0,
  },
  
  // Comments on content-yt-001 (Acoustic Resonance video)
  {
    id: "comment-003",
    contentId: "content-yt-001",
    author: sampleUsers["curator.laila"],
    body: "This is groundbreaking work Aurelia! The tonal variations you've documented correlate perfectly with the findings from Egyptian temples. Cross-cultural acoustic knowledge?",
    createdAt: "2024-09-24T10:30:00Z",
    likes: 23,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [
      {
        id: "comment-003-reply-001",
        contentId: "content-yt-001",
        parentCommentId: "comment-003",
        author: sampleUsers["field.aurelia"],
        body: "Thank you! That's exactly what we're investigating. The frequency ranges are remarkably similar across continents. Next paper will explore this connection.",
        createdAt: "2024-09-24T12:15:00Z",
        likes: 15,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [],
        replyCount: 0,
      },
    ],
    replyCount: 1,
  },
  {
    id: "comment-004",
    contentId: "content-yt-001",
    author: sampleUsers["explorer.maya"],
    body: "Could these acoustic properties have been used for communication over distances? Or were they purely ceremonial?",
    createdAt: "2024-09-25T08:20:00Z",
    likes: 7,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [],
    replyCount: 0,
  },
  
  // Comments on controversial post (acoustic levitation)
  {
    id: "comment-005",
    contentId: "content-post-orphan-001",
    author: sampleUsers["dr.schmidt"],
    body: "Well-reasoned analysis. While acoustic properties clearly mattered to ancient builders, levitation theories lack physical plausibility. Focus on documented techniques.",
    createdAt: "2024-08-15T14:45:00Z",
    likes: 34,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [
      {
        id: "comment-005-reply-001",
        contentId: "content-post-orphan-001",
        parentCommentId: "comment-005",
        author: sampleUsers["explorer.maya"],
        body: "I appreciate the skepticism, but shouldn't we keep an open mind? Ancient texts do mention stones that 'sang' or 'spoke'.",
        createdAt: "2024-08-15T15:20:00Z",
        likes: 12,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [
          {
            id: "comment-005-reply-001-reply-001",
            contentId: "content-post-orphan-001",
            parentCommentId: "comment-005-reply-001",
            author: sampleUsers["dr.schmidt"],
            body: "Open-mindedness yes, but grounded in physics. 'Singing stones' more likely refers to resonance when struck, which is well-documented.",
            createdAt: "2024-08-15T16:00:00Z",
            likes: 18,
            isEdited: false,
            isHidden: false,
            isDeleted: false,
            flagCount: 0,
            replies: [],
            replyCount: 0,
          },
        ],
        replyCount: 1,
      },
    ],
    replyCount: 1,
  },
  {
    id: "comment-006",
    contentId: "content-post-orphan-001",
    author: sampleUsers["field.aurelia"],
    body: "Great post! The distinction between acoustic design (proven) and levitation (speculative) is crucial. Let's not conflate the two phenomena.",
    createdAt: "2024-08-15T17:30:00Z",
    likes: 21,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [],
    replyCount: 0,
  },
  
  // Comments on precision stonework post
  {
    id: "comment-007",
    contentId: "content-post-001",
    author: sampleUsers["dr.schmidt"],
    body: "Excellent comparative analysis. At Göbekli Tepe we've found evidence of copper tools used on limestone, despite no copper mines nearby. Knowledge transfer across distances?",
    createdAt: "2024-10-01T11:30:00Z",
    likes: 28,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [],
    replyCount: 0,
  },
  {
    id: "comment-008",
    contentId: "content-post-001",
    author: sampleUsers["citizen.rina"],
    body: "Have you considered that satellite imagery might reveal similar precision work in unexplored regions? I've been analyzing formations in Australia...",
    createdAt: "2024-10-02T09:15:00Z",
    likes: 9,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [
      {
        id: "comment-008-reply-001",
        contentId: "content-post-001",
        parentCommentId: "comment-008",
        author: sampleUsers["field.aurelia"],
        body: "That's fascinating! Would you be willing to share your findings? We're always looking for new sites to investigate.",
        createdAt: "2024-10-02T14:20:00Z",
        likes: 6,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [],
        replyCount: 0,
      },
    ],
    replyCount: 1,
  },
  
  // Comments on Bimini Road video
  {
    id: "comment-009",
    contentId: "content-yt-002",
    author: sampleUsers["curator.laila"],
    body: "Nice underwater work, but have you considered that these might be natural beachrock formations? The rectangular shapes can occur naturally.",
    createdAt: "2024-09-21T08:30:00Z",
    likes: 11,
    isEdited: false,
    isHidden: false,
    isDeleted: false,
    flagCount: 0,
    replies: [
      {
        id: "comment-009-reply-001",
        contentId: "content-yt-002",
        parentCommentId: "comment-009",
        author: sampleUsers["explorer.maya"],
        body: "Valid point! That's why I'm submitting for review. Would love input from geologists. Some sections do look worked though.",
        createdAt: "2024-09-21T10:15:00Z",
        likes: 7,
        isEdited: false,
        isHidden: false,
        isDeleted: false,
        flagCount: 0,
        replies: [],
        replyCount: 0,
      },
    ],
    replyCount: 1,
  },
];

export const sampleRatings: Rating[] = [
  // Ratings for Great Pyramid scan
  {
    id: "rating-001",
    contentId: "content-img-001",
    user: sampleUsers["field.aurelia"],
    rating: 5,
    review: "Exceptional quality scan. This will be invaluable for acoustic research. The resolution is perfect for detailed analysis.",
    createdAt: "2024-10-12T15:25:00Z",
    helpfulCount: 8,
    notHelpfulCount: 0,
  },
  {
    id: "rating-002",
    contentId: "content-img-001",
    user: sampleUsers["dr.schmidt"],
    rating: 5,
    review: "Outstanding documentation. This is the standard all archaeological imaging should aspire to.",
    createdAt: "2024-10-13T09:00:00Z",
    helpfulCount: 12,
    notHelpfulCount: 0,
  },
  {
    id: "rating-003",
    contentId: "content-img-001",
    user: sampleUsers["citizen.rina"],
    rating: 4,
    review: "Great scan! Would love to see metadata about the scanning process for educational purposes.",
    createdAt: "2024-10-13T11:35:00Z",
    helpfulCount: 3,
    notHelpfulCount: 1,
  },
  
  // Ratings for acoustic video
  {
    id: "rating-004",
    contentId: "content-yt-001",
    user: sampleUsers["curator.laila"],
    rating: 5,
    review: "Groundbreaking research presented clearly. The demonstrations are convincing and well-documented. This opens up new research directions.",
    createdAt: "2024-09-24T10:35:00Z",
    helpfulCount: 19,
    notHelpfulCount: 1,
  },
  {
    id: "rating-005",
    contentId: "content-yt-001",
    user: sampleUsers["dr.schmidt"],
    rating: 5,
    review: "Excellent field work. The methodology is sound and the results are fascinating. Looking forward to the full paper.",
    createdAt: "2024-09-24T14:20:00Z",
    helpfulCount: 15,
    notHelpfulCount: 0,
  },
  {
    id: "rating-006",
    contentId: "content-yt-001",
    user: sampleUsers["explorer.maya"],
    rating: 4,
    review: "Very interesting! Would have liked more technical details about the frequency measurements, but great work overall.",
    createdAt: "2024-09-25T08:25:00Z",
    helpfulCount: 5,
    notHelpfulCount: 2,
  },
  
  // Ratings for precision stonework post
  {
    id: "rating-007",
    contentId: "content-post-001",
    user: sampleUsers["curator.laila"],
    rating: 5,
    review: "Thoughtful comparative analysis across cultures. Well-researched and balanced perspective.",
    createdAt: "2024-10-01T12:30:00Z",
    helpfulCount: 14,
    notHelpfulCount: 0,
  },
  {
    id: "rating-008",
    contentId: "content-post-001",
    user: sampleUsers["dr.schmidt"],
    rating: 5,
    review: "Excellent synthesis of evidence from multiple sites. The questions posed are exactly what we need to investigate further.",
    createdAt: "2024-10-01T13:15:00Z",
    helpfulCount: 17,
    notHelpfulCount: 0,
  },
  
  // Ratings for controversial levitation post (mixed reviews)
  {
    id: "rating-009",
    contentId: "content-post-orphan-001",
    user: sampleUsers["dr.schmidt"],
    rating: 4,
    review: "Good critical analysis that's needed in this field. Docked one star for not engaging more with the anthropological evidence of acoustic knowledge.",
    createdAt: "2024-08-15T14:50:00Z",
    helpfulCount: 21,
    notHelpfulCount: 8,
  },
  {
    id: "rating-010",
    contentId: "content-post-orphan-001",
    user: sampleUsers["field.aurelia"],
    rating: 5,
    review: "Thank you for bringing scientific rigor to this topic. We need more critical thinking in alternative archaeology discussions.",
    createdAt: "2024-08-15T17:35:00Z",
    helpfulCount: 18,
    notHelpfulCount: 5,
  },
  {
    id: "rating-011",
    contentId: "content-post-orphan-001",
    user: sampleUsers["citizen.rina"],
    rating: 2,
    review: "Too dismissive of alternative theories. Ancient knowledge may have included techniques we don't understand yet.",
    createdAt: "2024-08-16T09:20:00Z",
    helpfulCount: 9,
    notHelpfulCount: 15,
  },
  
  // Ratings for Bimini Road video (mixed due to controversy)
  {
    id: "rating-012",
    contentId: "content-yt-002",
    user: sampleUsers["curator.laila"],
    rating: 3,
    review: "Good underwater documentation, but geological analysis needed. Could be natural formations.",
    createdAt: "2024-09-21T08:35:00Z",
    helpfulCount: 8,
    notHelpfulCount: 3,
  },
  {
    id: "rating-013",
    contentId: "content-yt-002",
    user: sampleUsers["citizen.rina"],
    rating: 4,
    review: "Brave to explore controversial sites. The photogrammetry technique is solid even if the conclusions are uncertain.",
    createdAt: "2024-09-21T15:00:00Z",
    helpfulCount: 4,
    notHelpfulCount: 2,
  },
  
  // Ratings for Göbekli Tepe report
  {
    id: "rating-014",
    contentId: "content-doc-001",
    user: sampleUsers["curator.laila"],
    rating: 5,
    review: "Comprehensive and meticulously documented. Essential reading for anyone interested in Neolithic archaeology.",
    createdAt: "2024-10-16T09:00:00Z",
    helpfulCount: 24,
    notHelpfulCount: 0,
  },
  {
    id: "rating-015",
    contentId: "content-doc-001",
    user: sampleUsers["field.aurelia"],
    rating: 5,
    review: "The detail level is incredible. The new T-pillar findings are particularly exciting. Thank you for making this public!",
    createdAt: "2024-10-16T14:30:00Z",
    helpfulCount: 19,
    notHelpfulCount: 0,
  },
  
  // Ratings for Sphinx erosion image
  {
    id: "rating-016",
    contentId: "content-img-002",
    user: sampleUsers["dr.schmidt"],
    rating: 5,
    review: "Clear photographic evidence of erosion patterns. This contributes to the weathering debate significantly.",
    createdAt: "2024-09-01T16:20:00Z",
    helpfulCount: 11,
    notHelpfulCount: 2,
  },
  {
    id: "rating-017",
    contentId: "content-img-002",
    user: sampleUsers["field.aurelia"],
    rating: 4,
    review: "Good documentation. Would benefit from scale reference and geological analysis in the description.",
    createdAt: "2024-09-02T08:45:00Z",
    helpfulCount: 7,
    notHelpfulCount: 1,
  },
];

// Helper functions
export function getCommentsByContentId(contentId: string): Comment[] {
  return sampleComments.filter((comment) => 
    comment.contentId === contentId && !comment.parentCommentId
  );
}

export function getRatingsByContentId(contentId: string): Rating[] {
  return sampleRatings.filter((rating) => rating.contentId === contentId);
}

export function getCommentsByUser(username: string): Comment[] {
  return sampleComments.filter((comment) => 
    comment.author.username === username
  );
}

export function getRatingsByUser(username: string): Rating[] {
  return sampleRatings.filter((rating) => 
    rating.user.username === username
  );
}

