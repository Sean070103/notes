'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ExpensesProvider } from '@/lib/expenses-context'
import { DailyExpenses } from '@/components/daily-expenses'
import { Header } from '@/components/header'
import { DateSelector } from '@/components/date-selector'
import { CalendarView } from '@/components/calendar-view'
import { StatsView } from '@/components/stats-view'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar' | 'stats'>('daily')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (!mounted || loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-3 py-4 xs:px-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <ExpensesProvider>
      <div className="max-w-4xl mx-auto w-full min-w-0">
        <Header />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'daily' | 'calendar' | 'stats')} className="mt-4 sm:mt-6 md:mt-8">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1 sm:w-auto sm:inline-flex sm:h-10">
            <TabsTrigger value="daily" className="py-3 text-xs xs:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-4">
              DAILY
            </TabsTrigger>
            <TabsTrigger value="calendar" className="py-3 text-xs xs:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-4">
              CALENDAR
            </TabsTrigger>
            <TabsTrigger value="stats" className="py-3 text-xs xs:text-sm font-bold rounded-md data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-4">
              STATS
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
            <div className="space-y-4 sm:space-y-6">
              <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
              <DailyExpenses selectedDate={selectedDate} />
            </div>
          </TabsContent>
          <TabsContent value="calendar" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
            <CalendarView />
          </TabsContent>
          <TabsContent value="stats" className="mt-4 sm:mt-6 md:mt-8 focus-visible:outline-none">
            <StatsView />
          </TabsContent>
        </Tabs>
      </div>
      </ExpensesProvider>
    </main>
  )
}
