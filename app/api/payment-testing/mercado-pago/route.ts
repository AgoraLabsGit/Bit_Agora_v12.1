import { NextRequest, NextResponse } from 'next/server';

interface TestTransaction {
  amount: string;
  currency: string;
  country: string;
  description: string;
}

// Mock Mercado Pago QR response
export async function POST(request: NextRequest) {
  try {
    const transaction: TestTransaction = await request.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response based on Mercado Pago API structure
    const mockResponse = {
      success: true,
      qr_data: `00020101021126580014BR.GOV.BCB.PIX01368c16c8e4-5c85-4b87-8b74-9e9b2a${transaction.country.toLowerCase()}52040000530398654${transaction.amount.padStart(6, '0')}5802BR5915Test Merchant6011SAO PAULO61083540-001621${Math.random().toString(36).substr(2, 9)}63042BCA`,
      qr_code_url: `https://www.mercadopago.com/qr/${Math.random().toString(36).substr(2, 20)}`,
      payment_id: `mp_test_${Date.now()}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      status: 'pending',
      merchant_info: {
        name: 'BitAgora Test Merchant',
        location: transaction.country
      },
      payment_details: {
        amount: parseFloat(transaction.amount),
        currency: transaction.currency,
        description: transaction.description,
        items: [
          {
            title: transaction.description,
            quantity: 1,
            unit_price: parseFloat(transaction.amount)
          }
        ]
      },
      country_config: {
        country_code: transaction.country,
        currency: transaction.currency,
        decimal_places: ['CL', 'CO'].includes(transaction.country) ? 0 : 2,
        min_amount: getMinAmount(transaction.country),
        max_amount: getMaxAmount(transaction.country)
      },
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercado-pago`,
      test_mode: true,
      created_at: new Date().toISOString()
    };

    console.log('🧪 Mercado Pago Test API Response:', {
      payment_id: mockResponse.payment_id,
      amount: `${transaction.amount} ${transaction.currency}`,
      country: transaction.country,
      qr_length: mockResponse.qr_data.length
    });

    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('❌ Mercado Pago test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate test QR code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getMinAmount(country: string): number {
  const minimums: Record<string, number> = {
    'AR': 100,    // 100 ARS
    'BR': 1,      // 1 BRL
    'MX': 10,     // 10 MXN
    'CO': 1000,   // 1000 COP
    'CL': 500,    // 500 CLP
    'PE': 5,      // 5 PEN
    'UY': 50      // 50 UYU
  };
  return minimums[country] || 100;
}

function getMaxAmount(country: string): number {
  const maximums: Record<string, number> = {
    'AR': 999999,   // 999,999 ARS
    'BR': 99999,    // 99,999 BRL
    'MX': 999999,   // 999,999 MXN
    'CO': 9999999,  // 9,999,999 COP
    'CL': 9999999,  // 9,999,999 CLP
    'PE': 99999,    // 99,999 PEN
    'UY': 999999    // 999,999 UYU
  };
  return maximums[country] || 999999;
} 