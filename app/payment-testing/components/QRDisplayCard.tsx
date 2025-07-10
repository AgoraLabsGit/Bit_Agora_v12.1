'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { useState } from 'react';

interface QRDisplayCardProps {
  title: string;
  qrData: string;
  qrUrl?: string;
  paymentId: string;
  status: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export default function QRDisplayCard({
  title,
  qrData,
  qrUrl,
  paymentId,
  status,
  expiresAt,
  metadata
}: QRDisplayCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      new: { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      paid: { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-200' },
      expired: { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-200' }
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 0) return 'Expired';
    if (minutes < 60) return `${minutes}m remaining`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m remaining`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          {title}
        </h4>
        {getStatusBadge(status)}
      </div>

      <div className="space-y-4">
        {/* QR Code Mock Display */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">QR Code would display here</p>
          <p className="text-xs text-gray-500 mt-1">
            Length: {qrData.length} characters
          </p>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Payment ID:</span>
            <p className="font-mono text-xs bg-gray-50 p-1 rounded mt-1 truncate">
              {paymentId}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Expires:</span>
            <p className="font-medium mt-1">{formatExpiry(expiresAt)}</p>
          </div>
        </div>

        {/* QR Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">QR Data:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(qrData)}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs bg-gray-50 p-2 rounded border max-h-20 overflow-y-auto font-mono">
            {qrData}
          </pre>
        </div>

        {/* External URL */}
        {qrUrl && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">External URL:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(qrUrl, '_blank')}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="pt-3 border-t">
            <span className="text-sm text-gray-600 mb-2 block">Additional Data:</span>
            <div className="text-xs space-y-1">
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-mono">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 