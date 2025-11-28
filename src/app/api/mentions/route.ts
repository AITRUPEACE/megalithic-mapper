import { NextResponse } from "next/server";
import type { MentionTarget, NotificationFanoutPayload } from "@/entities/discussion/model/types";
import { createClient } from "@/lib/supabase/server";

type MentionProfileRow = {
	id: string;
	full_name: string | null;
	avatar_url: string | null;
	handle: string | null;
	username: string | null;
};

const mapProfileToMention = (record: MentionProfileRow): MentionTarget => ({
  id: record.id,
  displayName: record.full_name ?? "Unknown contributor",
  handle: record.handle ?? record.username ?? undefined,
  avatarUrl: record.avatar_url ?? null,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, handle, username")
      .or(`full_name.ilike.%${query}%,handle.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(8);

    if (error) {
      console.error("Supabase mention search failed", error);
      return NextResponse.json({ results: [] }, { status: 500 });
    }

    const results = (data ?? []).map(mapProfileToMention);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Mention autocomplete unavailable", error);
    return NextResponse.json({ results: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as NotificationFanoutPayload;

  try {
    const supabase = await createClient();
    await supabase.from("mention_events").insert({
      thread_id: payload.threadId,
      entity_ref: payload.entityRef,
      mentions: payload.mentions,
      participant_ids: payload.participantIds,
      actor_id: payload.actorId,
      comment_id: payload.commentId,
    });
  } catch (error) {
    console.error("Unable to persist mention fan-out", error);
    return NextResponse.json({ queued: false });
  }

  return NextResponse.json({ queued: true });
}
