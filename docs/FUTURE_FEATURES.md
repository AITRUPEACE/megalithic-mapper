# Future Features - Megalithic Mapper

## 1. YouTube API Integration 📺

### Overview

Automatically poll YouTube channels from researchers/content creators in the ancient history space and feature new videos in the activity feed.

### Technical Approach

#### YouTube Data API v3

```typescript
// Required scopes
const YOUTUBE_API_SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];

// Key endpoints
// GET /youtube/v3/channels - Get channel info
// GET /youtube/v3/search - Search for videos
// GET /youtube/v3/playlistItems - Get uploads playlist
```

#### Database Schema

```sql
-- Tracked YouTube channels
CREATE TABLE youtube_channels (
  id UUID PRIMARY KEY,
  channel_id VARCHAR(255) UNIQUE NOT NULL, -- YouTube channel ID
  channel_name VARCHAR(255) NOT NULL,
  profile_id UUID REFERENCES profiles(id), -- Linked user profile
  last_video_id VARCHAR(255),
  last_polled_at TIMESTAMPTZ,
  poll_frequency_hours INT DEFAULT 6,
  subscriber_count INT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos pulled from YouTube
CREATE TABLE youtube_videos (
  id UUID PRIMARY KEY,
  video_id VARCHAR(255) UNIQUE NOT NULL,
  channel_id UUID REFERENCES youtube_channels(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMPTZ,
  duration_seconds INT,
  view_count INT,
  like_count INT,
  comment_count INT,
  -- AI-generated summary
  ai_summary TEXT,
  -- Linked sites/topics
  site_ids UUID[],
  topic_ids UUID[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Background Job (Cron/Vercel Cron)

```typescript
// /api/cron/poll-youtube.ts
import { google } from 'googleapis';

export async function pollYouTubeChannels() {
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  // Get channels due for polling
  const channels = await db.query(`
    SELECT * FROM youtube_channels
    WHERE last_polled_at < NOW() - INTERVAL '1 hour' * poll_frequency_hours
    LIMIT 10
  `);

  for (const channel of channels) {
    // Get latest videos from uploads playlist
    const response = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: `UU${channel.channel_id.slice(2)}`, // Uploads playlist
      maxResults: 5,
    });

    for (const item of response.data.items || []) {
      const videoId = item.contentDetails?.videoId;

      // Check if we already have this video
      const exists = await db.query(
        'SELECT 1 FROM youtube_videos WHERE video_id = $1',
        [videoId]
      );

      if (!exists.rows.length) {
        // New video! Create feed item
        await createVideoFeedItem(channel, item);

        // Optional: Generate AI summary
        const summary = await generateAISummary(item.snippet);

        // Insert into database
        await db.query(`
          INSERT INTO youtube_videos (video_id, channel_id, title, description, ...)
          VALUES ($1, $2, $3, $4, ...)
        `, [videoId, channel.id, item.snippet.title, ...]);
      }
    }

    // Update last polled timestamp
    await db.query(
      'UPDATE youtube_channels SET last_polled_at = NOW() WHERE id = $1',
      [channel.id]
    );
  }
}
```

#### AI Summary Generation

```typescript
import OpenAI from "openai";

