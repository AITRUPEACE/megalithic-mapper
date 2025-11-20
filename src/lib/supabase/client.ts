import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function getServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase server helpers must be invoked on the server.");
  }

  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration for server client.");
  }

  return createServerComponentClient(
    {
      cookies: () => cookieStore,
    },
    { supabaseUrl, supabaseKey }
  );
}
