import { NextRequest, NextResponse } from 'next/server';

interface TestTransaction {
  amount: string;
  currency: string;
  country: string;
  description: string;
}

// Mock BTC Pay Server invoice response
export async function POST(request: NextRequest) {
  try {
    const transaction: TestTransaction = await request.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate mock Bitcoin/Lightning data
    const invoiceId = `btcpay_test_${Date.now()}`;
    const mockBtcAmount = (parseFloat(transaction.amount) / 111000).toFixed(8); // Mock BTC rate
    const mockSatoshiAmount = Math.floor(parseFloat(mockBtcAmount) * 100000000);
    
    // Mock response based on BTC Pay Server API structure
    const mockResponse = {
      success: true,
      invoice_id: invoiceId,
      checkout_link: `https://btcpay.example.com/invoice?id=${invoiceId}`,
      status: 'new',
      amount: parseFloat(transaction.amount),
      currency: transaction.currency,
      crypto_amounts: {
        bitcoin: {
          amount: mockBtcAmount,
          address: `bc1q${Math.random().toString(36).substr(2, 39)}`,
          qr_code: `bitcoin:bc1q${Math.random().toString(36).substr(2, 39)}?amount=${mockBtcAmount}&label=${encodeURIComponent(transaction.description)}`,
          payment_url: `bitcoin:bc1q${Math.random().toString(36).substr(2, 39)}?amount=${mockBtcAmount}`
        },
        lightning: {
          amount_sats: mockSatoshiAmount,
          invoice: `lnbc${mockSatoshiAmount}n1p${Math.random().toString(36).substr(2, 50)}`,
          qr_code: `lightning:lnbc${mockSatoshiAmount}n1p${Math.random().toString(36).substr(2, 50)}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
      },
      payment_methods: [
        {
          type: 'bitcoin',
          name: 'Bitcoin (On-Chain)',
          enabled: true,
          confirmation_blocks: 1
        },
        {
          type: 'lightning',
          name: 'Lightning Network',
          enabled: true,
          instant: true
        }
      ],
      order_details: {
        order_id: `order_${Date.now()}`,
        description: transaction.description,
        metadata: {
          test_mode: true,
          country: transaction.country,
          created_via: 'BitAgora Testing Lab'
        }
      },
      timing: {
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        expiration_minutes: 1440
      },
      btcpay_config: {
        store_id: 'test_store_123',
        webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/btcpay-server`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-testing`,
        notification_email: 'test@bitagora.com'
      },
      fees: {
        network_fee_estimate: '0.00001500', // BTC
        lightning_fee_estimate: '0.00000100', // BTC
        btcpay_fee: '0.00000000' // No BTC Pay Server fees
      },
      exchange_rates: {
        [`${transaction.currency}_BTC`]: parseFloat(mockBtcAmount) / parseFloat(transaction.amount),
        [`BTC_${transaction.currency}`]: parseFloat(transaction.amount) / parseFloat(mockBtcAmount),
        rate_source: 'CoinGecko',
        last_updated: new Date().toISOString()
      },
      test_mode: true
    };

    console.log('🧪 BTC Pay Server Test API Response:', {
      invoice_id: mockResponse.invoice_id,
      amount: `${transaction.amount} ${transaction.currency}`,
      btc_amount: mockBtcAmount,
      lightning_sats: mockSatoshiAmount,
      country: transaction.country
    });

    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('❌ BTC Pay Server test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate test invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 