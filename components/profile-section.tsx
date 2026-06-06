'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import {
  CYCLE_PHASES,
  formatPeriodDate,
  getNextPeriodDate,
  getPhaseForCycleDay,
  getPhaseStatus,
  type CycleSettings,
} from '@/lib/cycle-phases'
import { CycleMoodLog } from '@/components/cycle-mood-log'
import { PhaseSpending } from '@/components/phase-spending'
import { CycleRemindersPanel } from '@/components/cycle-reminders-panel'
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
  const nextPeriod = settings.lastPeriodStart ? getNextPeriodDate(settings) : null
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
      <div className="neo-card p-8 text-center bg-gradient-to-br from-rose-50 to-pink-100">
        <p className="text-3xl mb-2">🌸</p>
        <p className="text-sm text-rose-600 font-bold">Loading your cycle diary...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero banner */}
      <div className="neo-card overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100">
        <div className="p-5 xs:p-6 sm:p-8 text-center relative">
          <div className="absolute top-3 left-4 text-lg opacity-60">🦋</div>
          <div className="absolute top-4 right-5 text-sm opacity-60">💕</div>
          <div className="absolute bottom-3 left-6 text-sm opacity-50">✨</div>
          <div className="absolute bottom-4 right-4 text-lg opacity-50">🌷</div>
          <p className="text-3xl xs:text-4xl mb-2">🌸</p>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-rose-700 uppercase tracking-wide">
            Your Cycle Diary
          </h2>
          <p className="text-xs xs:text-sm text-rose-500/80 font-bold mt-1">
            {user?.email ?? 'Track your beautiful rhythm'}
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="neo-card overflow-hidden">
        <div className="p-4 xs:p-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="text-sm xs:text-base font-bold text-rose-700">My cycle settings</h3>
              <p className="text-[10px] xs:text-xs text-rose-400 font-bold">Tell us about your flow, babe</p>
            </div>
          </div>
        </div>
        <div className="p-4 xs:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last-period" className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <span>🩷</span> Last period started
              </Label>
              <Input
                id="last-period"
                type="date"
                value={settings.lastPeriodStart}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, lastPeriodStart: e.target.value }))
                }
                className="min-h-[44px] text-sm border-rose-200 focus-visible:ring-rose-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle-length" className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <span>🔄</span> Cycle length (days)
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
                className="min-h-[44px] text-sm border-rose-200 focus-visible:ring-rose-300"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="period-length" className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <span>💧</span> Period length (days)
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
                className="min-h-[44px] text-sm max-w-full sm:max-w-[200px] border-rose-200 focus-visible:ring-rose-300"
              />
            </div>
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="w-full sm:w-auto min-h-[44px] font-bold bg-rose-400 hover:bg-rose-500 text-white border-2 border-rose-600 shadow-[3px_3px_0_0_#be185d] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            {saving ? '💾 Saving...' : saved ? '💕 Saved!' : '💕 Save my cycle'}
          </Button>
        </div>
      </div>

      {/* Current phase hero */}
      {phaseStatus ? (
        <div className={`neo-card overflow-hidden neo-shadow-lg border-2 ${phaseStatus.phase.borderClass}`}>
          <div className={`p-5 xs:p-6 bg-gradient-to-br ${phaseStatus.phase.colorClass} border-b-2 ${phaseStatus.phase.borderClass}`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl xs:text-5xl shrink-0 drop-shadow-sm">{phaseStatus.phase.emoji}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] xs:text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                  You&apos;re in your
                </p>
                <h3 className="text-xl xs:text-2xl font-bold leading-tight">
                  {phaseStatus.phase.name} phase
                </h3>
                <Badge className={`mt-2 ${phaseStatus.phase.colorClass} border ${phaseStatus.phase.borderClass} font-bold text-[10px] xs:text-xs`}>
                  {phaseStatus.phase.vibe}
                </Badge>
              </div>
            </div>
          </div>
          <div className="p-4 xs:p-6 space-y-4 bg-white/60">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] xs:text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                🌷 Day {phaseStatus.cycleDay} of {settings.cycleLength}
              </span>
              {phaseStatus.daysUntilNextPeriod != null && (
                <span className="inline-flex items-center gap-1 text-[10px] xs:text-xs font-bold px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                  💫 ~{phaseStatus.daysUntilNextPeriod} days until next period
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] xs:text-xs font-bold text-rose-400">
                <span>Cycle progress</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-3 bg-rose-100 [&>div]:bg-gradient-to-r [&>div]:from-rose-400 [&>div]:to-fuchsia-400" />
            </div>

            <p className="text-xs xs:text-sm text-foreground font-bold leading-relaxed">
              {phaseStatus.phase.description}
            </p>
            <div className="rounded-xl p-3 xs:p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
              <p className="text-[10px] xs:text-xs text-rose-600 leading-relaxed">
                <span className="font-bold">Self-care tip 💌</span> {phaseStatus.phase.tips}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="neo-card border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/50 to-pink-50/50 p-8 text-center">
          <p className="text-4xl mb-3">🌷</p>
          <p className="text-sm font-bold text-rose-600 mb-1">Your cycle story starts here</p>
          <p className="text-xs text-rose-400">
            Add your last period date above and we&apos;ll show you exactly where you are in your cycle!
          </p>
        </div>
      )}

      {nextPeriod && (
        <div className="neo-card p-4 xs:p-5 bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗓️</span>
            <div>
              <p className="text-[10px] xs:text-xs font-bold text-rose-500 uppercase tracking-wide">
                Next period expected
              </p>
              <p className="text-base xs:text-lg font-bold text-rose-700">
                {formatPeriodDate(nextPeriod)}
              </p>
            </div>
          </div>
        </div>
      )}

      <CycleMoodLog />

      {settings.lastPeriodStart && <PhaseSpending settings={settings} />}

      <CycleRemindersPanel settings={settings} />

      {/* Cycle journey stepper */}
      {phaseStatus && (
        <div className="neo-card p-4 xs:p-5 bg-gradient-to-r from-pink-50 to-violet-50">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 text-center">
            ✨ Your cycle journey ✨
          </p>
          <div className="flex items-center justify-between gap-1">
            {phasesWithCurrent.map((phase, idx) => (
              <div key={phase.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-9 h-9 xs:w-10 xs:h-10 rounded-full flex items-center justify-center text-base xs:text-lg border-2 transition-all ${
                      phase.isCurrent
                        ? `${phase.ringClass} border-white shadow-md scale-110`
                        : 'bg-white border-rose-200 opacity-60'
                    }`}
                  >
                    {phase.emoji}
                  </div>
                  <span className={`text-[8px] xs:text-[10px] font-bold mt-1 truncate w-full text-center ${
                    phase.isCurrent ? 'text-rose-600' : 'text-rose-300'
                  }`}>
                    {phase.shortLabel}
                  </span>
                </div>
                {idx < phasesWithCurrent.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-0.5 rounded-full ${
                    phasesWithCurrent[idx + 1].isCurrent || phase.isCurrent ? 'bg-rose-300' : 'bg-rose-100'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All phases */}
      <div className="neo-card overflow-hidden">
        <div className="p-4 xs:p-5 bg-gradient-to-r from-violet-50 to-rose-50 border-b-2 border-violet-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <div>
              <h3 className="text-sm xs:text-base font-bold text-violet-700">All your phases</h3>
              <p className="text-[10px] xs:text-xs text-violet-400 font-bold">Every season of your cycle is beautiful</p>
            </div>
          </div>
        </div>
        <div className="p-4 xs:p-6 space-y-3">
          {phasesWithCurrent.map((phase) => (
            <div
              key={phase.id}
              className={`rounded-xl p-3 xs:p-4 border-2 transition-all ${
                phase.isCurrent
                  ? `${phase.colorClass} ${phase.borderClass} neo-shadow-lg scale-[1.01]`
                  : 'bg-white border-rose-100 neo-shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xl">{phase.emoji}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${phase.colorClass} border ${phase.borderClass}`}>
                  {phase.name}
                </span>
                <span className="text-[10px] xs:text-xs text-rose-400 font-bold italic">
                  {phase.vibe}
                </span>
                {settings.lastPeriodStart && (
                  <span className="text-[10px] xs:text-xs text-muted-foreground font-bold ml-auto">
                    {phase.dayRange}
                  </span>
                )}
                {phase.isCurrent && (
                  <Badge className="text-[10px] font-bold bg-rose-400 text-white border-rose-600">
                    ✨ You are here
                  </Badge>
                )}
              </div>
              <p className="text-xs text-foreground leading-relaxed pl-8">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
