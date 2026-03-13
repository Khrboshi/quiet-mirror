import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .select("id,title,content,created_at,ai_response")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entryId = params.id;
    if (!entryId) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    // Verify ownership before deleting — never trust the client alone
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("id", entryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[journal/delete] error:", deleteError);
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[journal/delete] unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
