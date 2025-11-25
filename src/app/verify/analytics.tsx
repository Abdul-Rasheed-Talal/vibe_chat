'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = `${pathname}?${searchParams}`
    
    // Here you can send to your analytics service
    console.log('Page view:', url)
    
    // Example: Google Analytics
    // gtag('config', 'GA_MEASUREMENT_ID', { page_path: url });
  }, [pathname, searchParams])

  return null
}