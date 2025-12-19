/**
 * Custom SVG icons for archaeological site types
 * Style: Bold filled shapes, optimized for small sizes on maps
 * Designed to be recognizable at 24-36px
 */

import { cn } from "@/shared/lib/utils";

interface IconProps {
	className?: string;
	size?: number;
	color?: string;
}

// =============================================================================
// REACT COMPONENTS - For use in UI components
// =============================================================================

// Pyramid - Classic stepped pyramid silhouette
export const PyramidIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		<path d="M12 2L2 20h20L12 2z" />
	</svg>
);

// Temple - Greek/Roman columned structure with pediment
export const TempleIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		<path d="M12 2L3 8h18L12 2z" />
		<rect x="3" y="8" width="18" height="2" />
		<rect x="5" y="10" width="2" height="10" />
		<rect x="9" y="10" width="2" height="10" />
		<rect x="13" y="10" width="2" height="10" />
		<rect x="17" y="10" width="2" height="10" />
		<rect x="3" y="20" width="18" height="2" />
	</svg>
);

// Stone Circle - Ring of standing stones (Stonehenge-inspired)
export const StoneCircleIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Stones arranged in a circle */}
		<rect x="10" y="2" width="4" height="6" rx="1" />
		<rect x="10" y="16" width="4" height="6" rx="1" />
		<rect x="2" y="10" width="6" height="4" rx="1" />
		<rect x="16" y="10" width="6" height="4" rx="1" />
		{/* Diagonal stones */}
		<rect x="3.5" y="3.5" width="4" height="5" rx="1" transform="rotate(-45 5.5 6)" />
		<rect x="16.5" y="3.5" width="4" height="5" rx="1" transform="rotate(45 18.5 6)" />
		<rect x="3.5" y="15.5" width="4" height="5" rx="1" transform="rotate(45 5.5 18)" />
		<rect x="16.5" y="15.5" width="4" height="5" rx="1" transform="rotate(-45 18.5 18)" />
	</svg>
);

// Megalith / Dolmen - Portal dolmen with capstone
export const MegalithIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Capstone */}
		<path d="M1 6h22l-2 4H3L1 6z" />
		{/* Left upright */}
		<rect x="3" y="10" width="5" height="12" rx="1" />
		{/* Right upright */}
		<rect x="16" y="10" width="5" height="12" rx="1" />
	</svg>
);

// Mound / Tumulus - Burial mound shape
export const MoundIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		<path d="M2 22C2 22 4 8 12 8s10 14 10 14H2z" />
	</svg>
);

// Tomb - Passage tomb / burial chamber entrance
export const TombIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Mound with entrance */}
		<path d="M2 22C2 14 6 6 12 6s10 8 10 16H2z" />
		{/* Dark entrance - cut out */}
		<path d="M9 22v-8a3 3 0 016 0v8H9z" fill="rgba(0,0,0,0.4)" />
	</svg>
);

// Fortress / Wall - Crenellated fortification
export const WallIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Main wall with battlements */}
		<path d="M2 22V10h3V6h4V3h6v3h4v4h3v12H2z" />
		{/* Gate cutout */}
		<path d="M9 22v-6h6v6H9z" fill="rgba(0,0,0,0.3)" />
	</svg>
);

// City / Ancient Settlement - Skyline of buildings
export const CityIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		<rect x="2" y="12" width="5" height="10" />
		<rect x="8" y="8" width="4" height="14" />
		<rect x="13" y="4" width="4" height="18" />
		<rect x="18" y="10" width="4" height="12" />
	</svg>
);

// Ruins - Broken columns
export const RuinsIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		<rect x="3" y="8" width="3" height="14" rx="0.5" />
		<rect x="8" y="12" width="3" height="10" rx="0.5" />
		<rect x="13" y="6" width="3" height="16" rx="0.5" />
		<rect x="18" y="10" width="3" height="12" rx="0.5" />
		{/* Fallen stone */}
		<rect x="6" y="18" width="5" height="3" rx="0.5" transform="rotate(-15 8.5 19.5)" />
	</svg>
);

