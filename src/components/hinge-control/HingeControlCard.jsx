
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Unlock, 
  Camera, 
  Video,
  Wifi, 
  WifiOff, 
  Battery,
  Thermometer,
  Shield,
  AlertTriangle,
  DoorOpen,
  Settings
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const statusColors = {
  locked: "bg-red-100 text-red-800 border-red-200",
  unlocked: "bg-green-100 text-green-800 border-green-200",
  transitioning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  error: "bg-red-100 text-red-800 border-red-200"
};

const doorStateColors = {
  open: "bg-orange-100 text-orange-800 border-orange-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  unknown: "bg-gray-100 text-gray-500 border-gray-200"
};

export default function HingeControlCard({ 
  device, 
  state, 
  onSendCommand, 
  onSelect, 
  isSelected 
}) {
  const [isCommandPending, setIsCommandPending] = useState(null);

  const handleCommand = async (commandType, args = {}) => {
    if (isCommandPending) return;
    
    setIsCommandPending(commandType);
    try {
      await onSendCommand(device.id, commandType, args);
      // Show success feedback
    } catch (error) {
      console.error('Command failed:', error);
      // Show error feedback
    } finally {
      setTimeout(() => setIsCommandPending(null), 1500);
    }
  };

  const handleSnapshot = () => {
    handleCommand('SNAPSHOT', { upload: true, quality: 85 });
  };
  
  const handleRecordClip = () => {
    handleCommand('VIDEO_CLIP', { durationSec: 6, upload: true, quality: 18 });
  };

  if (!state) {
    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 opacity-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{device.name}</h3>
              <p className="text-gray-400 text-sm">{device.location}</p>
            </div>
            <Badge className="bg-gray-600 text-gray-300">No State Data</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border transition-all duration-300 ${
      isSelected 
        ? 'border-blue-500/50 ring-1 ring-500/30' 
        : 'border-blue-700/30 hover:border-blue-500/50'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl text-white">{device.name}</CardTitle>
              <div className="flex items-center gap-2">
                {device.is_online ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                {state.tamper_detected && (
                  <Shield className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            <p className="text-blue-200 text-sm mt-1">{device.location}</p>
            <p className="text-blue-300/60 text-xs">
              {device.device_id} • Last seen {formatDistanceToNow(new Date(device.last_seen_at))} ago
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${statusColors[state.lock_state]} border text-xs font-medium`}>
              {state.lock_state.toUpperCase()}
            </Badge>
            <Badge className={`${doorStateColors[state.door_state]} border text-xs`}>
              {state.door_state === 'open' ? 'Door Open' : state.door_state === 'closed' ? 'Door Closed' : 'Unknown'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {state.hinge_angle?.toFixed(0) || 0}°
            </div>
            <div className="text-xs text-blue-300">Angle</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold text-white">
              {state.rssi}
              <Wifi className="w-4 h-4" />
            </div>
            <div className="text-xs text-blue-300">dBm</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold text-white">
              {state.temperature?.toFixed(1)}
              <Thermometer className="w-4 h-4" />
            </div>
            <div className="text-xs text-blue-300">°C</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-white">
              {Math.floor((state.uptime_seconds || 0) / 3600)}h
            </div>
            <div className="text-xs text-blue-300">Uptime</div>
          </div>
        </div>

        {/* Alerts */}
        {state.tamper_detected && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-300 font-medium">Tamper Detected</div>
              <div className="text-red-400 text-sm">Security alert - unauthorized access attempt detected</div>
            </div>
          </div>
        )}

        {/* Control Actions */}
        <div className="flex flex-wrap gap-3">
          {state.lock_state === 'locked' ? (
            <Button
              onClick={() => handleCommand('UNLOCK', { ttlSec: state.auto_relock_delay })}
              disabled={!!isCommandPending || !device.is_online}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4 mr-2" />
              {isCommandPending === 'UNLOCK' ? 'Unlocking...' : 'Unlock'}
            </Button>
          ) : (
            <Button
              onClick={() => handleCommand('LOCK')}
              disabled={!!isCommandPending || !device.is_online}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isCommandPending === 'LOCK' ? 'Locking...' : 'Lock'}
            </Button>
          )}

          <Button
            onClick={handleSnapshot}
            disabled={!!isCommandPending || !device.is_online}
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-900/30"
          >
            <Camera className="w-4 h-4 mr-1" />
            {isCommandPending === 'SNAPSHOT' ? '...' : 'Photo'}
          </Button>

          <Button
            onClick={handleRecordClip}
            disabled={!!isCommandPending || !device.is_online}
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
          >
            <Video className="w-4 h-4 mr-1" />
            {isCommandPending === 'VIDEO_CLIP' ? '...' : 'Clip'}
          </Button>

          <Button
            onClick={() => onSelect(device)}
            variant="ghost"
            size="icon"
            className="text-blue-300 hover:bg-blue-900/30"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Auto-relock info */}
        {state.auto_relock_enabled && state.lock_state === 'unlocked' && (
          <div className="text-xs text-blue-300/80 text-center">
            Auto-relock in {state.auto_relock_delay}s when door closes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
