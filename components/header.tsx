'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-4 xs:p-6 sm:p-8 md:p-10 border border-primary/30">
      <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between xs:gap-4 flex-wrap">
        <div className="flex items-center justify-center gap-2 xs:gap-3 flex-wrap flex-1 min-w-0 order-2 xs:order-1">
          <span className="text-lg xs:text-2xl">✨</span>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-center">
            EXPENSE
          </h1>
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-secondary text-center">
            TRACKER
          </h1>
          <span className="text-lg xs:text-2xl">✨</span>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0 order-1 xs:order-2">
          <ThemeSwitcher />
          {user && (
            <>
              <span className="text-xs text-muted-foreground truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[200px]" title={user.email ?? user.id}>
                {user.email ?? 'Signed in'}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="text-xs font-bold min-h-[44px] min-w-[44px] xs:min-h-9 xs:min-w-0 shrink-0">
                SIGN OUT
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="text-center mt-3 xs:mt-4 text-[10px] xs:text-xs sm:text-sm text-muted-foreground font-bold">
        TRACK YOUR SPENDING BEAUTIFULLY
      </p>
    </div>
  )
}
