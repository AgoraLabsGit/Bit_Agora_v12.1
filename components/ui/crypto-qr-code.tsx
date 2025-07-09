'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';

interface CryptoQRCodeProps {
  paymentMethod: string;
  address: string;
  amount: number;
  qrContent: string;
  className?: string;
}

export const CryptoQRCode: React.FC<CryptoQRCodeProps> = ({
  paymentMethod,
  address,
  amount,
  qrContent,
  className = ''
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsGenerating(true);
        
        // Check if qrContent is already a base64 image (for saved QR codes)
        if (qrContent.startsWith('data:image/')) {
          setQrCodeDataUrl(qrContent);
          return;
        }
        
        // Generate QR code with better options
        const qrOptions = {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' as const
        };

        const qrDataUrl = await QRCode.toDataURL(qrContent, qrOptions);
        setQrCodeDataUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    if (qrContent) {
      generateQRCode();
    }
  }, [qrContent]);

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'lightning':
        return 'Bitcoin (Lightning)';
      case 'bitcoin':
        return 'Bitcoin';
      case 'usdt-eth':
        return 'USDT (Ethereum)';
      case 'usdt-tron':
        return 'USDT (TRON)';
      case 'qr-code':
        return 'Payment';
      default:
        return 'Crypto';
    }
  };

  const getAddressLabel = () => {
    switch (paymentMethod) {
      case 'lightning':
        return 'Lightning Invoice';
      case 'bitcoin':
        return 'Bitcoin Address';
      case 'usdt-eth':
        return 'Ethereum Address';
      case 'usdt-tron':
        return 'TRON Address';
      case 'qr-code':
        return 'Payment Code';
      default:
        return 'Address';
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `${paymentMethod}-payment-qr.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-4 text-center ${className}`}>
      {/* QR Code Display */}
      <div className="bg-white p-3 rounded-lg inline-block mb-3">
        {isGenerating ? (
          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        ) : (
          <img 
            src={qrCodeDataUrl} 
            alt={`${getPaymentMethodName()} QR Code`}
            className="w-48 h-48"
          />
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-slate-300 mb-2">
        Scan with {getPaymentMethodName()} wallet
      </p>

      {/* Payment Details */}
      <div className="space-y-1 mb-3">
        <div className="text-xs text-slate-400">
          <span className="font-medium">Amount: </span>
          <span className="font-mono text-slate-300">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAddress}
          className="text-xs bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 h-8 px-2"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadQR}
          className="text-xs bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 h-8 px-2"
          disabled={isGenerating}
        >
          <Download className="w-3 h-3 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
}; 