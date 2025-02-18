import { Site, SiteGroup } from "../types/types";

// Haversine distance calculation between two points in kilometers
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

interface ClusterConfig {
    maxDistance: number; // Maximum distance in kilometers between sites in a cluster
    minSites: number; // Minimum number of sites to form a cluster
    civilizationWeight: number; // Weight given to matching civilizations (0-1)
    typeWeight: number; // Weight given to matching site types (0-1)
}

const DEFAULT_CONFIG: ClusterConfig = {
    maxDistance: 50, // 50km max distance between sites in a cluster
    minSites: 2, // At least 2 sites to form a cluster
    civilizationWeight: 0.7, // High weight for matching civilizations
    typeWeight: 0.3, // Lower weight for matching types
};

// Calculate similarity score between two sites (0-1)
function calculateSiteSimilarity(site1: Site, site2: Site, config: ClusterConfig): number {
    // Calculate distance score (1 when close, 0 when far)
    const distance = calculateDistance(
        site1.coordinates[1],
        site1.coordinates[0],
        site2.coordinates[1],
        site2.coordinates[0]
    );
    const distanceScore = Math.max(0, 1 - distance / config.maxDistance);

    // Calculate civilization score
    const civilizationScore = site1.civilization === site2.civilization ? 1 : 0;

    // Calculate type score
    const typeScore = site1.type.id === site2.type.id ? 1 : 0;

    // Combine scores with weights
    const weightedScore = 
        distanceScore * 0.6 + // Distance is most important
        civilizationScore * config.civilizationWeight +
        typeScore * config.typeWeight;

    return weightedScore / (1 + config.civilizationWeight + config.typeWeight);
}

// Find clusters of similar sites
export function findSiteClusters(
    sites: Site[],
    config: ClusterConfig = DEFAULT_CONFIG
): SiteGroup[] {
    const clusters: SiteGroup[] = [];
    const processedSites = new Set<string>();

    // Process each site
    sites.forEach((site) => {
        if (processedSites.has(site.id)) return;

        // Find similar sites
        const similarSites = sites
            .filter((otherSite) => {
                if (otherSite.id === site.id || processedSites.has(otherSite.id)) return false;
                const similarity = calculateSiteSimilarity(site, otherSite, config);
                return similarity > 0.6; // Threshold for similarity
            })
            .map((s) => s.id);

        // If we have enough similar sites, create a cluster
        if (similarSites.length >= config.minSites - 1) {
            const clusterSites = [site.id, ...similarSites];
            const clusterSitesData = sites.filter((s) => clusterSites.includes(s.id));

            // Calculate cluster center (average coordinates)
            const center: [number, number] = clusterSitesData.reduce(
                (acc, s) => [
                    acc[0] + s.coordinates[0] / clusterSitesData.length,
                    acc[1] + s.coordinates[1] / clusterSitesData.length
                ],
                [0, 0]
            );

            // Create cluster name based on most prominent civilization
            const civilizationCounts = new Map<string, number>();
            clusterSitesData.forEach((s) => {
                if (s.civilization) {
                    civilizationCounts.set(
                        s.civilization,
                        (civilizationCounts.get(s.civilization) || 0) + 1
                    );
                }
            });
            const mainCivilization = Array.from(civilizationCounts.entries())
                .sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

            // Create the cluster
            const cluster: SiteGroup = {
                id: `cluster-${clusters.length + 1}`,
                name: `${mainCivilization} Sites Cluster`,
                description: `A group of ${clusterSites.length} related archaeological sites from the ${mainCivilization} civilization.`,
                coordinates: center,
                sites: clusterSites,
                dateAdded: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                addedBy: "system",
                tags: ["auto-clustered", mainCivilization.toLowerCase()],
                civilization: mainCivilization
            };

            clusters.push(cluster);
            clusterSites.forEach((id) => processedSites.add(id));
        }
    });

    return clusters;
} 