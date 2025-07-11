// /components/pos/StatusBar.tsx
// System status bar for POS interface

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  Server, 
  Users, 
  Clock,
  Bell,
  X,
  Loader2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from "@/lib/utils"

interface StatusBarProps {
  className?: string;
}

interface SystemStatus {
  networkConnection: 'connected' | 'disconnected' | 'unstable';
  strikeApi: 'connected' | 'disconnected' | 'error';
  paymentServices: 'active' | 'inactive' | 'error';
  transactionQueue: number;
  activeCustomers: number;
  lastChecked: Date;
  online: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  persistent?: boolean;
}

export default function StatusBar({ className }: StatusBarProps) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    networkConnection: 'connected',
    strikeApi: 'connected',
    paymentServices: 'active',
    transactionQueue: 0,
    activeCustomers: 2,
    lastChecked: new Date(),
    online: true
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock system status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastChecked: new Date(),
        transactionQueue: Math.max(0, prev.transactionQueue + Math.floor(Math.random() * 3) - 1),
        activeCustomers: Math.max(0, prev.activeCustomers + Math.floor(Math.random() * 3) - 1)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-500';
      case 'disconnected':
      case 'inactive':
        return 'bg-red-500';
      case 'unstable':
      case 'error':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (type: string, status: string) => {
    switch (type) {
      case 'network':
        return status === 'connected' ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        );
      case 'strike':
        return status === 'connected' ? (
          <Server className="h-4 w-4 text-green-500" />
        ) : (
          <Server className="h-4 w-4 text-red-500" />
        );
      case 'payment':
        return status === 'active' ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        );
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={`bg-background border-b border-border ${className}`}>
      <div className="max-w-full mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - System Status */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.networkConnection)}`} />
              {getStatusIcon('network', systemStatus.networkConnection)}
              <span className="text-sm font-medium capitalize">
                {systemStatus.networkConnection}
              </span>
            </div>

            {/* Strike API Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.strikeApi)}`} />
              {getStatusIcon('strike', systemStatus.strikeApi)}
              <span className="text-sm font-medium">
                Strike {systemStatus.strikeApi}
              </span>
            </div>

            {/* Payment Services Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus.paymentServices)}`} />
              {getStatusIcon('payment', systemStatus.paymentServices)}
              <span className="text-sm font-medium capitalize">
                {systemStatus.paymentServices}
              </span>
            </div>
          </div>

          {/* Center - Transaction Queue */}
          <div className="flex items-center gap-4">
            {systemStatus.transactionQueue > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {systemStatus.transactionQueue} pending
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {systemStatus.activeCustomers} active
              </span>
            </div>
          </div>

          {/* Right Side - Notifications & Time */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-8 w-8 p-0"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </div>
                )}
              </Button>

              {/* Notifications Panel */}
              {showNotifications && (
                <Card className="absolute top-10 right-0 w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Notifications</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No new notifications</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-2 p-2 rounded-lg bg-background border"
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                              {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                              {notification.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissNotification(notification.id)}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Current Time */}
            <div className="text-sm font-medium">
              {formatTime(systemStatus.lastChecked)}
            </div>

            {/* Overall Status Badge */}
            <Badge variant={systemStatus.online ? 'default' : 'destructive'}>
              {systemStatus.online ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
} 