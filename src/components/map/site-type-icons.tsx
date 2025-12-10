/**
 * Custom SVG icons for archaeological site types
 * Style: Minimalist line art with consistent stroke width
 * Colors are applied via CSS currentColor
 */

import { cn } from "@/shared/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Pyramid - stepped/triangular structure
export const PyramidIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M12 3L2 21h20L12 3z" />
    <path d="M12 3v18" opacity="0.5" />
    <path d="M7 12h10" opacity="0.5" />
  </svg>
);

// Temple - columned structure
export const TempleIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M3 21h18" />
    <path d="M5 21V10" />
    <path d="M19 21V10" />
    <path d="M9 21V10" />
    <path d="M15 21V10" />
    <path d="M3 10l9-7 9 7" />
    <rect x="3" y="8" width="18" height="2" fill="currentColor" opacity="0.3" />
  </svg>
);

// Stone Circle - ring of standing stones
export const StoneCircleIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <circle cx="12" cy="12" r="8" opacity="0.3" strokeDasharray="2 2" />
    {/* Standing stones around the circle */}
    <rect x="11" y="2" width="2" height="4" rx="0.5" fill="currentColor" />
    <rect x="11" y="18" width="2" height="4" rx="0.5" fill="currentColor" />
    <rect x="2" y="11" width="4" height="2" rx="0.5" fill="currentColor" />
    <rect x="18" y="11" width="4" height="2" rx="0.5" fill="currentColor" />
    <rect x="4.5" y="4.5" width="2" height="3" rx="0.5" fill="currentColor" transform="rotate(-45 5.5 6)" />
    <rect x="17" y="4.5" width="2" height="3" rx="0.5" fill="currentColor" transform="rotate(45 18 6)" />
    <rect x="4.5" y="16.5" width="2" height="3" rx="0.5" fill="currentColor" transform="rotate(45 5.5 18)" />
    <rect x="17" y="16.5" width="2" height="3" rx="0.5" fill="currentColor" transform="rotate(-45 18 18)" />
  </svg>
);

// Mound / Tumulus - burial mound
export const MoundIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M2 20c0-8 4-12 10-12s10 4 10 12" />
    <path d="M2 20h20" />
    <ellipse cx="12" cy="20" rx="10" ry="2" opacity="0.3" />
  </svg>
);

// Wall / Fortification
export const WallIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M2 20V8h4v12" />
    <path d="M6 20V6h4v14" />
    <path d="M10 20V4h4v16" />
    <path d="M14 20V6h4v14" />
    <path d="M18 20V8h4v12" />
    <path d="M2 20h20" />
    {/* Battlements */}
    <rect x="3" y="5" width="2" height="3" fill="currentColor" opacity="0.5" />
    <rect x="7" y="3" width="2" height="3" fill="currentColor" opacity="0.5" />
    <rect x="11" y="1" width="2" height="3" fill="currentColor" opacity="0.5" />
    <rect x="15" y="3" width="2" height="3" fill="currentColor" opacity="0.5" />
    <rect x="19" y="5" width="2" height="3" fill="currentColor" opacity="0.5" />
  </svg>
);

// Megalith - Standing stone / Dolmen
export const MegalithIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Dolmen structure - two uprights with capstone */}
    <path d="M4 21V9" />
    <path d="M20 21V9" />
    <path d="M2 9h20" strokeWidth="2" />
    <rect x="3" y="9" width="3" height="12" fill="currentColor" opacity="0.2" />
    <rect x="18" y="9" width="3" height="12" fill="currentColor" opacity="0.2" />
    <path d="M2 21h20" />
  </svg>
);

// Ruins - broken columns
export const RuinsIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M3 21h18" />
    <path d="M5 21V14l1-2V9" />
    <path d="M9 21V11" />
    <path d="M13 21V8l-1-3" />
    <path d="M17 21V12l1-1V8" />
    <path d="M19 21V15" />
    {/* Fallen blocks */}
    <rect x="7" y="18" width="3" height="2" rx="0.3" fill="currentColor" opacity="0.4" transform="rotate(-15 8.5 19)" />
    <rect x="14" y="17" width="2" height="1.5" rx="0.3" fill="currentColor" opacity="0.4" transform="rotate(10 15 17.75)" />
  </svg>
);

