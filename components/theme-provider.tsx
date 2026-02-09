'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default"
      themes={['default', 'avatar', 'harry-potter', 'stranger-things']}
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
