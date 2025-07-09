"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">BitAgora Conversion Rate Test</h1>
      
      <Card className="p-6 mb-6">
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

      {results && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </Card>
      )}

      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">What This Tests</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Strike API connection and authentication</li>
          <li>✅ Lightning invoice generation</li>
          <li>✅ USD to Bitcoin conversion rates</li>
          <li>✅ Exchange rate caching and fallback</li>
          <li>✅ Error handling and logging</li>
        </ul>
      </Card>
    </div>
  )
} 