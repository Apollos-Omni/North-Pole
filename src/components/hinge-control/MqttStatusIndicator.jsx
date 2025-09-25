import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw
} from "lucide-react";

export default function MqttStatusIndicator({ isProductionMode }) {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(new Date());
  const [retryCount, setRetryCount] = useState(0);

  const checkMqttStatus = useCallback(async () => {
    setStatus('checking');
    
    try {
      if (!isProductionMode) {
        setStatus('demo');
        return;
      }

      // In production, this would check actual MQTT connection
      // For now, simulate the check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate occasional connection issues
      const isConnected = Math.random() > 0.1; // 90% success rate
      setStatus(isConnected ? 'connected' : 'error');
      setRetryCount(0);
      
    } catch (error) {
      console.error('MQTT status check failed:', error);
      setStatus('error');
      setRetryCount(prev => prev + 1);
    }
    
    setLastCheck(new Date());
  }, [isProductionMode]);

  useEffect(() => {
    checkMqttStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkMqttStatus, 30000);
    return () => clearInterval(interval);
  }, [checkMqttStatus]);

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          text: 'MQTT Connected',
          description: 'Real-time device communication active'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          text: 'Connection Error',
          description: `Failed to connect (${retryCount} retries)`
        };
      case 'checking':
        return {
          icon: Clock,
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          text: 'Checking...',
          description: 'Testing MQTT broker connection'
        };
      case 'demo':
      default:
        return {
          icon: WifiOff,
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          text: 'Demo Mode',
          description: 'Using simulated device data'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex items-center gap-3">
      <Badge className={`${statusInfo.color} flex items-center gap-2`}>
        <StatusIcon className="w-3 h-3" />
        {statusInfo.text}
      </Badge>
      
      <div className="text-xs text-gray-400 hidden md:block">
        {statusInfo.description}
      </div>
      
      {status !== 'checking' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={checkMqttStatus}
          className="h-6 w-6 text-gray-400 hover:text-white"
          title="Refresh status"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}