// Cave - Mountain with arch opening
export const CaveIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Mountain shape */}
		<path d="M12 2L2 22h20L12 2z" />
		{/* Cave entrance - darker */}
		<path d="M8 22c0-4 2-7 4-7s4 3 4 7H8z" fill="rgba(0,0,0,0.4)" />
	</svg>
);

// Observatory - Standing stone with celestial alignment
export const ObservatoryIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Sun/star */}
		<circle cx="12" cy="5" r="4" />
		{/* Rays */}
		<rect x="11" y="0" width="2" height="2" />
		<rect x="17" y="4" width="2" height="2" />
		<rect x="5" y="4" width="2" height="2" />
		{/* Standing stone */}
		<rect x="9" y="11" width="6" height="11" rx="1" />
	</svg>
);

// Underwater - Waves with submerged structure
export const UnderwaterIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Waves */}
		<path d="M1 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0 3 3 4 1l1 3c-2 2-4 2-6 0s-4-2-6 0-4 2-6 0-4-2-5 0L1 6z" />
		{/* Submerged pyramid */}
		<path d="M12 11L6 22h12L12 11z" opacity="0.7" />
	</svg>
);

// Geoglyph - Nazca-style ground figure (hummingbird)
export const GeoglyphIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Stylized bird */}
		<circle cx="19" cy="6" r="3" />
		<path d="M16 6L12 10l-8 2 2 3 6-1 4 6 3-2-3-6 4-4-4-2z" />
	</svg>
);

// Statue - Moai-style figure
export const StatueIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Head */}
		<path d="M8 2h8l1 10H7L8 2z" />
		{/* Face features */}
		<rect x="9" y="5" width="2" height="3" fill="rgba(0,0,0,0.2)" />
		<rect x="13" y="5" width="2" height="3" fill="rgba(0,0,0,0.2)" />
		{/* Nose/mouth area */}
		<rect x="11" y="8" width="2" height="3" fill="rgba(0,0,0,0.2)" />
		{/* Body/torso */}
		<path d="M7 12h10l1 10H6l1-10z" />
	</svg>
);

// Generic / Unknown site
export const GenericSiteIcon = ({ className, size = 24 }: IconProps) => (
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={cn("site-type-icon", className)}>
		{/* Map pin shape */}
		<path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
		{/* Question mark */}
		<text x="12" y="12" textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.4)" fontWeight="bold">
			?
		</text>
	</svg>
);

// =============================================================================
// ICON MAPPINGS
// =============================================================================

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

	// Stone circles
	stone_circle: StoneCircleIcon,
	"stone circle": StoneCircleIcon,
	circle: StoneCircleIcon,
	henge: StoneCircleIcon,
	timber_circle: StoneCircleIcon,

	// Megaliths
	megalith: MegalithIcon,
	dolmen: MegalithIcon,
	menhir: MegalithIcon,
	standing_stone: MegalithIcon,
	"standing stone": MegalithIcon,
	passage_tomb: TombIcon,
	"passage tomb": TombIcon,

	// Mounds
	mound: MoundIcon,
	tumulus: MoundIcon,
	barrow: MoundIcon,
	burial_mound: MoundIcon,
	"burial mound": MoundIcon,
	earthwork: MoundIcon,
	effigy_mound: MoundIcon,
	cairn: MoundIcon,

	// Tombs
	tomb: TombIcon,
	burial: TombIcon,
	crypt: TombIcon,
	necropolis: TombIcon,

	// Walls & fortifications
	wall: WallIcon,
	walls: WallIcon,
	fortification: WallIcon,
	fortress: WallIcon,
	hillfort: WallIcon,
	castle: WallIcon,

	// Cities & settlements
	city: CityIcon,
	settlement: CityIcon,
	complex: CityIcon,
	acropolis: CityIcon,

	// Ruins
	ruins: RuinsIcon,
	ruin: RuinsIcon,

	// Caves
	cave: CaveIcon,
	caves: CaveIcon,
	rock_shelter: CaveIcon,
	grotto: CaveIcon,

	// Observatories
	observatory: ObservatoryIcon,
	astronomical: ObservatoryIcon,
	alignment: ObservatoryIcon,
	solar: ObservatoryIcon,

	// Underwater
	underwater: UnderwaterIcon,
	submerged: UnderwaterIcon,
	sunken: UnderwaterIcon,

	// Geoglyphs
	geoglyph: GeoglyphIcon,
	nazca: GeoglyphIcon,
	ground_drawing: GeoglyphIcon,
	effigy: GeoglyphIcon,
	lines: GeoglyphIcon,

	// Statues
	statue: StatueIcon,
	moai: StatueIcon,
	sculpture: StatueIcon,
	colossus: StatueIcon,

	// Default
	default: GenericSiteIcon,
	unknown: GenericSiteIcon,
};

