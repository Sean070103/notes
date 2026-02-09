'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DailyExpenses } from '@/components/daily-expenses'
import { Header } from '@/components/header'
import { DateSelector } from '@/components/date-selector'
import { CalendarView } from '@/components/calendar-view'
import { StatsView } from '@/components/stats-view'

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
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        
        {/* Navigation Tabs */}
        <div className="mt-8 flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
              activeTab === 'daily'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            DAILY
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
              activeTab === 'calendar'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            CALENDAR
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
              activeTab === 'stats'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            STATS
          </button>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
              <DailyExpenses selectedDate={selectedDate} />
            </div>
          )}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'stats' && <StatsView />}
        </div>
      </div>
    </main>
  )
}
