import type { DiscussionThreadSnapshot } from "@/types/discussion";

export const sampleThreadSnapshot: DiscussionThreadSnapshot = {
  thread: {
    id: "thread-quipu",
    threadId: "thread-quipu",
    parentId: null,
    entityRef: { zoneId: "zone-andes", siteId: "site-quipu" },
    authorId: "user-aurelia",
    title: "Quipu fiber resonance experiments",
    body:
      "Documenting fiber resonance captures at varying humidity levels. Early findings suggest tight knot clusters dampen harmonics; open strands amplify overtones.",
    markdownEnabled: true,
    attachments: [
      {
        id: "attach-quipu-spectrum",
        name: "spectrum.png",
        type: "image",
        previewUrl: "/media/spectrum-thumb.png",
        url: "/media/spectrum.png",
        size: 128034,
      },
    ],
    reactionCounters: [
      { kind: "insight", count: 6 },
      { kind: "appreciate", count: 12 },
      { kind: "question", count: 3 },
    ],
    mentions: [
      {
        mention: {
          id: "user-laila",
          displayName: "Laila Okoye",
          handle: "laila.okoye",
          avatarUrl: null,
        },
        location: { start: 18, end: 29 },
        reason: "mention",
      },
    ],
    createdAt: "2024-09-22T08:00:00Z",
    updatedAt: "2024-09-22T08:00:00Z",
    totalReplies: 2,
  },
  comments: [
    {
      id: "comment-quipu-1",
      threadId: "thread-quipu",
      parentId: "thread-quipu",
      entityRef: { zoneId: "zone-andes", siteId: "site-quipu" },
      authorId: "user-laila",
      body:
        "@aurelia Could you share the knot density on the bundles that amplified overtones? I can cross-check with our acoustic camera logs.",
      markdownEnabled: true,
      attachments: [],
      reactionCounters: [
        { kind: "appreciate", count: 3 },
        { kind: "question", count: 1 },
      ],
      mentions: [
        {
          mention: {
            id: "user-aurelia",
            displayName: "Aurelia Quispe",
            handle: "aurelia",
            avatarUrl: null,
          },
          location: { start: 0, end: 8 },
          reason: "mention",
        },
      ],
      createdAt: "2024-09-22T08:10:00Z",
      updatedAt: "2024-09-22T08:10:00Z",
      replyCount: 1,
    },
    {
      id: "comment-quipu-2",
      threadId: "thread-quipu",
      parentId: "comment-quipu-1",
      entityRef: { zoneId: "zone-andes", siteId: "site-quipu" },
      authorId: "user-aurelia",
      body:
        "Logging this for the whole squad: overtone-rich strands averaged 0.4 knots/cm at 55% humidity. @laila.okoye what was your mic spacing?",
      markdownEnabled: true,
      attachments: [
        {
          id: "attach-quipu-log",
          name: "humidity-log.csv",
          type: "document",
          url: "/media/humidity-log.csv",
          size: 4824,
        },
      ],
      reactionCounters: [
        { kind: "insight", count: 2 },
        { kind: "appreciate", count: 1 },
      ],
      mentions: [
        {
          mention: {
            id: "user-laila",
            displayName: "Laila Okoye",
            handle: "laila.okoye",
            avatarUrl: null,
          },
          location: { start: 99, end: 111 },
          reason: "mention",
        },
      ],
      createdAt: "2024-09-22T08:20:00Z",
      updatedAt: "2024-09-22T08:20:00Z",
      replyCount: 0,
    },
  ],
  participants: [
    {
      id: "user-aurelia",
      displayName: "Aurelia Quispe",
      handle: "aurelia",
      avatarUrl: null,
    },
    {
      id: "user-laila",
      displayName: "Laila Okoye",
      handle: "laila.okoye",
      avatarUrl: null,
    },
    {
      id: "user-ryan",
      displayName: "Ryan Mateo",
      handle: "ryan",
      avatarUrl: null,
    },
  ],
  unreadCount: 2,
};
