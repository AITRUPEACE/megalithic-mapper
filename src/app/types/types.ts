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
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
    },
    'step-pyramid': {
      id: '2',
      code: 'step-pyramid',
      name: 'Step Pyramid',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
    'megalithic-wall': {
      id: '3',
      code: 'megalithic-wall',
      name: 'Megalithic Wall',
      color: 'bg-slate-400',
      hoverColor: 'hover:bg-slate-500',
    },
    'underwater': {
      id: '4',
      code: 'underwater',
      name: 'Underwater Site',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    'megalithic-monument': {
      id: '5',
      code: 'megalithic-monument',
      name: 'Megalithic Monument',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    'temple': {
      id: '6',
      code: 'temple',
      name: 'Temple',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    'cave': {
      id: '7',
      code: 'cave',
      name: 'Cave',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
    }
  } as const;

export interface Site {
    id: string;
    name: string;
    coordinates: [number, number];
    description: string;
    periodStart?: string;
    periodEnd?: string;
    civilization?: string;
    type: SiteType;  // Changed from string to SiteType
    discoveryDate?: string;
    discoveredBy?: string;
    images: Image[];
    documents: Document[];
    status: 'verified' | 'unverified' | 'under_review';
    dateAdded: string;
    lastUpdated: string;
    addedBy: string;
    tags: string[];
}