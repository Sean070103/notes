'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useExpenses } from '@/lib/expenses-context'

const ONBOARDING_KEY = 'onboarding-complete'

interface OnboardingDialogProps {
  open: boolean
  onComplete: () => void
  onCycleSetup: (lastPeriod: string, cycleLength: number) => void
}

export function OnboardingDialog({ open, onComplete, onCycleSetup }: OnboardingDialogProps) {
  const { setMonthlyBudget } = useExpenses()
  const [step, setStep] = useState(0)
  const [budget, setBudget] = useState('')
  const [lastPeriod, setLastPeriod] = useState('')
  const [cycleLength, setCycleLength] = useState('28')

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onComplete()
  }

  const handleBudgetNext = async () => {
    if (budget && !isNaN(parseFloat(budget))) {
      await setMonthlyBudget(parseFloat(budget))
    }
    setStep(1)
  }

  const handleCycleNext = () => {
    if (lastPeriod) {
      onCycleSetup(lastPeriod, Number(cycleLength) || 28)
    }
    finish()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md neo-border neo-shadow-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 0 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">✨ Welcome, babe!</DialogTitle>
              <DialogDescription className="text-center">
                Let&apos;s set up your expense tracker in two quick steps.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-budget" className="text-xs font-bold">
                  Monthly budget (optional)
                </Label>
                <Input
                  id="onboard-budget"
                  type="number"
                  placeholder="e.g. 15000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-bold" onClick={() => setStep(1)}>
                  Skip
                </Button>
                <Button className="flex-1 font-bold" onClick={handleBudgetNext}>
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">🌸 Your cycle (optional)</DialogTitle>
              <DialogDescription className="text-center">
                Track your cycle alongside spending — totally optional!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-period" className="text-xs font-bold">
                  Last period started
                </Label>
                <Input
                  id="onboard-period"
                  type="date"
                  value={lastPeriod}
                  onChange={(e) => setLastPeriod(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboard-cycle" className="text-xs font-bold">
                  Cycle length (days)
                </Label>
                <Input
                  id="onboard-cycle"
                  type="number"
                  min={21}
                  max={45}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-bold" onClick={finish}>
                  Skip
                </Button>
                <Button className="flex-1 font-bold" onClick={handleCycleNext}>
                  Let&apos;s go! 💕
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}
