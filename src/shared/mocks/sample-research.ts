import { ResearchProject } from "@/shared/types/content";

export const sampleResearchProjects: ResearchProject[] = [
  {
    id: "resonant-chambers",
    title: "Resonant Chambers of the Giza Plateau",
    summary:
      "Collaborative study mapping acoustic properties inside pyramid chambers and correlating them with ritual narratives.",
    objectives: [
      "Capture frequency response of major chambers and passageways",
      "Compare sonic signatures with textual references to sound-based rites",
      "Document modern replication experiments by trusted contributors",
    ],
    focusRegions: ["Giza Plateau"],
    eras: ["Old Kingdom"],
    status: "active",
    leadInvestigator: "Dr. Aminah Selim",
    collaboratorCount: 12,
    hypotheses: [
      {
        id: "resonant-h1",
        title: "Helmholtz Resonance in King's Chamber",
        statement:
          "Granite construction supports low-frequency resonance tuned to 110 Hz aligning with surviving chant fragments.",
        status: "under_review",
        confidence: "plausible",
        evidenceCount: 7,
        lastUpdated: "2024-10-01T10:45:00Z",
      },
      {
        id: "resonant-h2",
        title: "Sarcophagus as Acoustic Driver",
        statement:
          "Quartz inclusions in the sarcophagus amplify harmonic overtones recorded during 2023 field session.",
        status: "proposed",
        confidence: "speculative",
        evidenceCount: 3,
        lastUpdated: "2024-09-18T12:15:00Z",
      },
    ],
    linkedEntities: [
      { id: "giza-gp", type: "site", name: "Great Pyramid of Giza", relation: "Primary field site" },
      { id: "giza-sphinx", type: "site", name: "Great Sphinx of Giza", relation: "Iconographic reference" },
      { id: "papyrus-bremner", type: "text", name: "Bremner-Rhind Papyrus", relation: "Chant translation" },
    ],
    activity: [
      {
        id: "resonant-a1",
        description: "Laila curated erosion timeline overlay for the valley temple and linked to Hypothesis H1.",
        timestamp: "2024-10-10T09:22:00Z",
        author: "curator.laila",
      },
      {
        id: "resonant-a2",
        description: "Uploaded 3D chamber scan data set with annotated microphone placements.",
        timestamp: "2024-09-28T18:40:00Z",
        author: "dr.aminah.s",
      },
    ],
  },
  {
    id: "andes-sonics",
    title: "Andean Sonic Cartography",
    summary:
      "Explores how Inca stone architecture manipulates sound for ceremonial signaling across mountain valleys.",
    objectives: [
      "Document echo profiles at key terraces",
      "Correlate sound pathways with astronomical sightlines",
      "Prototype simulation layer for the communal map",
    ],
    focusRegions: ["Sacred Valley", "Cusco", "Vilcabamba"],
    eras: ["Late Horizon"],
    status: "active",
    leadInvestigator: "Prof. Aurelia Quispe",
    collaboratorCount: 9,
    hypotheses: [
      {
        id: "andes-h1",
        title: "Paired Terrace Resonance",
        statement:
          "Opposing terrace walls at Sacsayhuamán create targeted echoes used for call-and-response ceremonies.",
        status: "validated",
        confidence: "supported",
        evidenceCount: 11,
        lastUpdated: "2024-09-05T08:10:00Z",
      },
      {
        id: "andes-h2",
        title: "Intihuatana Solar Chime",
        statement:
          "Seasonal light shafts striking quartz veins at Machu Picchu generate audible vibrations captured in 2024 solstice recording.",
        status: "under_review",
        confidence: "plausible",
        evidenceCount: 5,
        lastUpdated: "2024-07-20T16:20:00Z",
      },
    ],
    linkedEntities: [
      { id: "cusco-sacsayhuaman", type: "site", name: "Sacsayhuamán Terrace Walls", relation: "Primary recording location" },
      { id: "andes-machu", type: "site", name: "Machu Picchu Observatory", relation: "Solar alignment study" },
      { id: "quipu-sonics", type: "artifact", name: "Quipu Resonant Fibers", relation: "Material experiment" },
    ],
    activity: [
      {
        id: "andes-a1",
        description: "Uploaded comparative spectrograms from June and December field campaigns.",
        timestamp: "2024-08-30T11:52:00Z",
        author: "field.aurelia",
      },
      {
        id: "andes-a2",
        description: "New discussion thread opened to review terrace vibration capture methods.",
        timestamp: "2024-07-25T19:05:00Z",
        author: "arch.santillan",
      },
    ],
  },
  {
    id: "anadolu-myths",
    title: "Anatolian Migration Myth Cycles",
    summary:
      "Links subterranean complexes with mythic narratives of refuge and seasonal movement across central Anatolia.",
    objectives: [
      "Map oral tradition references to specific tunnel networks",
      "Associate deities with architectural symbols",
      "Publish annotated myth timeline for collaborator review",
    ],
    focusRegions: ["Cappadocia", "Lake Van"],
    eras: ["Late Bronze", "Iron Age"],
    status: "draft",
    leadInvestigator: "Dr. Bekir Yılmaz",
    collaboratorCount: 6,
    hypotheses: [
      {
        id: "anadolu-h1",
        title: "Storm Deity Processional Route",
        statement:
          "Inscription parallels suggest fortress reliefs guided seasonal pilgrimages between Ayanis and subterranean refuges.",
        status: "proposed",
        confidence: "speculative",
        evidenceCount: 2,
        lastUpdated: "2024-09-19T10:00:00Z",
      },
    ],
    linkedEntities: [
      { id: "anatolia-derinkuyu", type: "site", name: "Derinkuyu Subterranean City", relation: "Tunnel network focus" },
      { id: "anatolia-ayanis", type: "site", name: "Ayanis Fortress", relation: "Iconography analysis" },
      { id: "tablet-haldi", type: "text", name: "Haldi Storm Tablet", relation: "Mythic cross-reference" },
    ],
    activity: [
      {
        id: "anadolu-a1",
        description: "Uploaded newly translated fragment referencing seasonal descent rituals.",
        timestamp: "2024-08-11T14:45:00Z",
        author: "moderator.ipek",
      },
    ],
  },
  {
    id: "harappan-hydrology",
    title: "Harappan Hydrology Network",
    summary:
      "Collaborative dataset cataloguing reservoir engineering, flood basins, and water hieroglyph sequences across the Indus valley.",
    objectives: [
      "Digitize reservoir layout plans with 3D overlays",
      "Connect hydrological inscriptions to drought chronicles",
      "Model seasonal water redistribution scenarios",
    ],
    focusRegions: ["Rann of Kutch", "Indus Delta"],
    eras: ["Mature Harappan"],
    status: "active",
    leadInvestigator: "R. Kapoor",
    collaboratorCount: 10,
    hypotheses: [
      {
        id: "harappan-h1",
        title: "Reservoir Redistribution Protocol",
        statement:
          "Sequential valve openings follow inscriptions describing ritual observances tied to monsoon cycles.",
        status: "under_review",
        confidence: "plausible",
        evidenceCount: 4,
        lastUpdated: "2024-05-30T07:30:00Z",
      },
    ],
    linkedEntities: [
      { id: "indus-dholavira", type: "site", name: "Dholavira Reservoir Complex", relation: "Pilot mapping site" },
      { id: "seal-glyph-27", type: "artifact", name: "Harappan Seal 27", relation: "Glyph sequence reference" },
      { id: "ghaggar-texts", type: "text", name: "Ghaggar Flood Chronicle", relation: "Historical drought record" },
    ],
    activity: [
      {
        id: "harappan-a1",
        description: "Geo R. Kapoor attached LiDAR slices of the northern reservoir wall for peer annotation.",
        timestamp: "2024-06-01T09:18:00Z",
        author: "geo.r.kapoor",
      },
    ],
  },
];
