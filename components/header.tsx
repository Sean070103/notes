'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-8 sm:p-10 border border-primary/30">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center justify-center gap-3 flex-wrap flex-1 min-w-0">
          <span className="text-2xl">✨</span>
          <h1 className="text-2xl sm:text-4xl font-bold text-primary text-center">
            EXPENSE
          </h1>
          <h1 className="text-2xl sm:text-4xl font-bold text-secondary text-center">
            TRACKER
          </h1>
          <span className="text-2xl">✨</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeSwitcher />
          {user && (
            <>
              <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]" title={user.email ?? user.id}>
                {user.email ?? 'Signed in'}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="text-xs font-bold">
                SIGN OUT
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="text-center mt-4 text-xs sm:text-sm text-muted-foreground font-bold">
        TRACK YOUR SPENDING BEAUTIFULLY
      </p>
    </div>
  )
}
