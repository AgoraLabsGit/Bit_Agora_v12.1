/**
 * Bitcoin Payment Monitoring Test Interface
 * Test Lab Development - Isolated from Production
 * 
 * This interface allows testing Bitcoin payment monitoring
 * without interfering with the production POS system.
 */

"use client"

import { useState, useEffect } from 'react'
import { useBitcoinStatus } from '../bitcoin-monitoring/hooks/use-bitcoin-status'
import { BitcoinPaymentStatus, BitcoinAddressInfo } from '../bitcoin-monitoring/types/bitcoin-monitoring'

export default function BitcoinTestPage() {
  const [testAddress, setTestAddress] = useState('')
  const [expectedAmount, setExpectedAmount] = useState(50000) // 0.0005 BTC in satoshis
  const [usdAmount, setUSDAmount] = useState(4.00)
  const [testResults, setTestResults] = useState<string[]>([])
  const [mockMode, setMockMode] = useState(true)

  // Bitcoin monitoring hook
  const {
    status,
    isMonitoring,
    error,
    addressInfo,
    startMonitoring,
    stopMonitoring,
    checkAddress,
    retry
  } = useBitcoinStatus({
    address: testAddress,
    expectedAmount,
    usdAmount,
    onPaymentReceived: (status) => {
      addTestResult(`🎉 Payment received! Status: ${status.status}`)
    },
    onPaymentConfirmed: (status) => {
      addTestResult(`✅ Payment confirmed! Confirmations: ${status.confirmations}`)
    },
    onPaymentFailed: (error) => {
      addTestResult(`❌ Payment failed: ${error}`)
    },
    onStatusUpdate: (status) => {
      addTestResult(`📊 Status update: ${status.status} (${status.confirmations} confirmations)`)
    }
  })

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleStartTest = async () => {
    if (!testAddress) {
      addTestResult('❌ Please enter a Bitcoin address')
      return
    }

    addTestResult(`🧪 Starting Bitcoin monitoring test for ${testAddress}`)
    addTestResult(`💰 Expected amount: ${expectedAmount} satoshis ($${usdAmount})`)
    
    await startMonitoring()
  }

  const handleStopTest = () => {
    addTestResult('🛑 Stopping Bitcoin monitoring test')
    stopMonitoring()
  }

  const handleCheckAddress = async () => {
    if (!testAddress) {
      addTestResult('❌ Please enter a Bitcoin address')
      return
    }

    addTestResult(`🔍 Checking Bitcoin address: ${testAddress}`)
    await checkAddress()
  }

  const handleClearResults = () => {
    setTestResults([])
  }

  const generateTestAddress = () => {
    // Generate a test Bitcoin address for testing
    const testAddresses = [
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Mainnet
      'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Testnet
      'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Another mainnet
      'tb1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'  // Another testnet
    ]
    
    const randomAddress = testAddresses[Math.floor(Math.random() * testAddresses.length)]
    setTestAddress(randomAddress)
    addTestResult(`🎲 Generated test address: ${randomAddress}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Bitcoin Payment Monitoring Test Lab
          </h1>
          <p className="text-gray-600">
            Test Bitcoin payment monitoring without affecting production systems
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">
              ⚠️ ISOLATED TEST ENVIRONMENT - Safe for Testing
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              This interface is completely isolated from your production POS system.
              Lightning payments and other production features remain untouched.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            {/* Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitcoin Address
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="Enter Bitcoin address to monitor"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={generateTestAddress}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Amount (satoshis)
                  </label>
                  <input
                    type="number"
                    value={expectedAmount}
                    onChange={(e) => setExpectedAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USD Amount
                  </label>
                  <input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUSDAmount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mockMode"
                  checked={mockMode}
                  onChange={(e) => setMockMode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="mockMode" className="text-sm font-medium text-gray-700">
                  Mock Mode (simulated data)
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={handleStartTest}
                disabled={isMonitoring}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
              </button>
              
              <button
                onClick={handleStopTest}
                disabled={!isMonitoring}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                Stop Monitoring
              </button>
              
              <button
                onClick={handleCheckAddress}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Check Address
              </button>
              
              <button
                onClick={retry}
                disabled={!error}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {status && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    status.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    status.status === 'unconfirmed' ? 'bg-yellow-100 text-yellow-800' :
                    status.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.status}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Expected:</span>
                  <span>{status.expectedAmount.toLocaleString()} sats</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Received:</span>
                  <span>{status.receivedAmount.toLocaleString()} sats</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Confirmations:</span>
                  <span>{status.confirmations} / {status.targetConfirmations}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Last Checked:</span>
                  <span>{new Date(status.lastChecked).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {addressInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Address Info:</h3>
                <div className="text-sm space-y-1">
                  <div>Balance: {addressInfo.balance.toLocaleString()} sats</div>
                  <div>Total Received: {addressInfo.totalReceived.toLocaleString()} sats</div>
                  <div>Transactions: {addressInfo.transactions.length}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results Log */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results Log</h2>
            <button
              onClick={handleClearResults}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear Log
            </button>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No test results yet. Start a test to see logs.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📋 How to Test
          </h3>
          <ol className="text-blue-800 space-y-1 text-sm">
            <li>1. Generate or enter a Bitcoin address</li>
            <li>2. Set the expected amount in satoshis</li>
            <li>3. Enable "Mock Mode" for simulated data, or disable for real blockchain testing</li>
            <li>4. Click "Start Monitoring" to begin monitoring the address</li>
            <li>5. Send Bitcoin to the address (or use mock data) to see status updates</li>
            <li>6. Monitor the status changes and confirmation progress</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 