async function generateAISummary(snippet: any): Promise<string> {
	const openai = new OpenAI();

	const completion = await openai.chat.completions.create({
		model: "gpt-4-turbo-preview",
		messages: [
			{
				role: "system",
				content: `You are summarizing YouTube videos about ancient history, 
        megalithic structures, and alternative archaeology. Create a concise 
        2-3 sentence summary focusing on key claims, evidence presented, 
        and sites mentioned.`,
			},
			{
				role: "user",
				content: `Title: ${snippet.title}\n\nDescription: ${snippet.description}`,
			},
		],
		max_tokens: 150,
	});

	return completion.choices[0]?.message?.content || "";
}
```

#### Popular Channels to Track

- UnchartedX (Ben)
- Graham Hancock
- Brien Foerster
- Ancient Architects
- World of Antiquity
- Bright Insight
- cfapps7865 (Christopher Dunn)

### API Rate Limits

- YouTube API: 10,000 units/day (free tier)
- search.list = 100 units per call
- playlistItems.list = 1 unit per call
- videos.list = 1 unit per call

**Strategy**: Use playlistItems for uploads playlist (cheap), cache aggressively

---

## 2. Collaboration Canvas 🎨

### Overview

A shared, real-time canvas where users can visually connect sites, draw theories, and collaborate on research hypotheses.

### Features

#### Core Canvas Functionality

- **Drawing Tools**: Lines, arrows, shapes, freehand
- **Connection Lines**: Link sites with annotated connections
- **Sticky Notes**: Add context and theories
- **Image Upload**: Add photos, diagrams, evidence
- **Map Overlay**: Draw directly on the world map

#### Real-Time Collaboration

- Multiple users editing simultaneously
- Cursor presence (see other users)
- Comments and reactions
- Version history / time travel

### Technical Stack

#### Option A: Tldraw (Recommended)

```typescript
import { Tldraw, createTLStore, defaultShapeUtils } from "@tldraw/tldraw";
import { useSyncDemo } from "@tldraw/sync";

// Custom shape for site markers
class SiteMarkerShape extends BaseBoxShapeUtil<SiteMarkerShape> {
	static type = "site-marker" as const;

	getDefaultProps() {
		return {
			siteId: "",
			siteName: "",
			coordinates: { lat: 0, lng: 0 },
		};
	}

	component(shape: SiteMarkerShape) {
		return (
			<div className="site-marker">
				<MapPin />
				<span>{shape.props.siteName}</span>
			</div>
		);
	}
}

// Real-time sync with Yjs
function CollaborationCanvas({ roomId }: { roomId: string }) {
	const store = useSyncDemo({ roomId });

	return <Tldraw store={store} shapeUtils={[...defaultShapeUtils, SiteMarkerShape]} />;
}
```

#### Option B: Excalidraw + Yjs

```typescript
import { Excalidraw } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

