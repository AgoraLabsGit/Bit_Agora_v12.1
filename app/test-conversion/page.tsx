"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/ui/header'
import { TestTube, Zap, DollarSign } from 'lucide-react'

export default function TestConversionPage() {
  const [testAmount, setTestAmount] = useState(25.00)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testConversions = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      // Test Lightning invoice generation
      const lightningResponse = await fetch('/api/lightning/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: testAmount,
          description: `Test conversion - $${testAmount}`
        })
      })

      const lightningResult = await lightningResponse.json()

      setResults({
        testAmount,
        lightning: lightningResult,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Conversion Rate Test</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/pos">
                  <Zap className="h-4 w-4 mr-2" />
                  Back to POS
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-6">
          {/* Test Controls */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Test Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Test Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0.01"
                  max="1000"
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={testConversions}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Conversion Rates'}
              </Button>
            </div>
          </Card>

          {/* Test Results */}
          {results && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Test Results</h2>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </Card>
          )}

          {/* Test Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">What This Tests</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Strike API connection and authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Lightning invoice generation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                USD to Bitcoin conversion rates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Exchange rate caching and fallback
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Error handling and logging
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
} 