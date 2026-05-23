import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, result } = body

    if (!id || !result) {
      return NextResponse.json({ error: "Missing id or result payload" }, { status: 400 })
    }

    const supabaseServer = createAdminClient()
    const { error } = await supabaseServer
      .from('audits')
      .insert({
        share_id: id,
        results: result,
        total_monthly_savings: result.potentialMonthlySavings || 0,
        total_annual_savings: (result.potentialMonthlySavings || 0) * 12,
      })

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Share API error:", err);
    return NextResponse.json(
      { error: "Failed to process share request" },
      { status: 500 }
    )
  }
}
