'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ExpensesProvider } from '@/lib/expenses-context'
import { DailyExpenses } from '@/components/daily-expenses'
import { Header } from '@/components/header'
import { DateSelector } from '@/components/date-selector'
import { CalendarView } from '@/components/calendar-view'
import { StatsView } from '@/components/stats-view'
import { ProfileSection } from '@/components/profile-section'
import { ExpenseSummary } from '@/components/expense-summary'
import { ExpenseSearch } from '@/components/expense-search'
import { RecurringExpenses } from '@/components/recurring-expenses'
import { OnboardingDialog, isOnboardingComplete } from '@/components/onboarding-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SummarySkeleton } from '@/components/loading-skeleton'

type TabId = 'daily' | 'calendar' | 'stats' | 'cycle'

const CYCLE_STORAGE_KEY = 'cycle-profile-settings'

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMonth, setViewMonth] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('daily')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)

  const summaryDate = activeTab === 'daily' ? selectedDate : viewMonth

  useEffect(() => {
    setMounted(true)
    if (!isOnboardingComplete()) {
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const handleCalendarDaySelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setActiveTab('daily')
  }, [])

  const handleCycleSetup = useCallback((lastPeriod: string, cycleLength: number) => {
    const settings = {
      lastPeriodStart: lastPeriod,
      cycleLength,
      periodLength: 5,
    }
    localStorage.setItem(CYCLE_STORAGE_KEY, JSON.stringify(settings))
    setCycleKey((k) => k + 1)
  }, [])

  if (!mounted || loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-4xl px-4">
          <SummarySkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-3 py-4 xs:px-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <ExpensesProvider>
        <div className="max-w-4xl mx-auto w-full min-w-0">
          <Header />
          <ExpenseSummary referenceDate={summaryDate} />

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabId)}
            className="mt-4 sm:mt-6 md:mt-8"
          >
            <TabsList className="w-full grid grid-cols-2 xs:grid-cols-4 h-auto p-1 gap-1 sm:w-auto sm:inline-flex sm:h-10 sm:gap-0">
              <TabsTrigger
                value="daily"
                className="py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 md:px-4"
              >
                DAILY
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 md:px-4"
              >
                CALENDAR
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 md:px-4"
              >
                STATS
              </TabsTrigger>
              <TabsTrigger
                value="cycle"
                className="py-2.5 xs:py-3 text-[10px] xs:text-xs sm:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3 md:px-4"
              >
                🌸 CYCLE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
              <div className="space-y-4 sm:space-y-6">
                <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
                <DailyExpenses selectedDate={selectedDate} />
                <RecurringExpenses />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
              <CalendarView
                currentMonth={viewMonth}
                onMonthChange={setViewMonth}
                onDaySelect={handleCalendarDaySelect}
              />
            </TabsContent>

            <TabsContent value="stats" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
              <div className="space-y-4 sm:space-y-6">
                <StatsView currentMonth={viewMonth} onMonthChange={setViewMonth} />
                <ExpenseSearch />
              </div>
            </TabsContent>

            <TabsContent value="cycle" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
              <ProfileSection key={cycleKey} />
            </TabsContent>
          </Tabs>
        </div>

        <OnboardingDialog
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
          onCycleSetup={handleCycleSetup}
        />
      </ExpensesProvider>
    </main>
  )
}
