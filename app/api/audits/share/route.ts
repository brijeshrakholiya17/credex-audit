import { NextResponse } from "next/server";

import type { AuditResult } from "@/lib/auditEngine";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      result?: AuditResult;
    };

    const { id, result } = body;

    if (!id || !result) {
      return NextResponse.json(
        { error: "Missing id or result" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("shared_audits").upsert({
      id,
      payload: result,
    });

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ id, path: `/share/${id}` });
  } catch (err) {
    console.error("Share API error:", err);
    return NextResponse.json(
      { error: "Failed to save audit" },
      { status: 500 }
    );
  }
}
