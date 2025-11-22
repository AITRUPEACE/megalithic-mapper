import { MapZone } from "@/lib/types";

export const sampleZones: MapZone[] = [
  // Wide Egypt region (visible at low zoom)
  {
    id: "egypt-region",
    name: "Ancient Egypt",
    type: "cultural_region",
    bounds: {
      north: 31.5,
      south: 28.5,
      east: 32.5,
      west: 29.5,
    },
    center: {
      latitude: 30.0,
      longitude: 31.0,
    },
    siteCount: 2,
    civilizations: ["Ancient Egyptian"],
    description: "Ancient Egyptian civilization sites",
    minZoom: 0,
    maxZoom: 8,
  },
  // Giza Plateau (visible at medium-high zoom)
  {
    id: "giza-plateau",
    name: "Giza Plateau",
    type: "archaeological_zone",
    bounds: {
      north: 30.05,
      south: 29.90,
      east: 31.20,
      west: 31.05,
    },
    center: {
      latitude: 29.9785,
      longitude: 31.1350,
    },
    siteCount: 2,
    civilizations: ["Ancient Egyptian"],
    description: "Major pyramid complex containing the Great Pyramid, Sphinx, and associated temples",
    minZoom: 8,
    maxZoom: 12,
    parentZoneId: "egypt-region",
    detailBounds: {
      north: 29.9850,
      south: 29.9720,
      east: 31.1450,
      west: 31.1250,
    },
  },
  // Precise Giza complex (visible at high zoom)
  {
    id: "giza-complex-detail",
    name: "Giza Pyramid Complex",
    type: "archaeological_zone",
    bounds: {
      north: 29.9850,
      south: 29.9720,
      east: 31.1450,
      west: 31.1250,
    },
    center: {
      latitude: 29.9785,
      longitude: 31.1350,
    },
    siteCount: 2,
    civilizations: ["Ancient Egyptian"],
    description: "Precise bounds of the Giza pyramid complex",
    minZoom: 12,
    parentZoneId: "giza-plateau",
  },
  
  // Wide Peru region
  {
    id: "peru-region",
    name: "Ancient Peru",
    type: "cultural_region",
    bounds: {
      north: -12.8,
      south: -13.8,
      east: -71.5,
      west: -73.0,
    },
    center: {
      latitude: -13.3400,
      longitude: -72.2550,
    },
    siteCount: 2,
    civilizations: ["Inca"],
    description: "Inca civilization heartland",
    minZoom: 0,
    maxZoom: 9,
  },
  // Sacred Valley (medium zoom)
  {
    id: "cusco-region",
    name: "Cusco Sacred Valley",
    type: "cultural_region",
    bounds: {
      north: -13.20,
      south: -13.45,
      east: -72.00,
      west: -72.50,
    },
    center: {
      latitude: -13.3400,
      longitude: -72.2550,
    },
    siteCount: 2,
    civilizations: ["Inca"],
    description: "Sacred heartland of the Inca Empire with monumental architecture and astronomical alignments",
    minZoom: 9,
    parentZoneId: "peru-region",
  },
  
  // Wide Anatolia region
  {
    id: "anatolia-region",
    name: "Ancient Anatolia",
    type: "cultural_region",
    bounds: {
      north: 37.5,
      south: 36.9,
      east: 39.3,
      west: 38.5,
    },
    center: {
      latitude: 37.2200,
      longitude: 38.9200,
    },
    siteCount: 1,
    civilizations: ["Anatolian"],
    description: "Neolithic Anatolia region",
    minZoom: 0,
    maxZoom: 10,
  },
  // Göbekli Tepe detail (high zoom)
  {
    id: "anatolia-gobekli",
    name: "Göbekli Tepe Region",
    type: "archaeological_zone",
    bounds: {
      north: 37.2300,
      south: 37.2100,
      east: 38.9300,
      west: 38.9100,
    },
    center: {
      latitude: 37.2200,
      longitude: 38.9200,
    },
    siteCount: 1,
    civilizations: ["Anatolian"],
    description: "Neolithic archaeological site with massive carved pillars predating agriculture",
    minZoom: 10,
    parentZoneId: "anatolia-region",
  },
  
  // Wide Indus Valley
  {
    id: "indus-region",
    name: "Indus Valley Civilization",
    type: "cultural_region",
    bounds: {
      north: 28.0,
      south: 26.5,
      east: 69.0,
      west: 67.0,
    },
    center: {
      latitude: 27.3250,
      longitude: 68.1350,
    },
    siteCount: 1,
    civilizations: ["Indus Valley"],
    description: "Ancient Indus Valley Civilization region",
    minZoom: 0,
    maxZoom: 9,
  },
  // Mohenjo-daro detail (high zoom)
  {
    id: "mohenjo-daro-zone",
    name: "Indus Valley Sites",
    type: "archaeological_zone",
    bounds: {
      north: 27.3400,
      south: 27.3100,
      east: 68.1500,
      west: 68.1200,
    },
    center: {
      latitude: 27.3250,
      longitude: 68.1350,
    },
    siteCount: 1,
    civilizations: ["Indus Valley"],
    description: "Ancient urban centers of the Indus Valley Civilization with advanced planning",
    minZoom: 9,
    parentZoneId: "indus-region",
  },
];

