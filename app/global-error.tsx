'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Application Error
              </h2>
              <p className="text-muted-foreground mb-4">
                A critical error occurred. Please refresh the page or contact support.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mb-4">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 