// Collaborative room with Yjs
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function createCollabRoom(roomId: string) {
	const ydoc = new Y.Doc();
	const provider = new WebsocketProvider("wss://your-yjs-server.com", roomId, ydoc);

	return { ydoc, provider };
}
```

#### Map Integration

```typescript
// Overlay canvas on Leaflet map
function MapCanvas({ mapRef }: { mapRef: L.Map }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!mapRef || !canvasRef.current) return;

		// Sync canvas position with map viewport
		const updateCanvas = () => {
			const bounds = mapRef.getBounds();
			const topLeft = mapRef.latLngToContainerPoint(bounds.getNorthWest());
			// ... position canvas overlay
		};

		mapRef.on("move", updateCanvas);
		mapRef.on("zoom", updateCanvas);

		return () => {
			mapRef.off("move", updateCanvas);
			mapRef.off("zoom", updateCanvas);
		};
	}, [mapRef]);

	return <canvas ref={canvasRef} className="map-canvas-overlay" />;
}
```

### Database Schema

```sql
-- Collaboration rooms/boards
CREATE TABLE collaboration_boards (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  canvas_data JSONB, -- Tldraw/Excalidraw state
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board collaborators
CREATE TABLE board_collaborators (
  board_id UUID REFERENCES collaboration_boards(id),
  user_id UUID REFERENCES profiles(id),
  role VARCHAR(50) DEFAULT 'editor', -- 'viewer', 'editor', 'admin'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (board_id, user_id)
);

-- Connection proposals
CREATE TABLE connection_proposals (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES collaboration_boards(id),
  proposer_id UUID REFERENCES profiles(id),
  site_a_id UUID REFERENCES sites(id),
  site_b_id UUID REFERENCES sites(id),
  connection_type VARCHAR(100), -- 'architecture', 'astronomy', 'symbolism'
  evidence TEXT,
  canvas_annotation_id VARCHAR(255), -- Reference to canvas element
  status VARCHAR(50) DEFAULT 'proposed', -- 'proposed', 'verified', 'disputed'
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎨 Connection Research: Acoustic Chambers    [Share] [Export]  │
├─────────────────────────────────────────────────────────────────┤
│ [Tools: 🖊️ Draw | ↗️ Arrow | 📌 Pin Site | 💬 Note | 🖼️ Image] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     📍 Great Pyramid ─────────────────────────📍 Sacsayhuaman  │
│         ↓                    "110Hz                    ↓        │
│    [Notes...]              resonance"             [Notes...]    │
│                               ↓                                 │
│                         📍 Newgrange                            │
│                           ↓                                     │
│                      [Evidence img]                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 💬 Chat    │ 👥 Maria, Alex, Ben viewing    │ 📜 History       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. AI Agent Research System 🤖

### Overview

A multi-agent system that autonomously researches, collects, and analyzes data about ancient sites, proposing connections and theories for community verification.

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│         (Coordinates research, evaluates findings)              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ ARCHAEOLOGY   │   │   GEOLOGY     │   │  SCRIPTURE    │
│    AGENT      │   │    AGENT      │   │    AGENT      │
│               │   │               │   │               │
│ • Site data   │   │ • Rock types  │   │ • Ancient     │
│ • Dating      │   │ • Quarry      │   │   texts       │
│ • Artifacts   │   │   locations   │   │ • Myths       │
│ • Excavation  │   │ • Geology     │   │ • Flood       │
│   reports     │   │   patterns    │   │   narratives  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │   SYMBOLOGY AGENT     │
                 │                       │
                 │ • Pattern matching    │
                 │ • Cross-cultural      │
                 │   symbol analysis     │
                 │ • Iconography         │
                 └───────────┬───────────┘
                              │
                              ▼
                 ┌───────────────────────┐
                 │  CONNECTION AGENT     │
                 │                       │
                 │ • Find correlations   │
                 │ • Propose theories    │
                 │ • Generate reports    │
                 └───────────────────────┘
```

### Technical Implementation

#### Agent Base Class

```typescript
// /lib/agents/base-agent.ts
import OpenAI from "openai";

export abstract class ResearchAgent {
	protected openai: OpenAI;
	protected name: string;
	protected systemPrompt: string;

	constructor(name: string, systemPrompt: string) {
		this.name = name;
		this.systemPrompt = systemPrompt;
		this.openai = new OpenAI();
	}

	abstract research(query: string): Promise<ResearchFindings>;
	abstract analyze(data: any): Promise<Analysis>;

	protected async chat(messages: Message[]): Promise<string> {
		const completion = await this.openai.chat.completions.create({
			model: "gpt-4-turbo-preview",
			messages: [{ role: "system", content: this.systemPrompt }, ...messages],
			tools: this.getTools(),
		});

		return completion.choices[0]?.message?.content || "";
	}

	protected abstract getTools(): Tool[];
}

interface ResearchFindings {
	agentName: string;
	query: string;
	findings: Finding[];
	sources: Source[];
	confidence: number;
	timestamp: Date;
}
```

#### Specialized Agents

```typescript
// /lib/agents/archaeology-agent.ts
export class ArchaeologyAgent extends ResearchAgent {
	constructor() {
		super(
			"Archaeology",
			`
      You are an expert archaeologist specializing in ancient 
      megalithic structures. Your role is to:
      1. Research archaeological data about ancient sites
      2. Analyze construction techniques and dating
      3. Compare findings across cultures
      4. Identify anomalies that warrant further investigation
      
      Always cite sources and express confidence levels.
    `
		);
	}

	async research(siteId: string): Promise<ResearchFindings> {
		// 1. Fetch site data from our database
		const site = await db.getSite(siteId);

		// 2. Search academic databases (Semantic Scholar, JSTOR)
		const papers = await this.searchAcademicPapers(site.name);

		// 3. Analyze with AI
		const analysis = await this.chat([
			{
				role: "user",
				content: `Analyze archaeological data for ${site.name}:
        Location: ${site.coordinates}
        Known dates: ${site.dating}
        Construction: ${site.construction}
        
        Academic papers found: ${papers.map((p) => p.title).join(", ")}
      `,
			},
		]);

		return {
			agentName: this.name,
			query: siteId,
			findings: this.parseFindings(analysis),
			sources: papers,
			confidence: 0.8,
			timestamp: new Date(),
		};
	}

	protected getTools() {
		return [
			{
				type: "function",
				function: {
					name: "search_academic_papers",
					description: "Search for academic papers on a topic",
					parameters: {
						type: "object",
						properties: {
							query: { type: "string" },
							year_range: { type: "string" },
						},
					},
				},
			},
			{
				type: "function",
				function: {
					name: "get_radiocarbon_data",
					description: "Fetch radiocarbon dating results for a site",
					parameters: {
						type: "object",
						properties: {
							site_name: { type: "string" },
						},
					},
				},
			},
		];
	}
}
```

#### Orchestrator Agent

```typescript
// /lib/agents/orchestrator.ts
export class OrchestratorAgent {
	private agents: Map<string, ResearchAgent> = new Map();

	constructor() {
		this.agents.set("archaeology", new ArchaeologyAgent());
		this.agents.set("geology", new GeologyAgent());
		this.agents.set("scripture", new ScriptureAgent());
		this.agents.set("symbology", new SymbologyAgent());
	}

	async conductResearch(topic: string): Promise<ResearchReport> {
		// 1. Plan research strategy
		const plan = await this.createResearchPlan(topic);

		// 2. Dispatch to specialist agents (parallel)
		const findings = await Promise.all(
			plan.agents.map(async (agentName) => {
				const agent = this.agents.get(agentName);
				return agent?.research(topic);
			})
		);

		// 3. Synthesize findings
		const synthesis = await this.synthesize(findings);

		// 4. Identify connections
		const connections = await this.findConnections(synthesis);

		// 5. Generate theory proposals
		const theories = await this.proposeTheories(connections);

		return {
			topic,
			findings,
			synthesis,
			connections,
			theories,
			status: "pending_review",
			createdAt: new Date(),
		};
	}

	private async synthesize(findings: ResearchFindings[]): Promise<Synthesis> {
		const prompt = `
      You are synthesizing research findings from multiple specialist agents.
      
      Findings:
      ${findings
				.map(
					(f) => `
        [${f.agentName}]
        ${f.findings.map((finding) => `- ${finding.summary}`).join("\n")}
      `
				)
				.join("\n\n")}
      
      Identify:
      1. Common themes across disciplines
      2. Contradictions or tensions
      3. Gaps that need further research
      4. Potential connections between findings
    `;

		return this.analyze(prompt);
	}
}
```

#### Database Schema

```sql
-- Research sessions
CREATE TABLE research_sessions (
  id UUID PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Agent findings
CREATE TABLE agent_findings (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES research_sessions(id),
  agent_name VARCHAR(100) NOT NULL,
  query TEXT,
  findings JSONB,
  sources JSONB,
  confidence FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposed connections
CREATE TABLE ai_connections (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES research_sessions(id),
  -- TODO: Connections should be able to be multi-site (more than 2 sites have a commonality) consider using a list of ids or names isntead of 2 separate properties)
  site_a_id UUID REFERENCES sites(id),
  site_b_id UUID REFERENCES sites(id),
  connection_type VARCHAR(100),
  evidence JSONB,
  confidence FLOAT,
  community_votes INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theory proposals
CREATE TABLE ai_theories (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES research_sessions(id),
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  full_explanation TEXT,
  supporting_evidence JSONB,
  related_sites UUID[],
  related_connections UUID[],
  confidence FLOAT,
  community_votes INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Community Verification UI

```typescript
// Component for reviewing AI findings
function TheoryReviewCard({ theory }: { theory: AITheory }) {
	return (
		<Card>
			<CardHeader>
				<Badge>AI Proposed Theory</Badge>
				<h3>{theory.title}</h3>
				<p>Confidence: {(theory.confidence * 100).toFixed(0)}%</p>
			</CardHeader>
			<CardContent>
				<p>{theory.summary}</p>

				<h4>Supporting Evidence</h4>
				<ul>
					{theory.evidence.map((e) => (
						<li key={e.id}>
							{e.description}
							<Badge>{e.source}</Badge>
						</li>
					))}
				</ul>

				<h4>Related Sites</h4>
				<SiteList sites={theory.relatedSites} />
			</CardContent>
			<CardFooter>
				<VoteButtons
					upvotes={theory.communityVotes}
					onUpvote={() => voteOnTheory(theory.id, "up")}
					onDownvote={() => voteOnTheory(theory.id, "down")}
				/>
				<Button>Discuss</Button>
				<Button variant="outline">View Full Research</Button>
			</CardFooter>
		</Card>
	);
}
```

### Research Flow

```
IMPORTANT: Determine how much research can be done each day on Free Tier usage of AI. what is the cheapest model that still can perform the task? can we use an open-source LLM if the research or task is basic enough? some ressarch is searching internet or apis or databases, downloading info and sifting through looking for patterns or interesting findings that align with the discipline. other tasks require going through findings and determining connections - some tasks may require advanced reasoning, others just data gathering adn organization

The theory agent or some other high-level agent should hold ongoing theories or theory of this supposed global civilization we're trying to piece togehter, and update its details (fillin missing puzzle pieces) as they're found with confidence levels % (this civilization used certain stones for their resonance properties, to: facilitate meditation & spiritual transcendence or healing or communication or some other theory (part of 'purpose of sites') or pyramids were chemical plants (35% confidence), or power plants (16% confidence) or X (y% confidence) etc)

1. USER triggers research on topic (e.g., "Acoustic properties of ancient chambers")
                    ↓
2. ORCHESTRATOR creates research plan
   - Assigns archaeology agent → find chambers, dating
   - Assigns geology agent → stone composition, resonance properties
   - Assigns scripture agent → references to sound/music in ancient texts
                    ↓
3. AGENTS work in parallel (async)
   - Each agent searches databases, papers, our site data
   - Each produces findings with confidence scores
                    ↓
4. ORCHESTRATOR synthesizes
   - Identifies patterns across agents
   - Finds correlations (e.g., "110Hz appears in 3 different sites")
                    ↓
5. CONNECTION AGENT
   - Proposes specific site-to-site connections
   - Generates visualization data for collaboration canvas
                    ↓
6. THEORY AGENT
   - Proposes testable hypotheses
   - Identifies what evidence would strengthen/weaken the theory
                    ↓
7. COMMUNITY REVIEW
   - Findings posted to feed
   - Users vote, comment, add evidence
   - Verified connections get added to main database
```

---

## Implementation Priority

1. **YouTube API Integration** (1-2 weeks)
   - Low complexity, high immediate value
   - Brings fresh content automatically
2. **Collaboration Canvas** (3-4 weeks)
   - Medium complexity, enables key use case
   - Start with Tldraw for fast MVP
3. **AI Agent Research System** (6-8 weeks)
   - High complexity, unique differentiator
   - Start with 2 agents, expand gradually
   - Need to build evaluation/verification UX first

---

## Next Steps

1. [ ] Create YouTube API key and test quota usage
2. [ ] Set up Vercel Cron for background jobs
3. [ ] Prototype Tldraw integration with Leaflet
4. [ ] Design AI agent prompt engineering
5. [ ] Build community voting/verification system


