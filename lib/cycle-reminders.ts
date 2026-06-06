import { getPhaseForCycleDay, getPhaseStatus, type CycleSettings } from '@/lib/cycle-phases'

export type ReminderSettings = {
  periodReminder: boolean
  periodDaysBefore: number
  ovulationReminder: boolean
}

const REMINDER_STORAGE_KEY = 'cycle-reminder-settings'
const LAST_NOTIFIED_KEY = 'cycle-last-notified'

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  periodReminder: true,
  periodDaysBefore: 2,
  ovulationReminder: false,
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY)
    if (stored) return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(stored) }
  } catch {
    /* ignore */
  }
  return DEFAULT_REMINDER_SETTINGS
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings))
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function getLastNotified(): Record<string, string> {
  try {
    const stored = localStorage.getItem(LAST_NOTIFIED_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* ignore */
  }
  return {}
}

function markNotified(key: string): void {
  const map = getLastNotified()
  map[key] = new Date().toISOString().slice(0, 10)
  localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(map))
}

function wasNotifiedToday(key: string): boolean {
  const map = getLastNotified()
  const today = new Date().toISOString().slice(0, 10)
  return map[key] === today
}

export function checkCycleReminders(
  settings: CycleSettings,
  reminderSettings: ReminderSettings
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted' || !settings.lastPeriodStart) return

  const status = getPhaseStatus(settings)
  if (!status) return

  if (
    reminderSettings.periodReminder &&
    status.daysUntilNextPeriod != null &&
    status.daysUntilNextPeriod === reminderSettings.periodDaysBefore &&
    !wasNotifiedToday('period')
  ) {
    new Notification('🩷 Period coming soon', {
      body: `Your period is expected in about ${reminderSettings.periodDaysBefore} days. Take care of yourself!`,
      icon: '/icon.svg',
    })
    markNotified('period')
  }

  const phaseId = getPhaseForCycleDay(
    status.cycleDay,
    settings.cycleLength,
    settings.periodLength
  )
  if (
    reminderSettings.ovulationReminder &&
    phaseId === 'ovulation' &&
    status.dayInPhase === 1 &&
    !wasNotifiedToday('ovulation')
  ) {
    new Notification('✨ Ovulation window', {
      body: "You're in your ovulation phase today — glow time!",
      icon: '/icon.svg',
    })
    markNotified('ovulation')
  }
}