// Cave
export const CaveIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <path d="M2 20C2 12 6 4 12 4s10 8 10 16" />
    <path d="M6 20c0-4 2-8 6-8s6 4 6 8" fill="currentColor" opacity="0.2" />
    <path d="M2 20h20" />
  </svg>
);

// Observatory - astronomical site
export const ObservatoryIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Horizon line */}
    <path d="M2 18h20" />
    {/* Standing stone/marker */}
    <rect x="10" y="10" width="4" height="8" rx="0.5" />
    {/* Sun/star rays */}
    <circle cx="12" cy="5" r="2" />
    <path d="M12 1v1" />
    <path d="M8 5h-1" />
    <path d="M17 5h-1" />
    <path d="M9.5 2.5l-.7.7" />
    <path d="M15.2 2.5l.7.7" />
    {/* Alignment lines */}
    <path d="M4 18l8-8" opacity="0.4" strokeDasharray="2 2" />
    <path d="M20 18l-8-8" opacity="0.4" strokeDasharray="2 2" />
  </svg>
);

// Underwater site
export const UnderwaterIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Water surface */}
    <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    {/* Submerged structure */}
    <path d="M8 14l4-4 4 4" />
    <path d="M8 14v6" />
    <path d="M16 14v6" />
    <path d="M6 20h12" />
    {/* Bubbles */}
    <circle cx="5" cy="12" r="1" fill="currentColor" opacity="0.4" />
    <circle cx="19" cy="14" r="0.7" fill="currentColor" opacity="0.4" />
    <circle cx="18" cy="11" r="0.5" fill="currentColor" opacity="0.4" />
  </svg>
);

// Henge - earthwork monument
export const HengeIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Outer bank */}
    <ellipse cx="12" cy="14" rx="10" ry="5" />
    {/* Inner ditch */}
    <ellipse cx="12" cy="14" rx="7" ry="3.5" opacity="0.5" strokeDasharray="3 2" />
    {/* Standing stones in center */}
    <rect x="10" y="11" width="1.5" height="4" rx="0.3" fill="currentColor" />
    <rect x="12.5" y="11" width="1.5" height="4" rx="0.3" fill="currentColor" />
    {/* Entrance causeway */}
    <path d="M12 19v2" />
    <path d="M12 9v-2" />
  </svg>
);

// Artifact location - pottery, tools, etc.
export const ArtifactIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Pottery vessel */}
    <path d="M7 8c0-2 2-4 5-4s5 2 5 4" />
    <path d="M7 8c-1 0-2 1-2 3 0 4 2 8 7 9 5-1 7-5 7-9 0-2-1-3-2-3" />
    <ellipse cx="12" cy="8" rx="5" ry="1.5" />
    {/* Decorative pattern */}
    <path d="M8 12h8" opacity="0.5" />
    <path d="M9 15h6" opacity="0.5" />
  </svg>
);

// Geoglyph - Nazca lines style
export const GeoglyphIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    {/* Stylized bird/figure */}
    <path d="M4 16l4-4 2 2 4-6 2 2 4-4" />
    <circle cx="18" cy="6" r="2" />
    <path d="M2 20h20" opacity="0.3" />
    {/* Lines radiating */}
    <path d="M4 20l4-4" opacity="0.5" />
    <path d="M10 20l4-6" opacity="0.5" />
    <path d="M16 20l2-6" opacity="0.5" />
  </svg>
);

// Generic archaeological site
export const GenericSiteIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("site-type-icon", className)}
  >
    <circle cx="12" cy="10" r="6" />
    <path d="M12 16v5" />
    <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

