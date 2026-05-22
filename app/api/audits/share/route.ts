import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, result } = body

  const supabaseServer = createClient()
  const { error } = await supabaseServer
    .from('audits')
    .insert({
      share_id: id,
      results: result,
      total_monthly_savings: result.potentialMonthlySavings,
      total_annual_savings: result.potentialMonthlySavings * 12,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
