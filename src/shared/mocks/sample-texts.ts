import { TextSource } from "@/shared/types/content";

export const sampleTextSources: TextSource[] = [
  {
    id: "papyrus-bremner",
    title: "Bremner-Rhind Papyrus Chant Cycle",
    author: "British Museum Transcription Team",
    civilization: "Ancient Egyptian",
    era: "Late Period",
    language: "Middle Egyptian",
    summary:
      "Liturgical sequence referencing sound harmonics and cyclical invocations; cross-linked to Giza resonance project.",
    tags: ["ritual", "chant", "translation"],
    downloadUrl: "https://example.com/docs/bremner-rhind.pdf",
  },
  {
    id: "quipu-codex",
    title: "Quipu Knot Frequency Ledger",
    author: "Aurelia Quispe",
    civilization: "Inca",
    era: "Late Horizon",
    language: "Quechua",
    summary:
      "Field notes connecting knot tension to tonal registers recorded across Cusco terraces.",
    tags: ["quipu", "field notes"],
    downloadUrl: "https://example.com/docs/quipu-ledger.pdf",
  },
  {
    id: "tablet-haldi",
    title: "Haldi Storm Tablet Fragment",
    author: "Bekir Yılmaz",
    civilization: "Urartu",
    era: "Iron Age",
    language: "Urartian",
    summary:
      "Epigraphic fragment referencing subterranean refuge rituals and storm deity iconography.",
    tags: ["myth", "ritual"],
  },
  {
    id: "ghaggar-texts",
    title: "Ghaggar Flood Chronicle",
    author: "Archaeological Survey of India",
    civilization: "Indus Valley",
    era: "Late Harappan",
    language: "Proto-Indus",
    summary:
      "Compilation of glyph interpretations describing drought and flood mitigation practices.",
    tags: ["hydrology", "glyph"],
  },
];
