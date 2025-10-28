# 🌍 Archaeology Mapping Project
### Reconstructing the Hidden History of Human Civilization

---

## 📚 Table of Contents
- [🧭 Mission](#-mission)
- [🔭 Vision](#-vision)
- [🗺️ What the Platform Does](#️-what-the-platform-does)
- [🧠 Research Goals](#-research-goals)
- [🧰 How We’ll Achieve It](#-how-well-achieve-it)
- [🌐 The Research Approach](#-the-research-approach)
- [🔬 Expected Outcomes](#-expected-outcomes)
- [🌏 Join the Expedition](#-join-the-expedition)
- [📁 Repository Structure](#-repository-structure-high-level)
- [🗝️ License](#️-license)

---

## 🧭 Mission

The **Archaeology Mapping Project** is an open, collaborative platform dedicated to uncovering and visualizing patterns in ancient history that challenge conventional timelines.  

By mapping archaeological sites, myths, geological data, and ancient texts into a unified geospatial framework, this project aims to reveal correlations between civilizations, cataclysms, and technologies that may have been lost to time.

---

## 🔭 Vision

We believe humanity’s story is far older and more interconnected than current narratives suggest.  
Ancient civilizations across the globe, from Egypt and Sumer to the Andes and Indus Valley, share strikingly similar myths, architectural styles, and astronomical alignments.  

These parallels may not be coincidence, but the echoes of a once-global network of knowledge that predates the Younger Dryas (around 12,800 years ago).

Our goal is to create a **living, crowd-driven research atlas** that grows as new discoveries are made, academic papers are published, and citizen researchers contribute their findings.

---

## 🗺️ What the Platform Does

The Archaeology Mapping Project serves as a **global knowledge map**. Users can:

- 🧩 **Pin sites:** Add ancient sites, ruins, megaliths, geological formations, or unexplained structures on an interactive world map.  
- 📜 **Upload evidence:** Attach photos, site measurements, academic references, ancient texts, or mythological parallels.  
- 🌋 **Cross-reference data:** Overlay geological layers (floodplains, impact craters, volcanic ash, glacial melt paths) with archaeological data.  
- 🕯️ **Analyze patterns:** Visualize temporal and spatial relationships between civilizations, trade routes, myths, and natural cataclysms.  
- 🤖 **AI-assisted synthesis:** Use AI agents trained on academic sources to identify thematic connections and generate new hypotheses.

---

## 🧠 Research Goals

This project bridges **archaeology**, **mythology**, **geology**, and **anthropology** through data correlation.  
It seeks to explore questions such as:

- Were there advanced pre-Ice Age civilizations lost in global cataclysms?  
- Why do flood myths, sky gods, and sacred geometry appear in every culture?  
- Do patterns of site placement and alignments suggest an ancient global grid or knowledge system?  
- How do geological records (for example, meltwater pulses or impact events) align with cultural collapses and mythic resets?

---

## 🧰 How We’ll Achieve It

### 1. Data Integration
- Aggregate verified datasets, including archaeological site coordinates, LiDAR scans, geological records, and linguistic data.  
- Include community-sourced observations validated through reputation and citation systems.

### 2. Collaborative Research
- Enable teams to form around specific hypotheses such as *Megalithic Energy Network*, *Post-Younger Dryas Survivors*, or *Ancient Global Oceanic Routes.*  
- Encourage interdisciplinary discourse connecting geology, astronomy, and mythological anthropology.

### 3. AI-Driven Analysis
- Train research agents to cross-reference myths, ancient texts, and academic papers.  
- Use natural language processing and geospatial clustering to uncover non-obvious connections.

### 4. Visualization Tools
- Build interactive maps that combine physical data (topography, tectonics, hydrology) with historical narratives.  
- Allow timeline playback to visualize human migrations, floods, and cultural expansions.

---

## 🌐 The Research Approach

The platform operates under **open-source scientific principles**: transparent, verifiable, and collaborative.  
Our methodology involves:

- **Correlation before conclusion:** Using data visualization to observe patterns before forming theories.  
- **Cross-disciplinary synthesis:** Treating myths, linguistics, and architecture as valid archaeological data points.  
- **Transparency and sourcing:** Every data point must cite or link to a verifiable reference such as a paper, survey, or field report.  
- **Decentralized contribution:** Citizen researchers, academics, and field explorers can all participate equally.

---

## 🔬 Expected Outcomes

- A **living global map** of ancient structures, myths, and geological evidence.  
- A **centralized research library** of credible sources and ongoing analyses.  
- **Hypothesis papers** generated collaboratively and published for peer review.  
- A **data-driven narrative** of human civilization that integrates myth, memory, and measurable evidence.

---

## 🌏 Join the Expedition

This is not just a project — it is an **invitation to rediscover who we are.**  
Whether you’re an archaeologist, data scientist, geologist, mythologist, or curious explorer, your insights can shape this shared map of our forgotten past.

> “The further back you look, the further forward you can see.”  
> — Winston Churchill

---

## ⚙️ Local Development

```bash
npm install
npm run dev
```

The app runs on Next.js 15 with the App Router, Tailwind CSS, shadcn/ui components, Supabase client utilities, and Leaflet for mapping. Environment variables such as Supabase keys should be stored in `.env.local` (see `PRD.md` for expected keys).

## 📁 Repository Structure (High-Level)

- `src/app` – Next.js App Router pages. `/(app)` contains the authenticated shell (map, research hub, forum, media, texts, notifications, profile). The root `page.tsx` renders the public landing page.
- `src/components` – Shared navigation chrome and shadcn/ui primitives (`button`, `card`, `tabs`, etc.).
- `src/data` – Seed data used to prototype Leaflet markers, research projects, discussions, media, texts, and notifications.
- `src/lib` – Utility helpers and shared TypeScript types for sites, research projects, media, and notifications.
- `src/state` – Client-side state (Zustand store) powering the Leaflet map filters and selections.
- `PRD.md` – Product requirements document guiding the MVP scope.

Refer to `PRD.md` for feature breakdowns, milestones, and the collaborative research vision.

---

## 🗝️ License

Open-source under the **MIT License**.
All research and site data remain attributed to original contributors and sources.
