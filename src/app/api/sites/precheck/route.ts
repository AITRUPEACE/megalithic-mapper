import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_SCHEMA } from "@/lib/supabase/config";

interface PreCheckRequest {
  name: string;
  summary: string;
  siteType: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface PreCheckResult {
  pass: boolean;
  score: number; // 0-100
  warnings: string[];
  suggestions: string[];
  duplicateCandidate?: {
    id: string;
    name: string;
    distance: number; // km
  };
}

// Simple spam detection patterns
const SPAM_PATTERNS = [
  /^[A-Z\s]+$/, // All caps
  /(.)\1{4,}/, // Repeated characters (aaaa, !!!!)
  /\b(buy|sell|click|free|winner|prize|casino|bitcoin)\b/i, // Common spam words
  /https?:\/\/.{0,20}\.(ru|cn|tk|ml|ga|cf)/i, // Suspicious TLDs
];

// Valid land bounding boxes (rough continental outlines)
const LAND_BBOXES = [
  { name: "North America", minLat: 15, maxLat: 72, minLng: -170, maxLng: -50 },
  { name: "South America", minLat: -56, maxLat: 15, minLng: -82, maxLng: -34 },
  { name: "Europe", minLat: 35, maxLat: 72, minLng: -25, maxLng: 45 },
  { name: "Africa", minLat: -35, maxLat: 38, minLng: -18, maxLng: 52 },
  { name: "Asia", minLat: 5, maxLat: 77, minLng: 25, maxLng: 180 },
  { name: "Australia", minLat: -45, maxLat: -10, minLng: 110, maxLng: 155 },
  { name: "Middle East", minLat: 12, maxLat: 42, minLng: 25, maxLng: 65 },
  { name: "Indonesia/Pacific", minLat: -12, maxLat: 20, minLng: 95, maxLng: 180 },
  { name: "Japan", minLat: 24, maxLat: 46, minLng: 122, maxLng: 146 },
  { name: "UK/Ireland", minLat: 49, maxLat: 61, minLng: -11, maxLng: 3 },
];

// Haversine distance calculation
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if coordinates are likely on land
function isLikelyOnLand(lat: number, lng: number): boolean {
  return LAND_BBOXES.some(
    (bbox) =>
      lat >= bbox.minLat &&
      lat <= bbox.maxLat &&
      lng >= bbox.minLng &&
      lng <= bbox.maxLng
  );
}

// Check for spam patterns
function detectSpam(text: string): string[] {
  const issues: string[] = [];
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      if (pattern.source.includes("A-Z")) {
        issues.push("Text appears to be all uppercase - please use normal capitalization");
      } else if (pattern.source.includes("(.)\\1")) {
        issues.push("Text contains excessive repeated characters");
      } else if (pattern.source.includes("buy|sell")) {
        issues.push("Text contains potential spam keywords");
      } else if (pattern.source.includes("https?")) {
        issues.push("Text contains suspicious URLs");
      }
    }
  }
  
  return issues;
}

// Fuzzy name matching
function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/temple|pyramid|ruins|ancient|site|the|of/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body: PreCheckRequest = await request.json();
    const { name, summary, siteType, coordinates } = body;

    const result: PreCheckResult = {
      pass: true,
      score: 100,
      warnings: [],
      suggestions: [],
    };

    // 1. Basic validation
    if (!name || name.length < 3) {
      result.warnings.push("Site name is too short (minimum 3 characters)");
      result.score -= 30;
    }

    if (!summary || summary.length < 20) {
      result.warnings.push("Summary is too short - please provide more detail");
      result.score -= 20;
    }

    if (!siteType) {
      result.warnings.push("Site type is required");
      result.score -= 15;
    }

    // 2. Spam detection
    const nameSpam = detectSpam(name);
    const summarySpam = detectSpam(summary);
    
    if (nameSpam.length > 0 || summarySpam.length > 0) {
      result.warnings.push(...nameSpam, ...summarySpam);
      result.score -= 40;
    }

    // 3. Coordinate validation
    if (!coordinates || typeof coordinates.lat !== "number" || typeof coordinates.lng !== "number") {
      result.warnings.push("Invalid coordinates provided");
      result.score -= 50;
    } else {
      // Check if coordinates are within valid ranges
      if (coordinates.lat < -90 || coordinates.lat > 90) {
        result.warnings.push("Latitude must be between -90 and 90");
        result.score -= 30;
      }
      if (coordinates.lng < -180 || coordinates.lng > 180) {
        result.warnings.push("Longitude must be between -180 and 180");
        result.score -= 30;
      }

      // Check if likely on land
      if (!isLikelyOnLand(coordinates.lat, coordinates.lng)) {
        result.warnings.push("Coordinates appear to be in the ocean - please verify location");
        result.score -= 15;
      }
    }

    // 4. Check for duplicates (only if we have valid data)
    if (name && coordinates?.lat && coordinates?.lng && result.score > 30) {
      try {
        const supabase = await createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapSchema = (supabase as any).schema(SUPABASE_SCHEMA);

        // Search for sites within 50km with similar names
        const { data: nearbySites } = await mapSchema
          .from("sites")
          .select("id, name, coordinates")
          .gte("coordinates_lat", coordinates.lat - 0.5)
          .lte("coordinates_lat", coordinates.lat + 0.5)
          .gte("coordinates_lng", coordinates.lng - 0.5)
          .lte("coordinates_lng", coordinates.lng + 0.5)
          .limit(20);

        if (nearbySites && nearbySites.length > 0) {
          const normalizedInput = normalizeForComparison(name);
          
          for (const site of nearbySites) {
            const distance = haversineDistance(
              coordinates.lat,
              coordinates.lng,
              site.coordinates.lat,
              site.coordinates.lng
            );

            // Check if within 5km and name is similar
            if (distance < 5) {
              const normalizedExisting = normalizeForComparison(site.name);
              
              // Simple similarity check - if normalized names share >50% characters
              const similarity = normalizedInput.length > 0 && normalizedExisting.length > 0
                ? [...normalizedInput].filter(c => normalizedExisting.includes(c)).length / 
                  Math.max(normalizedInput.length, normalizedExisting.length)
                : 0;

              if (similarity > 0.5 || distance < 0.5) {
                result.duplicateCandidate = {
                  id: site.id,
                  name: site.name,
                  distance: Math.round(distance * 10) / 10,
                };
                result.warnings.push(
                  `Possible duplicate: "${site.name}" is ${result.duplicateCandidate.distance}km away`
                );
                result.score -= 25;
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        // Don't fail the pre-check if duplicate detection fails
      }
    }

    // 5. Suggestions for improvement
    if (summary && summary.length < 100) {
      result.suggestions.push("Consider adding more detail to the summary for better discoverability");
    }

    if (!summary.toLowerCase().includes("located") && !summary.toLowerCase().includes("found")) {
      result.suggestions.push("Consider mentioning the location context in the summary");
    }

    if (name.length > 50) {
      result.suggestions.push("Site name is quite long - consider a shorter, more memorable name");
    }

    // Calculate final pass/fail
    result.score = Math.max(0, Math.min(100, result.score));
    result.pass = result.score >= 40 && result.warnings.filter(w => !w.includes("Possible duplicate")).length < 3;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/sites/precheck:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
