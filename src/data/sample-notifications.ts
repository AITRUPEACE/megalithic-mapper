import { ActivityNotification } from "@/lib/types";

export const sampleNotifications: ActivityNotification[] = [
  {
    id: "notif-1",
    type: "mention",
    summary: "Aurelia Quispe mentioned you in the Terrace Resonance log",
    timestamp: "2024-10-11T12:32:00Z",
    unread: true,
    link: { href: "/(app)/research/andes-sonics", label: "View hypothesis" },
  },
  {
    id: "notif-2",
    type: "verification",
    summary: "Your verification request is awaiting additional documentation",
    timestamp: "2024-09-29T09:10:00Z",
    unread: false,
    link: { href: "/(app)/profile", label: "Update profile" },
  },
  {
    id: "notif-3",
    type: "research_update",
    summary: "Andean Sonic Cartography added new spectrogram evidence",
    timestamp: "2024-09-01T17:50:00Z",
    unread: false,
    link: { href: "/(app)/research/andes-sonics", label: "Review" },
  },
  {
    id: "notif-4",
    type: "comment",
    summary: "Laila replied to your Derinkuyu ventilation workflow",
    timestamp: "2024-08-21T07:22:00Z",
    unread: true,
    link: { href: "/(app)/forum", label: "Open discussion" },
  },
];
