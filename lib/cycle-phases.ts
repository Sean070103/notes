export type CyclePhaseId = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export type CyclePhase = {
  id: CyclePhaseId
  name: string
  shortLabel: string
  emoji: string
  vibe: string
  description: string
  tips: string
  colorClass: string
  borderClass: string
  ringClass: string
}

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: 'menstrual',
    name: 'Menstrual',
    shortLabel: 'Cozy rest',
    emoji: '🩷',
    vibe: 'Rest & recharge',
    description: 'Your sweet reset week — let your body unwind and start fresh.',
    tips: 'Wrap up in something cozy, sip warm tea, and be extra gentle with yourself. You deserve it!',
    colorClass: 'bg-rose-100 text-rose-700',
    borderClass: 'border-rose-300',
    ringClass: 'bg-rose-400',
  },
  {
    id: 'follicular',
    name: 'Follicular',
    shortLabel: 'Fresh start',
    emoji: '🌸',
    vibe: 'Blooming energy',
    description: 'Estrogen is rising and your energy is waking up — like spring after winter.',
    tips: 'Perfect time for new habits, cute workouts, and dreaming up your next adventure!',
    colorClass: 'bg-pink-50 text-pink-600',
    borderClass: 'border-pink-200',
    ringClass: 'bg-pink-400',
  },
  {
    id: 'ovulation',
    name: 'Ovulation',
    shortLabel: 'Glow time',
    emoji: '✨',
    vibe: 'Main character era',
    description: 'Your most radiant window — confidence and glow are at their peak.',
    tips: 'You might feel extra social and magnetic. Listen to your body and shine!',
    colorClass: 'bg-fuchsia-100 text-fuchsia-700',
    borderClass: 'border-fuchsia-300',
    ringClass: 'bg-fuchsia-400',
  },
  {
    id: 'luteal',
    name: 'Luteal',
    shortLabel: 'Wind down',
    emoji: '🌙',
    vibe: 'Soft & snuggly',
    description: 'Your body is nesting — cozy vibes, comfort food, and early bedtimes feel so right.',
    tips: 'Cravings and mood swings are totally normal. Prioritize sleep, snacks, and self-love.',
    colorClass: 'bg-violet-100 text-violet-700',
    borderClass: 'border-violet-300',
    ringClass: 'bg-violet-400',
  },
]

export type CycleSettings = {
  lastPeriodStart: string // YYYY-MM-DD
  cycleLength: number
  periodLength: number
}

export type PhaseStatus = {
  phase: CyclePhase
  dayInPhase: number
  phaseDayRange: string
  cycleDay: number
  daysUntilNextPeriod: number | null
}

function daysBetween(start: Date, end: Date): number {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/** Cycle day 1 = first day of last period */
export function getCycleDay(settings: CycleSettings, onDate: Date = new Date()): number {
  const start = parseLocal(settings.lastPeriodStart)
  const diff = daysBetween(start, onDate)
  if (diff < 0) return 1
  return (diff % settings.cycleLength) + 1
}

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getOvulationDay(cycleLength: number): number {
  return Math.max(cycleLength - 14, cycleLength / 2)
}

export function getPhaseForCycleDay(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): CyclePhaseId {
  const ovulation = getOvulationDay(cycleLength)
  const ovulationStart = Math.max(periodLength + 1, ovulation - 1)
  const ovulationEnd = Math.min(cycleLength, ovulation + 1)

  if (cycleDay <= periodLength) return 'menstrual'
  if (cycleDay < ovulationStart) return 'follicular'
  if (cycleDay <= ovulationEnd) return 'ovulation'
  return 'luteal'
}

export function getPhaseStatus(settings: CycleSettings, onDate: Date = new Date()): PhaseStatus | null {
  if (!settings.lastPeriodStart) return null
  const cycleDay = getCycleDay(settings, onDate)
  const phaseId = getPhaseForCycleDay(cycleDay, settings.cycleLength, settings.periodLength)
  const phase = CYCLE_PHASES.find((p) => p.id === phaseId)!
  const ovulation = getOvulationDay(settings.cycleLength)
  const ovulationStart = Math.max(settings.periodLength + 1, ovulation - 1)
  const ovulationEnd = Math.min(settings.cycleLength, ovulation + 1)

  let phaseStart: number
  let phaseEnd: number
  switch (phaseId) {
    case 'menstrual':
      phaseStart = 1
      phaseEnd = settings.periodLength
      break
    case 'follicular':
      phaseStart = settings.periodLength + 1
      phaseEnd = ovulationStart - 1
      break
    case 'ovulation':
      phaseStart = ovulationStart
      phaseEnd = ovulationEnd
      break
    case 'luteal':
      phaseStart = ovulationEnd + 1
      phaseEnd = settings.cycleLength
      break
  }

  const dayInPhase = cycleDay - phaseStart + 1
  const daysUntilNextPeriod =
    cycleDay <= settings.cycleLength ? settings.cycleLength - cycleDay + 1 : null

  return {
    phase,
    cycleDay,
    dayInPhase,
    phaseDayRange: `Days ${phaseStart}–${phaseEnd}`,
    daysUntilNextPeriod,
  }
}

/** Next predicted period start on or after fromDate */
export function getNextPeriodDate(
  settings: CycleSettings,
  fromDate: Date = new Date()
): Date | null {
  if (!settings.lastPeriodStart) return null
  const start = parseLocal(settings.lastPeriodStart)
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  let next = new Date(start)
  while (next <= from) {
    next = new Date(
      next.getFullYear(),
      next.getMonth(),
      next.getDate() + settings.cycleLength
    )
  }
  return next
}

export function formatPeriodDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  })
}
