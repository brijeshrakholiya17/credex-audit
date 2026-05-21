import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shared_audits")
      .select("payload")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({ result: data.payload });
  } catch (err) {
    console.error("Fetch audit error:", err);
    return NextResponse.json({ error: "Failed to load audit" }, { status: 500 });
  }
}
