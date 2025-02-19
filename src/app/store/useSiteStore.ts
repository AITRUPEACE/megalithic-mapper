import { create } from 'zustand';
import { Site, SiteGroup, SITE_TYPES, Image, Document, Resource } from '../types/types';
import { findSiteClusters } from '../utils/clustering';

// Initial sites array with all the archaeological sites
export const INITIAL_SITES: Site[] = [
  // Giza Group Sites
  {
    id: "1",
    name: "Great Pyramid of Giza",
    coordinates: [31.134358, 29.979175],
    description: "The oldest and largest of the three pyramids in the Giza pyramid complex.",
    type: SITE_TYPES.pyramid,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "pyramid", "giza"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  },
  {
    id: "E2",
    name: "Pyramid of Khafre",
    coordinates: [29.9760, 31.1304],
    description: "The second-largest pyramid at Giza, built for Pharaoh Khafre.",
    type: SITE_TYPES.pyramid,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "giza", "pyramid", "khafre"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  },
  {
    id: "E3",
    name: "Pyramid of Menkaure",
    coordinates: [29.9729, 31.1281],
    description: "The smallest of the three major pyramids at Giza, built for Pharaoh Menkaure.",
    type: SITE_TYPES.pyramid,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "giza", "pyramid", "menkaure"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  },
  {
    id: "E4",
    name: "Great Sphinx of Giza",
    coordinates: [31.1376,29.9753],
    description: "A colossal limestone statue with a lion's body and a pharaoh's head, guarding the Giza plateau.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "giza", "sphinx"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  },

  // Cusco Group Sites
  {
    id: "3",
    name: "Sacsayhuamán",
    coordinates: [-71.9670, -13.5187],
    description: "An ancient Incan fortress with massive, precisely cut stone walls overlooking Cusco, Peru.",
    type: SITE_TYPES['megalithic-wall'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["peru", "inca", "fortress", "megalith"],
    civilization: "Inca",
    groupId: "cusco-group"
  },
  {
    id: "15",
    name: "Machu Picchu",
    coordinates: [-72.5450, -13.1631],
    description: "An iconic Incan citadel set high in the Andes of Peru, renowned for its stunning architecture and breathtaking views.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["peru", "machu picchu", "inca", "archaeology"],
    civilization: "Inca",
    groupId: "cusco-group"
  },

  // Lake Van Group Sites
  {
    id: "A1",
    name: "Ayanis Kalesi",
    coordinates: [43.21111, 38.70833],
    description: "An Urartian fortress and settlement near Van that features a 'tower temple' dedicated to the god Haldi.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["urartu", "temple", "fortress", "van", "ayanis kalesi"],
    civilization: "Urartu",
    groupId: "lake-van-group"
  },
  {
    id: "A2",
    name: "Akdamar Church",
    coordinates: [38.5329, 43.2731],
    description: "A medieval Armenian church on Akdamar Island in Lake Van, renowned for its ornate exterior carvings and religious significance.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["armenian", "church", "akdamar", "lake van"],
    civilization: "Armenian",
    groupId: "lake-van-group"
  },
  {
    id: "A3",
    name: "Ktuts Monastery",
    coordinates: [38.7100, 43.2150],
    description: "A ruined 15th‑century Armenian monastery on Ktuts Island in Lake Van, once known for its scriptorium and religious role.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["armenian", "monastery", "lake van", "ktuts"],
    civilization: "Armenian",
    groupId: "lake-van-group"
  },
  {
    id: "A4",
    name: "St. Thomas Monastery, Van",
    coordinates: [38.4500, 43.4500],
    description: "A ruined Armenian monastery overlooking Lake Van, historically a center of Christian worship in the region.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["armenian", "monastery", "van", "st. thomas"],
    civilization: "Armenian",
    groupId: "lake-van-group"
  },
  {
    id: "A5",
    name: "Narekavank",
    coordinates: [38.4000, 43.2000],
    description: "A prominent 10th‑century Armenian monastery near Lake Van, once a major center of learning and spirituality.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["armenian", "monastery", "narekavank", "van"],
    civilization: "Armenian",
    groupId: "lake-van-group"
  },
  {
    id: "A6",
    name: "Bagavan",
    coordinates: [38.6500, 43.1500],
    description: "An ancient Armenian temple complex known as 'Bagavan' ('town of the gods'), historically important for pre‑Christian worship.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["armenian", "temple", "bagavan", "van"],
    civilization: "Ancient Armenian",
    groupId: "lake-van-group"
  },

  // Ungrouped Sites
  {
    id: "2",
    name: "Pyramid of the Sun",
    coordinates: [-98.844722, 19.692500],
    description: "The largest building in Teotihuacan and one of the largest pyramids in Mesoamerica.",
    type: SITE_TYPES['step-pyramid'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["mexico", "teotihuacan", "step pyramid"],
    civilization: "Teotihuacan"
  },
  {
    id: "4",
    name: "Yonaguni Monument",
    coordinates: [123.01, 24.435],
    description: "A submerged rock formation off the coast of Yonaguni Island, Japan.",
    type: SITE_TYPES.underwater,
    status: "unverified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["japan", "underwater", "yonaguni"],
    civilization: "Unknown"
  },
  {
    id: "5",
    name: "Stonehenge",
    coordinates: [-1.8262, 51.1789],
    description: "A prehistoric monument of standing stones in Wiltshire, England.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["england", "stone circle", "megalith"],
    civilization: "Ancient Britons",
    groupId: "giza-group"
  },
  {
    id: "6",
    name: "Carnac Stones",
    coordinates: [-3.0829, 47.6422],
    description: "An extensive collection of megalithic standing stones in Brittany, France.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["france", "carnac", "megalith", "standing stones"],
    civilization: "Ancient European",
    groupId: "giza-group"
  },
  {
    id: "7",
    name: "Göbekli Tepe",
    coordinates: [38.92167, 37.22361],
    description: "A Pre-Pottery Neolithic temple complex in Turkey, one of the world's oldest known megalithic sites.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["turkey", "neolithic", "temple", "megalith"],
    civilization: "Pre-Pottery Neolithic",
    groupId: "lake-van-group"
  },
  {
    id: "8",
    name: "Callanish Stones",
    coordinates: [-6.4167, 58.2100],
    description: "A stone circle on the Isle of Lewis, Scotland, notable for its astronomical alignment and mysterious origins.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["scotland", "stone circle", "megalith", "Callanish"],
    civilization: "Ancient Celtic",
    groupId: "giza-group"
  },
  {
    id: "9",
    name: "Hagar Qim",
    coordinates: [14.4244, 36.0791],
    description: "A prehistoric temple complex in Malta with striking megalithic architecture.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["malta", "temple", "megalith", "prehistoric"],
    civilization: "Ancient Maltese",
    groupId: "giza-group"
  },
  {
    id: "10",
    name: "Mnajdra Temples",
    coordinates: [14.4130, 36.0600],
    description: "Neolithic temples in Malta, among the oldest free-standing structures in the world.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["malta", "temples", "megalith", "Neolithic"],
    civilization: "Ancient Maltese",
    groupId: "giza-group"
  },
  {
    id: "11",
    name: "Rano Raraku",
    coordinates: [-109.3664, -27.1212],
    description: "A volcanic crater on Easter Island used as the quarry for the iconic Moai statues.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["easter island", "moai", "quarry", "polynesia"],
    civilization: "Rapa Nui",
    groupId: "giza-group"
  },
  {
    id: "12",
    name: "Nabta Playa",
    coordinates: [30.75, 22.75],
    description: "An archaeological site in Egypt's Nubian Desert featuring early megalithic stone structures and astronomical observatories.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "megalithic", "archaeological", "desert"],
    civilization: "Ancient African",
    groupId: "giza-group"
  },
  {
    id: "13",
    name: "Ggantija Temples",
    coordinates: [14.308, 36.024],
    description: "Neolithic temples on the island of Gozo, Malta, among the oldest free-standing structures in existence.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["malta", "temples", "megalithic", "Neolithic"],
    civilization: "Ancient Maltese",
    groupId: "giza-group"
  },
  {
    id: "14",
    name: "Puma Punku",
    coordinates: [-68.67993, -16.56169],
    description: "An ancient megalithic site near Tiwanaku in Bolivia, famed for its precisely cut stone blocks and engineering mystery.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["bolivia", "puma punku", "megalith", "tiwanaku"],
    civilization: "Pre-Columbian",
    groupId: "giza-group"
  },
  {
    id: "16",
    name: "Çatalhöyük",
    coordinates: [32.8333, 37.6667],
    description: "One of the largest and best-preserved Neolithic settlements in Turkey, celebrated for its densely packed houses and vivid wall paintings.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["turkey", "çatalhöyük", "neolithic", "settlement"],
    civilization: "Neolithic Anatolian",
    groupId: "giza-group"
  },
  {
    id: "17",
    name: "Karahan Tepe",
    coordinates: [38.8, 37.0],
    description: "An archaeological site near Göbekli Tepe in Turkey, featuring T-shaped megaliths, animal sculptures, and ritual architecture.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["turkey", "karahan tepe", "megalith", "neolithic"],
    civilization: "Neolithic Anatolian",
    groupId: "lake-van-group"
  },
  {
    id: "18",
    name: "Brihadeeswarar Temple",
    coordinates: [79.1378, 10.7870],
    description: "A monumental 11th-century Hindu temple in Thanjavur, India, renowned for its massive stone construction and exquisite carvings.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "hindu", "temple", "chola"],
    civilization: "Chola",
    groupId: "giza-group"
  },
  {
    id: "19",
    name: "Mogao Caves",
    coordinates: [94.6618, 40.1421],
    description: "A vast complex of Buddhist cave temples near Dunhuang in China, famed for its rich murals and sculptures.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["china", "mogao", "buddhist", "cave"],
    civilization: "Ancient Chinese",
    groupId: "giza-group"
  },
  {
    id: "20",
    name: "Yungang Grottoes",
    coordinates: [113.1164, 40.1089],
    description: "A collection of 252 caves with thousands of Buddha statues carved into the cliffside in Shanxi, China.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["china", "yungang", "grottoes", "buddhist"],
    civilization: "Ancient Chinese",
    groupId: "giza-group"
  },
  {
    id: "21",
    name: "Longmen Grottoes",
    coordinates: [112.4740, 34.6150],
    description: "A UNESCO-listed site near Luoyang, China, featuring thousands of Buddha statues carved into limestone cliffs.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["china", "longmen", "grottoes", "buddhist"],
    civilization: "Ancient Chinese",
    groupId: "giza-group"
  },
  {
    id: "22",
    name: "Barabar Caves",
    coordinates: [84.9000, 25.2000],
    description: "The oldest surviving rock-cut caves in India, renowned for their polished interiors and carved reliefs.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "barabar", "cave", "rock-cut"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "23",
    name: "Ajanta Caves",
    coordinates: [75.7039, 20.5522],
    description: "A group of 30 rock-cut Buddhist cave monuments in Maharashtra, India, famous for their exquisite murals.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "ajanta", "cave", "buddhist"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "24",
    name: "Ellora Caves",
    coordinates: [75.1797, 20.0262],
    description: "A spectacular complex of rock-cut religious monuments in Maharashtra, India, representing Buddhist, Hindu, and Jain traditions.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "ellora", "cave", "rock-cut"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "25",
    name: "Elephanta Caves",
    coordinates: [72.9315, 18.9638],
    description: "A network of sculpted caves on Elephanta Island near Mumbai, India, known for its impressive Hindu rock-cut sculptures.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "elephanta", "cave", "rock-cut"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "26",
    name: "Badami Cave Temples",
    coordinates: [75.6379, 15.9158],
    description: "A group of rock-cut cave temples in Karnataka, India, celebrated for their intricate carvings and historical significance.",
    type: SITE_TYPES.cave,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "badami", "cave", "rock-cut"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "27",
    name: "Mahabalipuram",
    coordinates: [80.1920, 12.6200],
    description: "A historic town in Tamil Nadu, India, renowned for its rock-cut temples and monolithic structures dating back to the Pallava dynasty.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "mahabalipuram", "temple", "rock-cut"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "28",
    name: "Konark Sun Temple",
    coordinates: [86.0945, 19.8876],
    description: "An exquisite 13th-century Hindu temple in Odisha, India, famous for its chariot-like structure and intricate stone carvings.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "konark", "temple", "sun"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "29",
    name: "Terracotta Army",
    coordinates: [109.2732, 34.3853],
    description: "An extraordinary collection of life-sized terracotta sculptures depicting the armies of the first Emperor of China, Qin Shi Huang.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["china", "terracotta", "monument"],
    civilization: "Ancient Chinese",
    groupId: "giza-group"
  },
  {
    id: "30",
    name: "Great Wall of China",
    coordinates: [116.5704, 40.4319],
    description: "An iconic defensive structure built over centuries to protect China from northern invasions.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["china", "wall", "defense"],
    civilization: "Ancient Chinese",
    groupId: "giza-group"
  },
  {
    id: "31",
    name: "Hampi",
    coordinates: [76.4600, 15.3350],
    description: "The ruins of the ancient Vijayanagara Empire in India, noted for its striking stone architecture and sprawling urban layout.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["india", "hampi", "ruins", "vijayanagara"],
    civilization: "Ancient Indian",
    groupId: "giza-group"
  },
  {
    id: "32",
    name: "Borobudur",
    coordinates: [110.2038, 7.6079],
    description: "A magnificent 9th-century Mahayana Buddhist temple in Indonesia, built entirely from stone and renowned for its intricate relief panels.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["indonesia", "borobudur", "buddhist", "temple"],
    civilization: "Ancient Indonesian",
    groupId: "giza-group"
  },
  {
    id: "33",
    name: "Sarmizegetusa Regia",
    coordinates: [22.9742, 45.7578], // [latitude, longitude]
    description: "The ancient Dacian fortified capital and religious center of the Dacian Kingdom, Sarmizegetusa Regia was built on a high plateau in the Orăştie Mountains of Romania. The site features impressive earthworks, sanctuaries, and fortification walls that reflect the complex socio-religious organization of the Dacians.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["romania", "dacian", "fortress", "sarmizegetusa", "archaeology"],
    civilization: "Dacian",
    groupId: "giza-group"
  },
  {
    id: "E5",
    name: "Serapeum of Saqqara",
    coordinates: [31.2166,29.8719],
    description: "An underground necropolis that housed the sacred Apis bulls in ancient Memphis.",
    type: SITE_TYPES.temple,
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "saqqara", "serapeum", "memphis"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  },
  {
    id: "E6",
    name: "Valley of the Kings",
    coordinates: [32.6014,25.7402],
    description: "The burial site for New Kingdom pharaohs and nobles, located on the west bank of the Nile near Luxor.",
    type: SITE_TYPES['megalithic-monument'],
    status: "verified",
    images: [],
    documents: [],
    resources: [],
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    addedBy: "system",
    tags: ["egypt", "luxor", "valley of the kings", "burials"],
    civilization: "Ancient Egyptian",
    groupId: "giza-group"
  }
];

// Generate initial groups using the clustering algorithm
export const INITIAL_SITE_GROUPS: SiteGroup[] = findSiteClusters(INITIAL_SITES, {
    maxDistance: 50, // 50km max distance between sites in a cluster
    minSites: 2, // At least 2 sites to form a cluster
    civilizationWeight: 0.7, // High weight for matching civilizations
    typeWeight: 0.3, // Lower weight for matching types
});

// Update sites with their new group IDs
export const INITIAL_SITES_UPDATED: Site[] = INITIAL_SITES.map(site => {
    // Find if the site belongs to any cluster
    const cluster = INITIAL_SITE_GROUPS.find(group => 
        group.sites.includes(site.id)
    );
    
    if (cluster) {
        return { ...site, groupId: cluster.id };
    }
    
    // If site doesn't belong to any cluster, remove groupId if it exists
    const { groupId, ...siteWithoutGroup } = site;
    return siteWithoutGroup;
});

interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
}

interface SiteStore {
    // State
    sites: Site[];
    siteGroups: SiteGroup[];
    selectedSite: Site | null;
    selectedGroup: SiteGroup | null;
    isAddingNewSite: boolean;
    newSiteCoordinates: [number, number] | null;
    viewState: ViewState;

    // Actions
    setSites: (sites: Site[]) => void;
    setSiteGroups: (groups: SiteGroup[]) => void;
    addSite: (site: Site) => void;
    addSiteGroup: (group: SiteGroup) => void;
    setSelectedSite: (site: Site | null) => void;
    setSelectedGroup: (group: SiteGroup | null) => void;
    setIsAddingNewSite: (isAdding: boolean) => void;
    setNewSiteCoordinates: (coordinates: [number, number] | null) => void;
    setViewState: (viewState: ViewState) => void;
    updateSite: (updatedSite: Site) => void;
    updateSiteGroup: (updatedGroup: SiteGroup) => void;
    addSiteToGroup: (siteId: string, groupId: string) => void;
    removeSiteFromGroup: (siteId: string, groupId: string) => void;
    
    // New media management actions
    addImage: (siteId: string, image: Image) => void;
    removeImage: (siteId: string, imageUrl: string) => void;
    addDocument: (siteId: string, document: Document) => void;
    removeDocument: (siteId: string, documentUrl: string) => void;
    
    // Resource management actions
    addResource: (siteId: string, resource: Resource) => void;
    removeResource: (siteId: string, resourceId: string) => void;
    updateResource: (siteId: string, resourceId: string, updates: Partial<Resource>) => void;
}

export const useSiteStore = create<SiteStore>((set) => ({
    // Initial state
    sites: INITIAL_SITES_UPDATED,
    siteGroups: INITIAL_SITE_GROUPS,
    selectedSite: null,
    selectedGroup: null,
    isAddingNewSite: false,
    newSiteCoordinates: null,
    viewState: {
        longitude: -2,
        latitude: 52,
        zoom: 5,
        bearing: 0,
        pitch: 0,
    },

    // Actions
    setSites: (sites) => set({ sites }),
    setSiteGroups: (siteGroups) => set({ siteGroups }),
    addSite: (site) => set((state) => ({ sites: [...state.sites, site] })),
    addSiteGroup: (group) => set((state) => ({ siteGroups: [...state.siteGroups, group] })),
    setSelectedSite: (site) => set({ selectedSite: site }),
    setSelectedGroup: (group) => set({ selectedGroup: group }),
    setIsAddingNewSite: (isAdding) => set({ isAddingNewSite: isAdding }),
    setNewSiteCoordinates: (coordinates) => set({ newSiteCoordinates: coordinates }),
    setViewState: (viewState) => set({ viewState }),
    updateSite: (updatedSite) => set((state) => ({
        sites: state.sites.map((site) => 
            site.id === updatedSite.id ? updatedSite : site
        ),
    })),
    updateSiteGroup: (updatedGroup) => set((state) => ({
        siteGroups: state.siteGroups.map((group) => 
            group.id === updatedGroup.id ? updatedGroup : group
        ),
    })),
    addSiteToGroup: (siteId, groupId) => set((state) => {
        const updatedGroups = state.siteGroups.map((group) => {
            if (group.id === groupId && !group.sites.includes(siteId)) {
                return {
                    ...group,
                    sites: [...group.sites, siteId],
                    lastUpdated: new Date().toISOString(),
                };
            }
            return group;
        });

        const updatedSites = state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    groupId,
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        });

        return {
            siteGroups: updatedGroups,
            sites: updatedSites,
        };
    }),
    removeSiteFromGroup: (siteId, groupId) => set((state) => {
        const updatedGroups = state.siteGroups.map((group) => {
            if (group.id === groupId) {
                return {
                    ...group,
                    sites: group.sites.filter((id) => id !== siteId),
                    lastUpdated: new Date().toISOString(),
                };
            }
            return group;
        });

        const updatedSites = state.sites.map((site) => {
            if (site.id === siteId && site.groupId === groupId) {
                const { groupId: _, ...siteWithoutGroup } = site;
                return {
                    ...siteWithoutGroup,
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        });

        return {
            siteGroups: updatedGroups,
            sites: updatedSites,
        };
    }),

    // New media management implementations
    addImage: (siteId, image) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    images: [...site.images, image],
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),

    removeImage: (siteId, imageUrl) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    images: site.images.filter((img) => img.url !== imageUrl),
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),

    addDocument: (siteId, document) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    documents: [...site.documents, document],
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),

    removeDocument: (siteId, documentUrl) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    documents: site.documents.filter((doc) => doc.url !== documentUrl),
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),

    // Resource management implementations
    addResource: (siteId: string, resource: Resource) => set((state) => {
        const updatedSites = state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    resources: [...site.resources, resource],
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        });
        
        return { 
            sites: updatedSites,
            selectedSite: state.selectedSite?.id === siteId 
                ? updatedSites.find(s => s.id === siteId) || state.selectedSite 
                : state.selectedSite
        };
    }),

    removeResource: (siteId, resourceId) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    resources: site.resources.filter((res) => res.id !== resourceId),
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),

    updateResource: (siteId, resourceId, updates) => set((state) => ({
        sites: state.sites.map((site) => {
            if (site.id === siteId) {
                return {
                    ...site,
                    resources: site.resources.map((res) => 
                        res.id === resourceId ? { ...res, ...updates } : res
                    ),
                    lastUpdated: new Date().toISOString(),
                };
            }
            return site;
        }),
    })),
})); 