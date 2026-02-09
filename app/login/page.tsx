'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/theme-switcher'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in
  if (!loading && user) {
    router.replace('/')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    if (isSignUp) {
      const { error: err } = await signUp(email, password)
      if (err) {
        setError(err.message)
        setSubmitting(false)
        return
      }
      setSuccess('Check your email to confirm your account.')
    } else {
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(err.message)
        setSubmitting(false)
        return
      }
      router.replace('/')
      return
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-background px-3 xs:px-4 py-6 sm:py-8 relative">
      <div className="absolute top-3 right-3 xs:top-4 xs:right-4">
        <ThemeSwitcher />
      </div>
      <Card className="w-full max-w-md pixel-border border-2 xs:border-4 border-foreground/20 bg-card mx-2">
        <CardHeader className="text-center space-y-1 p-4 xs:p-6">
          <CardTitle className="text-base xs:text-lg sm:text-xl">EXPENSE TRACKER</CardTitle>
          <CardDescription className="text-[10px] xs:text-xs">
            {isSignUp ? 'Create an account' : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-4 xs:p-6 pt-0">
            {error && (
              <div className="rounded-md bg-destructive/10 text-destructive text-[10px] xs:text-xs p-2.5 xs:p-3 border border-destructive/20">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] xs:text-xs p-2.5 xs:p-3 border border-green-500/20">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] xs:text-xs">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm min-h-[44px]"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] xs:text-xs">
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="text-sm min-h-[44px]"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-4 xs:p-6 pt-0">
            <Button
              type="submit"
              className="w-full pixel-border border-2 border-foreground/30 font-bold text-sm min-h-[44px]"
              disabled={submitting}
            >
              {submitting ? '...' : isSignUp ? 'SIGN UP' : 'SIGN IN'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccess(null)
              }}
              className="text-[10px] xs:text-xs text-muted-foreground hover:text-foreground underline py-2 min-h-[44px] flex items-center justify-center"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
