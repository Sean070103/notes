import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Expense & Cycle Tracker',
    short_name: 'Tracker',
    description: 'Track daily expenses and your cycle beautifully',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff9db',
    theme_color: '#ff4d8d',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
