import { NextResponse } from "next/server";
import { estimateGenerationCredits } from "@/lib/billing/config";
import { getCreditBalance } from "@/lib/billing/credits";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(user.id);
  const estimate = estimateGenerationCredits();

  return NextResponse.json({
    ...balance,
    generationCost: estimate,
  });
}
