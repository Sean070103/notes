'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  checkCycleReminders,
  loadReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
  type ReminderSettings,
} from '@/lib/cycle-reminders'
import type { CycleSettings } from '@/lib/cycle-phases'

interface CycleRemindersPanelProps {
  settings: CycleSettings
}

export function CycleRemindersPanel({ settings }: CycleRemindersPanelProps) {
  const [reminders, setReminders] = useState<ReminderSettings>(loadReminderSettings)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    } else {
      setPermission('unsupported')
    }
  }, [])

  useEffect(() => {
    checkCycleReminders(settings, reminders)
  }, [settings, reminders])

  const update = (patch: Partial<ReminderSettings>) => {
    const next = { ...reminders, ...patch }
    setReminders(next)
    saveReminderSettings(next)
  }

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setPermission(granted ? 'granted' : Notification.permission)
  }

  if (!settings.lastPeriodStart) return null

  return (
    <div className="neo-card overflow-hidden">
      <div className="p-4 xs:p-5 bg-gradient-to-r from-violet-50 to-rose-50 border-b-2 border-violet-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <div>
            <h3 className="text-sm xs:text-base font-bold text-violet-700">Gentle reminders</h3>
            <p className="text-[10px] xs:text-xs text-violet-400 font-bold">We&apos;ll nudge you when it matters</p>
          </div>
        </div>
      </div>
      <div className="p-4 xs:p-5 space-y-4">
        {permission !== 'granted' && permission !== 'unsupported' && (
          <Button
            onClick={enableNotifications}
            variant="outline"
            className="w-full font-bold border-violet-300 text-violet-700"
          >
            🔔 Enable notifications
          </Button>
        )}
        {permission === 'denied' && (
          <p className="text-[10px] text-rose-500 font-bold">
            Notifications blocked — enable them in your browser settings.
          </p>
        )}
        {permission === 'unsupported' && (
          <p className="text-[10px] text-muted-foreground font-bold">
            Notifications not supported in this browser.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-bold text-rose-600">Period reminder</Label>
          <Switch
            checked={reminders.periodReminder}
            onCheckedChange={(v) => update({ periodReminder: v })}
          />
        </div>
        {reminders.periodReminder && (
          <div className="flex gap-2">
            {[1, 2, 3, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => update({ periodDaysBefore: d })}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border-2 ${
                  reminders.periodDaysBefore === d
                    ? 'border-rose-400 bg-rose-100 text-rose-700'
                    : 'border-rose-100 text-rose-400'
                }`}
              >
                {d}d before
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-bold text-rose-600">Ovulation reminder</Label>
          <Switch
            checked={reminders.ovulationReminder}
            onCheckedChange={(v) => update({ ovulationReminder: v })}
          />
        </div>
      </div>
    </div>
  )
}
