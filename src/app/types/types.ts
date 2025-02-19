export interface Image {
    url: string;
    caption: string;
    dateUploaded: string;
    uploadedBy: string;
}

export interface Document {
    url: string;
    title: string;
    type: 'research_paper' | 'article' | 'report' | 'other';
    dateUploaded: string;
    uploadedBy: string;
}

export interface Resource {
    id: string;
    url: string;
    title: string;
    description?: string;
    type: 'article' | 'video' | 'image' | 'other';
    thumbnail?: string;
    dateAdded: string;
    addedBy: string;
}

export interface SiteType {
  id: string;  // Database ID
  code: string; // Unique identifier like 'pyramid', 'step-pyramid', etc.
  name: string;
  color: string;
  hoverColor: string;
  icon?: string;
}

export const SITE_TYPES: Record<string, SiteType> = {
    'pyramid': {
      id: '1',
      code: 'pyramid',
      name: 'Pyramid',
      color: '#eab308',
      hoverColor: '#ca8a04',
    },
    'step-pyramid': {
      id: '2',
      code: 'step-pyramid',
      name: 'Step Pyramid',
      color: '#f97316',
      hoverColor: '#ea580c',
    },
    'megalithic-wall': {
      id: '3',
      code: 'megalithic-wall',
      name: 'Megalithic Wall',
      color: '#94a3b8',
      hoverColor: '#64748b',
    },
    'underwater': {
      id: '4',
      code: 'underwater',
      name: 'Underwater Site',
      color: '#3b82f6',
      hoverColor: '#2563eb',
    },
    'megalithic-monument': {
      id: '5',
      code: 'megalithic-monument',
      name: 'Megalithic Monument',
      color: '#22c55e',
      hoverColor: '#16a34a',
    },
    'temple': {
      id: '6',
      code: 'temple',
      name: 'Temple',
      color: '#a855f7',
      hoverColor: '#9333ea',
    },
    'cave': {
      id: '7',
      code: 'cave',
      name: 'Cave',
      color: '#ef4444',
      hoverColor: '#dc2626',
    }
  } as const;

export interface SiteGroup {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number]; // Center point of the group
  sites: string[]; // Array of site IDs
  dateAdded: string;
  lastUpdated: string;
  addedBy: string;
  tags: string[];
  civilization?: string;
}

export interface Site {
    id: string;
    name: string;
    coordinates: [number, number];
    description: string;
    periodStart?: string;
    periodEnd?: string;
    civilization?: string;
    type: SiteType;
    discoveryDate?: string;
    discoveredBy?: string;
    images: Image[];
    documents: Document[];
    resources: Resource[];
    status: 'verified' | 'unverified' | 'under_review';
    dateAdded: string;
    lastUpdated: string;
    addedBy: string;
    tags: string[];
    groupId?: string; // Optional reference to a SiteGroup
}