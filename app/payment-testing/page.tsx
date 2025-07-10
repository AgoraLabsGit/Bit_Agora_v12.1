'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TestTube, QrCode, Bitcoin } from 'lucide-react';
import QRDisplayCard from './components/QRDisplayCard';

// Mock data for testing
const COUNTRIES = [
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'PE', name: 'Peru', currency: 'PEN' },
  { code: 'UY', name: 'Uruguay', currency: 'UYU' },
];

interface TestTransaction {
  amount: string;
  currency: string;
  country: string;
  description: string;
}

export default function PaymentTestingPage() {
  const [testTransaction, setTestTransaction] = useState<TestTransaction>({
    amount: '100',
    currency: 'ARS',
    country: 'AR',
    description: 'Test payment'
  });

  const [mercadoPagoResults, setMercadoPagoResults] = useState<any>(null);
  const [btcPayResults, setBtcPayResults] = useState<any>(null);
  const [loading, setLoading] = useState({ mercado: false, btcpay: false });

  const testMercadoPago = async () => {
    setLoading(prev => ({ ...prev, mercado: true }));
    try {
      // Mock API call for now - replace with actual Mercado Pago API
      const response = await fetch('/api/payment-testing/mercado-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTransaction)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Mercado Pago QR');
      }
      
      const data = await response.json();
      setMercadoPagoResults(data);
    } catch (error) {
      console.error('Mercado Pago test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMercadoPagoResults({ error: errorMessage });
    } finally {
      setLoading(prev => ({ ...prev, mercado: false }));
    }
  };

  const testBtcPayServer = async () => {
    setLoading(prev => ({ ...prev, btcpay: true }));
    try {
      // Mock API call for now - replace with actual BTC Pay Server API
      const response = await fetch('/api/payment-testing/btcpay-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTransaction)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate BTC Pay Server invoice');
      }
      
      const data = await response.json();
      setBtcPayResults(data);
    } catch (error) {
      console.error('BTC Pay Server test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBtcPayResults({ error: errorMessage });
    } finally {
      setLoading(prev => ({ ...prev, btcpay: false }));
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Testing Lab</h1>
            <p className="text-gray-600">Isolated environment for testing new payment integrations</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Testing Environment
        </Badge>
      </div>

      {/* Test Configuration */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Transaction Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={testTransaction.amount}
              onChange={(e) => setTestTransaction(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select 
              value={testTransaction.country} 
              onValueChange={(value) => {
                const country = COUNTRIES.find(c => c.code === value);
                setTestTransaction(prev => ({ 
                  ...prev, 
                  country: value, 
                  currency: country?.currency || 'ARS' 
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={testTransaction.currency}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={testTransaction.description}
              onChange={(e) => setTestTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Test payment"
            />
          </div>
        </div>
      </Card>

      {/* Testing Tabs */}
      <Tabs defaultValue="mercado-pago" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mercado-pago" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Mercado Pago QR
          </TabsTrigger>
          <TabsTrigger value="btcpay-server" className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4" />
            BTC Pay Server
          </TabsTrigger>
        </TabsList>

        {/* Mercado Pago Testing */}
        <TabsContent value="mercado-pago">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mercado Pago QR Code Testing</h3>
              <Button 
                onClick={testMercadoPago} 
                disabled={loading.mercado}
                className="flex items-center gap-2"
              >
                {loading.mercado ? 'Generating...' : 'Generate QR Code'}
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Test Configuration</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Amount:</strong> {testTransaction.amount} {testTransaction.currency}</p>
                  <p><strong>Country:</strong> {COUNTRIES.find(c => c.code === testTransaction.country)?.name}</p>
                  <p><strong>Description:</strong> {testTransaction.description}</p>
                </div>
              </div>

              {mercadoPagoResults && !mercadoPagoResults.error && (
                <QRDisplayCard
                  title="Mercado Pago QR Code"
                  qrData={mercadoPagoResults.qr_data}
                  qrUrl={mercadoPagoResults.qr_code_url}
                  paymentId={mercadoPagoResults.payment_id}
                  status={mercadoPagoResults.status}
                  expiresAt={mercadoPagoResults.expires_at}
                  metadata={{
                    'Country': mercadoPagoResults.country_config?.country_code,
                    'Currency': mercadoPagoResults.country_config?.currency,
                    'Amount': `${mercadoPagoResults.payment_details?.amount} ${mercadoPagoResults.country_config?.currency}`,
                    'Decimals': mercadoPagoResults.country_config?.decimal_places,
                    'Min Amount': mercadoPagoResults.country_config?.min_amount,
                    'Max Amount': mercadoPagoResults.country_config?.max_amount
                  }}
                />
              )}

              {mercadoPagoResults?.error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Error</h4>
                  <p className="text-sm text-red-800">{mercadoPagoResults.error}</p>
                  {mercadoPagoResults.details && (
                    <p className="text-xs text-red-600 mt-1">{mercadoPagoResults.details}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* BTC Pay Server Testing */}
        <TabsContent value="btcpay-server">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">BTC Pay Server Testing</h3>
              <Button 
                onClick={testBtcPayServer} 
                disabled={loading.btcpay}
                className="flex items-center gap-2"
              >
                {loading.btcpay ? 'Creating Invoice...' : 'Create Invoice'}
                <Bitcoin className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Test Configuration</h4>
                <div className="text-sm text-orange-800 space-y-1">
                  <p><strong>Amount:</strong> {testTransaction.amount} {testTransaction.currency}</p>
                  <p><strong>Description:</strong> {testTransaction.description}</p>
                  <p><strong>Payment Methods:</strong> Bitcoin, Lightning Network</p>
                </div>
              </div>

              {btcPayResults && !btcPayResults.error && (
                <div className="space-y-4">
                  <QRDisplayCard
                    title="Bitcoin On-Chain Payment"
                    qrData={btcPayResults.crypto_amounts?.bitcoin?.qr_code || ''}
                    qrUrl={btcPayResults.checkout_link}
                    paymentId={btcPayResults.invoice_id}
                    status={btcPayResults.status}
                    expiresAt={btcPayResults.timing?.expires_at}
                    metadata={{
                      'BTC Amount': btcPayResults.crypto_amounts?.bitcoin?.amount,
                      'Address': btcPayResults.crypto_amounts?.bitcoin?.address?.slice(0, 20) + '...',
                      'Confirmations': btcPayResults.payment_methods?.find((m: any) => m.type === 'bitcoin')?.confirmation_blocks,
                      'Network Fee': btcPayResults.fees?.network_fee_estimate + ' BTC'
                    }}
                  />
                  
                  <QRDisplayCard
                    title="Lightning Network Payment"
                    qrData={btcPayResults.crypto_amounts?.lightning?.qr_code || ''}
                    qrUrl={btcPayResults.checkout_link}
                    paymentId={btcPayResults.invoice_id + '_ln'}
                    status={btcPayResults.status}
                    expiresAt={btcPayResults.crypto_amounts?.lightning?.expires_at}
                    metadata={{
                      'Satoshis': btcPayResults.crypto_amounts?.lightning?.amount_sats?.toLocaleString(),
                      'Invoice': btcPayResults.crypto_amounts?.lightning?.invoice?.slice(0, 30) + '...',
                      'Instant': 'Yes',
                      'Lightning Fee': btcPayResults.fees?.lightning_fee_estimate + ' BTC'
                    }}
                  />
                </div>
              )}

              {btcPayResults?.error && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Error</h4>
                  <p className="text-sm text-red-800">{btcPayResults.error}</p>
                  {btcPayResults.details && (
                    <p className="text-xs text-red-600 mt-1">{btcPayResults.details}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Notes */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-3">Testing Notes</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• This is an isolated testing environment - no real payments will be processed</p>
          <p>• API endpoints will be mocked until integration is complete</p>
          <p>• All test data is logged for debugging purposes</p>
          <p>• Use different amounts and countries to test various scenarios</p>
        </div>
      </Card>
    </div>
  );
} 