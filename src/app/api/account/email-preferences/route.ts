import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("email_preferences")
    .select("unsubscribed_all, unsubscribed_drip, unsubscribed_reengagement")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    preferences: data ?? {
      unsubscribed_all: false,
      unsubscribed_drip: false,
      unsubscribed_reengagement: false,
    },
  });
}

export async function PUT(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const preferences = {
    unsubscribed_all: Boolean(body.unsubscribed_all),
    unsubscribed_drip: Boolean(body.unsubscribed_drip),
    unsubscribed_reengagement: Boolean(body.unsubscribed_reengagement),
  };

  const { error } = await supabase.from("email_preferences").upsert(
    {
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("Failed to update email preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }

  return NextResponse.json({ preferences });
}