// Map of site type keywords to icons
export const siteTypeIcons: Record<string, React.FC<IconProps>> = {
  // Pyramids
  pyramid: PyramidIcon,
  pyramids: PyramidIcon,
  ziggurat: PyramidIcon,
  step_pyramid: PyramidIcon,
  
  // Temples
  temple: TempleIcon,
  temples: TempleIcon,
  shrine: TempleIcon,
  sanctuary: TempleIcon,
  
  // Stone circles & henges
  stone_circle: StoneCircleIcon,
  "stone circle": StoneCircleIcon,
  circle: StoneCircleIcon,
  henge: HengeIcon,
  timber_circle: StoneCircleIcon,
  
  // Mounds
  mound: MoundIcon,
  tumulus: MoundIcon,
  barrow: MoundIcon,
  burial_mound: MoundIcon,
  "burial mound": MoundIcon,
  earthwork: MoundIcon,
  effigy_mound: MoundIcon,
  
  // Walls & fortifications
  wall: WallIcon,
  walls: WallIcon,
  fortification: WallIcon,
  fortress: WallIcon,
  hillfort: WallIcon,
  
  // Megaliths
  megalith: MegalithIcon,
  dolmen: MegalithIcon,
  menhir: MegalithIcon,
  standing_stone: MegalithIcon,
  "standing stone": MegalithIcon,
  passage_tomb: MegalithIcon,
  "passage tomb": MegalithIcon,
  
  // Ruins
  ruins: RuinsIcon,
  ruin: RuinsIcon,
  city: RuinsIcon,
  settlement: RuinsIcon,
  
  // Caves
  cave: CaveIcon,
  caves: CaveIcon,
  rock_shelter: CaveIcon,
  
  // Observatories
  observatory: ObservatoryIcon,
  astronomical: ObservatoryIcon,
  alignment: ObservatoryIcon,
  
  // Underwater
  underwater: UnderwaterIcon,
  submerged: UnderwaterIcon,
  
  // Geoglyphs
  geoglyph: GeoglyphIcon,
  nazca: GeoglyphIcon,
  ground_drawing: GeoglyphIcon,
  
  // Artifacts
  artifact: ArtifactIcon,
  artifacts: ArtifactIcon,
  
  // Default
  default: GenericSiteIcon,
};

// Helper function to get icon for a site type
export const getSiteTypeIcon = (siteType: string): React.FC<IconProps> => {
  const normalizedType = siteType.toLowerCase().replace(/[- ]/g, "_");
  
  // Try exact match first
  if (siteTypeIcons[normalizedType]) {
    return siteTypeIcons[normalizedType];
  }
  
  // Try to find partial match
  for (const [key, icon] of Object.entries(siteTypeIcons)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return icon;
    }
  }
  
  return siteTypeIcons.default;
};

// Get icon as SVG string for Leaflet markers
export const getSiteTypeIconSvg = (siteType: string, color: string = "currentColor", size: number = 16): string => {
  const normalizedType = siteType.toLowerCase().replace(/[- ]/g, "_");
  
  const iconSvgs: Record<string, string> = {
    pyramid: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M12 3L2 21h20L12 3z"/></svg>`,
    temple: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M3 10l9-7 9 7"/></svg>`,
    stone_circle: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="8" stroke-dasharray="2 2" opacity="0.5"/><rect x="11" y="3" width="2" height="3" fill="${color}"/><rect x="11" y="18" width="2" height="3" fill="${color}"/><rect x="3" y="11" width="3" height="2" fill="${color}"/><rect x="18" y="11" width="3" height="2" fill="${color}"/></svg>`,
    mound: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M2 20c0-8 4-12 10-12s10 4 10 12"/><path d="M2 20h20"/></svg>`,
    wall: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M2 20V8h4v12M6 20V6h4v14M10 20V4h4v16M14 20V6h4v14M18 20V8h4v12M2 20h20"/></svg>`,
    megalith: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M4 21V9M20 21V9M2 9h20"/><path d="M2 21h20"/></svg>`,
    ruins: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M3 21h18M5 21V14l1-2V9M9 21V11M13 21V8l-1-3M17 21V12l1-1V8M19 21V15"/></svg>`,
    cave: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M2 20C2 12 6 4 12 4s10 8 10 16"/><path d="M2 20h20"/></svg>`,
    observatory: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M2 18h20"/><rect x="10" y="10" width="4" height="8"/><circle cx="12" cy="5" r="2"/></svg>`,
    underwater: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M8 14l4-4 4 4M8 14v6M16 14v6M6 20h12"/></svg>`,
    default: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="10" r="6"/><path d="M12 16v5"/></svg>`,
  };
  
  // Try exact match
  if (iconSvgs[normalizedType]) {
    return iconSvgs[normalizedType];
  }
  
  // Try partial match
  for (const [key, svg] of Object.entries(iconSvgs)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return svg;
    }
  }
  
  return iconSvgs.default;
};




