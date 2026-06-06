'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateKey } from '@/lib/utils'

export type CycleLog = {
  date: string
  mood: number
  symptoms: string[]
  note: string
}

const MOOD_OPTIONS = [
  { value: 1, emoji: '😢', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '🥰', label: 'Amazing' },
]

const SYMPTOM_OPTIONS = [
  { id: 'cramps', label: 'Cramps', emoji: '🩹' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'happy', label: 'Happy', emoji: '💕' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡' },
]

const STORAGE_KEY = 'cycle-logs'

interface CycleMoodLogProps {
  selectedDate?: Date
}

export function CycleMoodLog({ selectedDate = new Date() }: CycleMoodLogProps) {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [logs, setLogs] = useState<Record<string, CycleLog>>({})
  const [mood, setMood] = useState(3)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const dateKey = formatDateKey(selectedDate)

  const loadLogs = useCallback(async () => {
    if (supabase && user) {
      const { data } = await supabase
        .from('cycle_logs')
        .select('log_date, mood, symptoms, note')
        .eq('user_id', user.id)
      if (data) {
        const map: Record<string, CycleLog> = {}
        for (const row of data as { log_date: string; mood: number; symptoms: string[]; note: string }[]) {
          map[row.log_date] = {
            date: row.log_date,
            mood: row.mood,
            symptoms: row.symptoms ?? [],
            note: row.note ?? '',
          }
        }
        setLogs(map)
        return
      }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLogs(JSON.parse(stored))
    } catch {
      /* ignore */
    }
  }, [supabase, user])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    const existing = logs[dateKey]
    if (existing) {
      setMood(existing.mood)
      setSymptoms(existing.symptoms)
      setNote(existing.note)
    } else {
      setMood(3)
      setSymptoms([])
      setNote('')
    }
  }, [dateKey, logs])

  const toggleSymptom = (id: string) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const saveLog = async () => {
    setSaving(true)
    const entry: CycleLog = { date: dateKey, mood, symptoms, note }
    const next = { ...logs, [dateKey]: entry }
    setLogs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

    if (supabase && user) {
      await supabase.from('cycle_logs').upsert(
        {
          user_id: user.id,
          log_date: dateKey,
          mood,
          symptoms,
          note,
        },
        { onConflict: 'user_id,log_date' }
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="neo-card overflow-hidden">
      <div className="p-4 xs:p-5 bg-gradient-to-r from-rose-50 to-violet-50 border-b-2 border-rose-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">📔</span>
          <div>
            <h3 className="text-sm xs:text-base font-bold text-rose-700">Daily check-in</h3>
            <p className="text-[10px] xs:text-xs text-rose-400 font-bold">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 xs:p-5 space-y-4">
        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">How are you feeling?</p>
          <div className="flex justify-between gap-1">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 transition-all ${
                  mood === opt.value
                    ? 'border-rose-400 bg-rose-50 scale-105'
                    : 'border-transparent bg-muted/50'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-[8px] xs:text-[10px] font-bold text-rose-500 mt-0.5">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-rose-600 mb-2">Symptoms & vibes</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSymptom(s.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] xs:text-xs font-bold border-2 transition ${
                  symptoms.includes(s.id)
                    ? 'border-rose-400 bg-rose-100 text-rose-700'
                    : 'border-rose-100 bg-white text-rose-400'
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-bold text-rose-600">Notes (optional)</p>
          <Input
            placeholder="How's your day going?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[44px] text-sm border-rose-200"
          />
        </div>

        <Button
          onClick={saveLog}
          disabled={saving}
          className="w-full sm:w-auto min-h-[44px] font-bold bg-rose-400 hover:bg-rose-500 text-white"
        >
          {saving ? 'Saving...' : saved ? '💕 Saved!' : '💕 Save check-in'}
        </Button>
      </div>
    </div>
  )
}
