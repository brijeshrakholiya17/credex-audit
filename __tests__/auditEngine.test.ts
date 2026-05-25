import { describe, it, expect } from 'vitest'
import { runAudit } from '../lib/auditEngine'

describe('Audit Engine', () => {

  it('returns zero savings when no tools enabled', () => {
    const result = runAudit([])
    expect(result.potentialMonthlySavings).toBe(0)
    expect(result.recommendations).toHaveLength(0)
  })

  it('detects duplicate chat tools correctly', () => {
    const result = runAudit([
      { toolId: 'claude', plan: 'Pro', monthlyCost: 20, seats: 1 },
      { toolId: 'chatgpt', plan: 'Plus', monthlyCost: 20, seats: 1 },
    ])
    const hasDuplicate = result.recommendations.some(
      r => r.type === 'duplicate'
    )
    expect(hasDuplicate).toBe(true)
  })

  it('detects team plan overkill for small teams', () => {
    const result = runAudit([
      { toolId: 'claude', plan: 'Team', monthlyCost: 60, seats: 2 },
    ])
    const hasDowngrade = result.recommendations.some(
      r => r.type === 'downgrade'
    )
    expect(hasDowngrade).toBe(true)
  })

  it('calculates total monthly spend correctly', () => {
    const result = runAudit([
      { toolId: 'cursor', plan: 'Pro', monthlyCost: 20, seats: 2 },
      { toolId: 'claude', plan: 'Pro', monthlyCost: 20, seats: 1 },
    ])
    expect(result.totalMonthlySpend).toBe(60)
  })

  it('annual spend is 12x monthly spend', () => {
    const result = runAudit([
      { toolId: 'chatgpt', plan: 'Plus', monthlyCost: 20, seats: 1 },
    ])
    expect(result.totalAnnualSpend).toBe(result.totalMonthlySpend * 12)
  })

})