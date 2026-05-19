'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import {
  CYCLE_PHASES,
  getPhaseForCycleDay,
  getPhaseStatus,
  type CycleSettings,
} from '@/lib/cycle-phases'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const STORAGE_KEY = 'cycle-profile-settings'

const defaultSettings: CycleSettings = {
  lastPeriodStart: '',
  cycleLength: 28,
  periodLength: 5,
}

export function ProfileSection() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [settings, setSettings] = useState<CycleSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    if (supabase && user) {
      const { data } = await supabase
        .from('user_cycle_profile')
        .select('last_period_start, cycle_length, period_length')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) {
        setSettings({
          lastPeriodStart: data.last_period_start ?? '',
          cycleLength: data.cycle_length ?? 28,
          periodLength: data.period_length ?? 5,
        })
        setLoading(false)
        return
      }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings(JSON.parse(stored))
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [supabase, user])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    setSaving(true)
    setSaved(false)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    if (supabase && user) {
      await supabase.from('user_cycle_profile').upsert(
        {
          user_id: user.id,
          last_period_start: settings.lastPeriodStart || null,
          cycle_length: settings.cycleLength,
          period_length: settings.periodLength,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const phaseStatus = settings.lastPeriodStart ? getPhaseStatus(settings) : null
  const cycleDay = phaseStatus?.cycleDay ?? 0
  const progressPct = settings.lastPeriodStart
    ? Math.min(100, (cycleDay / settings.cycleLength) * 100)
    : 0

  const phasesWithCurrent = useMemo(() => {
    if (!settings.lastPeriodStart) {
      return CYCLE_PHASES.map((p) => ({ ...p, dayRange: '', isCurrent: false }))
    }
    const currentId = getPhaseForCycleDay(
      cycleDay,
      settings.cycleLength,
      settings.periodLength
    )
    const ovulation = settings.cycleLength - 14
    const ovStart = Math.max(settings.periodLength + 1, ovulation - 1)
    const ovEnd = Math.min(settings.cycleLength, ovulation + 1)
    const ranges: Record<string, string> = {
      menstrual: `Days 1–${settings.periodLength}`,
      follicular: `Days ${settings.periodLength + 1}–${ovStart - 1}`,
      ovulation: `Days ${ovStart}–${ovEnd}`,
      luteal: `Days ${ovEnd + 1}–${settings.cycleLength}`,
    }
    return CYCLE_PHASES.map((p) => ({
      ...p,
      dayRange: ranges[p.id],
      isCurrent: p.id === currentId,
    }))
  }, [settings, cycleDay])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground font-bold">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 xs:p-6 pb-2">
          <CardTitle className="text-base xs:text-lg">Profile</CardTitle>
          <CardDescription className="text-xs">{user?.email ?? 'Signed in'}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 xs:p-6 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-period" className="text-xs font-bold">
                Last period started
              </Label>
              <Input
                id="last-period"
                type="date"
                value={settings.lastPeriodStart}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, lastPeriodStart: e.target.value }))
                }
                className="min-h-[44px] text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-length" className="text-xs font-bold">
                Cycle length (days)
              </Label>
              <Input
                id="cycle-length"
                type="number"
                min={21}
                max={45}
                value={settings.cycleLength}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    cycleLength: Math.min(45, Math.max(21, Number(e.target.value) || 28)),
                  }))
                }
                className="min-h-[44px] text-sm"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="period-length" className="text-xs font-bold">
                Period length (days)
              </Label>
              <Input
                id="period-length"
                type="number"
                min={2}
                max={10}
                value={settings.periodLength}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    periodLength: Math.min(10, Math.max(2, Number(e.target.value) || 5)),
                  }))
                }
                className="min-h-[44px] text-sm max-w-full sm:max-w-[200px]"
              />
            </div>
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="w-full sm:w-auto min-h-[44px] font-bold"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save cycle settings'}
          </Button>
        </CardContent>
      </Card>

      {phaseStatus ? (
        <Card className={`neo-shadow-lg ${phaseStatus.phase.colorClass}`}>
          <CardHeader className="p-4 xs:p-6 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base xs:text-lg">Current phase</CardTitle>
              <Badge className={`${phaseStatus.phase.colorClass} border-0 font-bold text-xs`}>
                {phaseStatus.phase.name}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Cycle day {phaseStatus.cycleDay} of {settings.cycleLength}
              {phaseStatus.daysUntilNextPeriod != null &&
                ` · ~${phaseStatus.daysUntilNextPeriod} days until next period`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 xs:p-6 pt-0 space-y-3">
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs xs:text-sm text-foreground font-bold leading-relaxed">
              {phaseStatus.phase.description}
            </p>
            <p className="text-[10px] xs:text-xs text-muted-foreground">
              <span className="font-bold">Tip:</span> {phaseStatus.phase.tips}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed bg-muted">
          <CardContent className="p-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-bold">
              Set your last period date above to see your current cycle phase.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4 xs:p-6 pb-2">
          <CardTitle className="text-base xs:text-lg">All cycle phases</CardTitle>
          <CardDescription className="text-xs">
            Menstrual, follicular, ovulation, and luteal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 xs:p-6 pt-0 space-y-3">
          {phasesWithCurrent.map((phase) => (
            <div
              key={phase.id}
              className={`rounded-md p-3 xs:p-4 neo-border transition ${
                phase.isCurrent
                  ? `${phase.colorClass} neo-shadow-lg`
                  : 'bg-card neo-shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${phase.colorClass}`}>
                  {phase.name}
                </span>
                {settings.lastPeriodStart && (
                  <span className="text-[10px] xs:text-xs text-muted-foreground font-bold">
                    {phase.dayRange}
                  </span>
                )}
                {phase.isCurrent && (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    You are here
                  </Badge>
                )}
              </div>
              <p className="text-xs text-foreground leading-relaxed">{phase.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
