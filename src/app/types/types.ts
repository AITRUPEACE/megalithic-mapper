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

export interface Site {
    id: string;
    name: string;
    coordinates: [number, number];
    description: string;
    periodStart?: string; // Approximate date/period when the site was first established
    periodEnd?: string; // Approximate date/period when the site was abandoned/destroyed
    civilization?: string;
    type: 'settlement' | 'religious' | 'burial' | 'monument' | 'underwater' | 'other';
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