// Helper function to get icon component for a site type
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

// =============================================================================
// SVG STRINGS - For Leaflet markers (can't use React components)
// =============================================================================

// Get icon as raw SVG string for Leaflet markers
export const getSiteTypeIconSvg = (siteType: string, color: string = "currentColor", size: number = 24): string => {
	const normalizedType = siteType.toLowerCase().replace(/[- ]/g, "_");

	// Bold filled icons optimized for map markers
	const iconSvgs: Record<string, string> = {
		// Pyramid - simple bold triangle
		pyramid: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M12 2L2 20h20L12 2z"/>
		</svg>`,

		// Temple - columned structure
		temple: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M12 2L3 8h18L12 2z"/>
			<rect x="3" y="8" width="18" height="2"/>
			<rect x="5" y="10" width="2" height="10"/>
			<rect x="9" y="10" width="2" height="10"/>
			<rect x="13" y="10" width="2" height="10"/>
			<rect x="17" y="10" width="2" height="10"/>
			<rect x="3" y="20" width="18" height="2"/>
		</svg>`,

		// Stone circle - ring of stones
		stone_circle: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<rect x="10" y="2" width="4" height="5" rx="1"/>
			<rect x="10" y="17" width="4" height="5" rx="1"/>
			<rect x="2" y="10" width="5" height="4" rx="1"/>
			<rect x="17" y="10" width="5" height="4" rx="1"/>
			<rect x="4" y="4" width="3" height="4" rx="1" transform="rotate(-45 5.5 6)"/>
			<rect x="17" y="4" width="3" height="4" rx="1" transform="rotate(45 18.5 6)"/>
			<rect x="4" y="16" width="3" height="4" rx="1" transform="rotate(45 5.5 18)"/>
			<rect x="17" y="16" width="3" height="4" rx="1" transform="rotate(-45 18.5 18)"/>
		</svg>`,

		// Megalith - dolmen shape
		megalith: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M1 6h22l-2 4H3L1 6z"/>
			<rect x="3" y="10" width="5" height="12" rx="1"/>
			<rect x="16" y="10" width="5" height="12" rx="1"/>
		</svg>`,

		// Mound - burial mound
		mound: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M2 22C2 22 4 8 12 8s10 14 10 14H2z"/>
		</svg>`,

		// Tomb - mound with entrance
		tomb: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M2 22C2 14 6 6 12 6s10 8 10 16H2z"/>
			<path d="M9 22v-7a3 3 0 016 0v7H9z" fill="rgba(0,0,0,0.35)"/>
		</svg>`,

		// Fortress - crenellated wall
		wall: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M2 22V10h3V6h4V3h6v3h4v4h3v12H2z"/>
			<path d="M9 22v-5h6v5H9z" fill="rgba(0,0,0,0.25)"/>
		</svg>`,

		// City - building skyline
		city: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<rect x="2" y="12" width="5" height="10"/>
			<rect x="8" y="8" width="4" height="14"/>
			<rect x="13" y="4" width="4" height="18"/>
			<rect x="18" y="10" width="4" height="12"/>
		</svg>`,

		// Ruins - broken columns
		ruins: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<rect x="3" y="8" width="3" height="14" rx="0.5"/>
			<rect x="8" y="12" width="3" height="10" rx="0.5"/>
			<rect x="13" y="6" width="3" height="16" rx="0.5"/>
			<rect x="18" y="10" width="3" height="12" rx="0.5"/>
		</svg>`,

		// Cave - mountain with opening
		cave: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M12 2L2 22h20L12 2z"/>
			<path d="M8 22c0-4 2-7 4-7s4 3 4 7H8z" fill="rgba(0,0,0,0.35)"/>
		</svg>`,

		// Observatory - sun and standing stone
		observatory: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<circle cx="12" cy="5" r="4"/>
			<rect x="11" y="0" width="2" height="2"/>
			<rect x="17" y="4" width="2" height="2"/>
			<rect x="5" y="4" width="2" height="2"/>
			<rect x="9" y="11" width="6" height="11" rx="1"/>
		</svg>`,

		// Underwater - waves over structure
		underwater: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M1 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0 3 3 4 1l1 3c-2 2-4 2-6 0s-4-2-6 0-4 2-6 0-4-2-5 0L1 6z"/>
			<path d="M12 11L6 22h12L12 11z" opacity="0.7"/>
		</svg>`,

		// Geoglyph - stylized bird
		geoglyph: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<circle cx="19" cy="6" r="3"/>
			<path d="M16 6L12 10l-8 2 2 3 6-1 4 6 3-2-3-6 4-4-4-2z"/>
		</svg>`,

		// Statue - moai-style figure
		statue: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M8 2h8l1 10H7L8 2z"/>
			<path d="M7 12h10l1 10H6l1-10z"/>
		</svg>`,

		// Default - map pin with ?
		default: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}">
			<path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
		</svg>`,
	};

	// Try exact match
	if (iconSvgs[normalizedType]) {
		return iconSvgs[normalizedType];
	}

	// Try partial match with priority order
	const matchOrder = [
		"pyramid",
		"temple",
		"stone_circle",
		"megalith",
		"tomb",
		"mound",
		"wall",
		"city",
		"ruins",
		"cave",
		"observatory",
		"underwater",
		"geoglyph",
		"statue",
	];

	for (const key of matchOrder) {
		if (normalizedType.includes(key) || key.includes(normalizedType)) {
			return iconSvgs[key];
		}
	}

	// Additional keyword matching
	if (normalizedType.includes("circle") || normalizedType.includes("henge") || normalizedType.includes("ring")) {
		return iconSvgs.stone_circle;
	}
	if (normalizedType.includes("dolmen") || normalizedType.includes("menhir") || normalizedType.includes("standing")) {
		return iconSvgs.megalith;
	}
	if (normalizedType.includes("burial") || normalizedType.includes("passage") || normalizedType.includes("crypt")) {
		return iconSvgs.tomb;
	}
	if (normalizedType.includes("barrow") || normalizedType.includes("tumulus") || normalizedType.includes("cairn")) {
		return iconSvgs.mound;
	}
	if (normalizedType.includes("fort") || normalizedType.includes("castle") || normalizedType.includes("citadel")) {
		return iconSvgs.wall;
	}
	if (normalizedType.includes("settlement") || normalizedType.includes("complex") || normalizedType.includes("acropolis")) {
		return iconSvgs.city;
	}
	if (normalizedType.includes("grotto") || normalizedType.includes("shelter")) {
		return iconSvgs.cave;
	}
	if (normalizedType.includes("astro") || normalizedType.includes("solar") || normalizedType.includes("align")) {
		return iconSvgs.observatory;
	}
	if (normalizedType.includes("submerged") || normalizedType.includes("sunken")) {
		return iconSvgs.underwater;
	}
	if (normalizedType.includes("nazca") || normalizedType.includes("lines") || normalizedType.includes("effigy")) {
		return iconSvgs.geoglyph;
	}
	if (normalizedType.includes("moai") || normalizedType.includes("sculpt") || normalizedType.includes("coloss")) {
		return iconSvgs.statue;
	}

	return iconSvgs.default;
};
