'use client'

import { useTheme } from 'next-themes'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const themes = [
  { value: 'default', label: 'Retro', color: 'bg-pink-400' },
  { value: 'avatar', label: 'Avatar', color: 'bg-cyan-500' },
  { value: 'harry-potter', label: 'Harry Potter', color: 'bg-amber-500' },
  { value: 'stranger-things', label: 'Stranger Things', color: 'bg-red-500' },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
          <Palette className="h-3.5 w-3.5" />
          THEME
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel className="text-xs">Choose theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme ?? 'default'} onValueChange={setTheme}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value} className="text-xs cursor-pointer">
              <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${t.color}`} />
              {t.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
