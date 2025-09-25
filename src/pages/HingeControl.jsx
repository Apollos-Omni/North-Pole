
import React, { useState, useEffect, useCallback } from "react";
import { HingeDevice } from "@/api/entities";
import { HingeState } from "@/api/entities";
import { HingeEvent } from "@/api/entities";
import { HingeCommand } from "@/api/entities";
import { MediaAsset } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lock, 
  Unlock, 
  Camera, 
  Wifi, 
  WifiOff, 
  Battery,
  Thermometer,
  Clock,
  Shield,
  AlertTriangle,
  Plus,
  Zap, // Added for DeploymentGuide
  Download, // Added for DeploymentGuide
  Settings, // Added for DeploymentGuide
  Globe // Added for DeploymentGuide
} from "lucide-react";

// Fix File Path Errors: Using absolute paths with '@/components' alias
import HingeControlCard from "@/components/hinge-control/HingeControlCard";
import DeviceStatusPanel from "@/components/hinge-control/DeviceStatusPanel";
import EventLogPanel from "@/components/hinge-control/EventLogPanel";
import MediaGallery from "@/components/hinge-control/MediaGallery";
import AddDeviceDialog from "@/components/hinge-control/AddDeviceDialog";
// New component for deployment guide
import DeploymentGuide from "@/components/hinge-control/DeploymentGuide";


export default function HingeControl() {
  const [devices, setDevices] = useState([]);
  const [deviceStates, setDeviceStates] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // createSampleData function is now defined outside and called directly
  // The useCallback wrapper and definition are removed from here.

  const loadHingeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Try to load real data
      const [devicesData, eventsData, mediaData] = await Promise.all([
        HingeDevice.filter({ owner_id: userData.id }, '-last_seen_at'),
        HingeEvent.list('-timestamp', 20),
        MediaAsset.list('-captured_at', 10)
      ]);

      if (devicesData.length === 0) {
        // No real devices, use sample data
        const { sampleDevices, sampleStates, sampleEvents } = createSampleData(); // Call external function
        setDevices(sampleDevices);
        setDeviceStates(sampleStates);
        setRecentEvents(sampleEvents);
        setIsOfflineMode(true);
      } else {
        setDevices(devicesData);
        
        // Load states for each device
        const states = {};
        for (const device of devicesData) {
          const stateData = await HingeState.filter({ device_id: device.id });
          if (stateData.length > 0) {
            states[device.id] = stateData[0];
          }
        }
        setDeviceStates(states);
        setRecentEvents(eventsData);
        setMediaAssets(mediaData);
      }
    } catch (error) {
      console.error('Error loading hinge data:', error);
      // Fall back to sample data
      const { sampleDevices, sampleStates, sampleEvents } = createSampleData(); // Call external function
      setDevices(sampleDevices);
      setDeviceStates(sampleStates);
      setRecentEvents(sampleEvents);
      setIsOfflineMode(true);
    }
    setIsLoading(false);
  }, []); // createSampleData is now an external, stable function, so it's removed from dependencies.

  useEffect(() => {
    loadHingeData();
  }, [loadHingeData]);

  const sendCommand = async (deviceId, commandType, args = {}) => {
    try {
      // Generate unique request ID
      const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      
      if (isOfflineMode) {
        // Demo mode - simulate command success
        console.log(`Demo command: ${commandType} to ${deviceId}`, args);
        
        // Optimistically update state
        if (commandType === 'LOCK' || commandType === 'UNLOCK') {
          const newState = commandType.toLowerCase();
          setDeviceStates(prev => ({
            ...prev,
            [deviceId]: {
              ...prev[deviceId],
              lock_state: newState === 'lock' ? 'locked' : 'unlocked',
              updated_at: new Date().toISOString()
            }
          }));
        }
        return { success: true, requestId };
      }

      // Production mode - call backend API
      const apiUrl = `/api/v1/hinges/${deviceId}/commands`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Base44 handles authentication automatically
        },
        body: JSON.stringify({
          type: commandType,
          args: args
        })
      });

      if (!response.ok) {
        throw new Error(`Command failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Command ${commandType} sent to ${deviceId}:`, result);

      // Refresh device state after a short delay
      setTimeout(() => {
        loadHingeData();
      }, 1000);

      return result;
      
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-blue-700/30">
                <div className="h-32 bg-blue-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Offline Mode Banner */}
        {isOfflineMode && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">🔧 Demo Mode Active</p>
                <p className="text-yellow-300/70 text-xs">Using sample hinge devices. Real devices will appear when connected.</p>
              </div>
              <Button 
                onClick={loadHingeData}
                variant="outline"
                size="sm"
                className="text-yellow-300 border-yellow-500/50 hover:bg-yellow-900/30"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text text-transparent">
                Divine Hinge Control
              </h1>
              <p className="text-blue-200/80">Secure IoT door control system</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddDevice(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Device List */}
          <div className="lg:col-span-8 space-y-6">
            {devices.length > 0 ? (
              <div className="grid gap-6">
                {devices.map((device) => (
                  <HingeControlCard
                    key={device.id}
                    device={device}
                    state={deviceStates[device.id]}
                    onSendCommand={sendCommand}
                    onSelect={setSelectedDevice}
                    isSelected={selectedDevice?.id === device.id}
                  />
                ))}
              </div>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30 text-center p-12">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-blue-400/50" />
                  <h3 className="text-xl font-semibold mb-2 text-blue-200">No Devices Connected</h3>
                  <p className="text-blue-300/70 mb-6">Add your first Divine Hinge device to start controlling your doors securely.</p>
                  <Button 
                    onClick={() => setShowAddDevice(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    Add Your First Device
                  </Button>
                </Card>
                {/* Deployment Guide Component */}
                {!showAddDevice && <DeploymentGuide />}
              </>
            )}
          </div>

          {/* Right Panel - Status & Events */}
          <div className="lg:col-span-4 space-y-6">
            {selectedDevice && deviceStates[selectedDevice.id] && (
              <DeviceStatusPanel 
                device={selectedDevice}
                state={deviceStates[selectedDevice.id]}
              />
            )}
            
            <EventLogPanel events={recentEvents} devices={devices} />
            
            {mediaAssets.length > 0 && (
              <MediaGallery assets={mediaAssets} />
            )}
          </div>
        </div>

        {/* Add Device Dialog */}
        {showAddDevice && (
          <AddDeviceDialog
            user={user}
            onClose={() => setShowAddDevice(false)}
            onDeviceAdded={loadHingeData}
          />
        )}
      </div>
    </div>
  );
}

// createSampleData function implementation, moved outside the component
function createSampleData() {
  const sampleDevices = [
    {
      id: 'demo-device-1',
      device_id: 'DH-FRONT-001',
      name: 'Front Door',
      location: 'Main Entrance',
      owner_id: 'demo-user',
      mqtt_client_id: 'hinge-front-001',
      firmware_version: '1.2.3',
      hardware_revision: 'Rev C',
      is_online: true,
      last_seen_at: new Date(Date.now() - 30000).toISOString(),
      enrollment_date: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'demo-device-2',
      device_id: 'DH-BACK-002',
      name: 'Back Door',
      location: 'Garden Entrance',
      owner_id: 'demo-user',
      mqtt_client_id: 'hinge-back-002',
      firmware_version: '1.2.1',
      hardware_revision: 'Rev B',
      is_online: false,
      last_seen_at: new Date(Date.now() - 300000).toISOString(),
      enrollment_date: new Date(Date.now() - 86400000 * 15).toISOString()
    }
  ];

  const sampleStates = {
    'demo-device-1': {
      device_id: 'demo-device-1',
      lock_state: 'locked',
      door_state: 'closed',
      hinge_angle: 0,
      tamper_detected: false,
      rssi: -45,
      battery_level: null,
      temperature: 22.5,
      uptime_seconds: 3600 * 24 * 7,
      auto_relock_enabled: true,
      auto_relock_delay: 30,
      updated_at: new Date().toISOString()
    },
    'demo-device-2': {
      device_id: 'demo-device-2',
      lock_state: 'unlocked',
      door_state: 'open',
      hinge_angle: 45,
      tamper_detected: true,
      rssi: -68,
      battery_level: null,
      temperature: 24.1,
      uptime_seconds: 3600 * 12,
      auto_relock_enabled: true,
      auto_relock_delay: 45,
      updated_at: new Date(Date.now() - 120000).toISOString()
    }
  };

  const sampleEvents = [
    {
      id: 'evt-1',
      device_id: 'demo-device-1',
      event_type: 'STATE',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      actor: 'demo-user',
      data: { lock_state: 'locked', door_state: 'closed' },
      severity: 'info'
    },
    {
      id: 'evt-2',
      device_id: 'demo-device-2',
      event_type: 'TAMPER',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      actor: 'system',
      data: { tamper_active: true, duration: 5 },
      severity: 'warning'
    },
    {
      id: 'evt-3',
      device_id: 'demo-device-1',
      event_type: 'MOTION',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      actor: 'sensor',
      data: { motion_detected: true },
      severity: 'info'
    }
  ];

  return { sampleDevices, sampleStates, sampleEvents };
}

// DeploymentGuide component implementation (added here for completeness of the file)
function DeploymentGuideComponent() {
  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-black/40 backdrop-blur-sm border border-blue-700/30 text-white p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-white to-blue-300 bg-clip-text text-transparent flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-400" />
          Divine Hinge Deployment Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-blue-200/80">
        <p className="mb-4">
          Welcome to Divine Hinge! To start securing your doors, follow these simple steps to deploy your physical device:
        </p>
        <ul className="list-disc list-inside space-y-3">
          <li className="flex items-start">
            <span className="mr-2 mt-1"><Download className="w-4 h-4 text-blue-400/80" /></span>
            <div>
              <strong className="text-blue-100">Flash Firmware:</strong> Download the latest Divine Hinge firmware to your device. You can find detailed instructions and downloads on our <a href="#" className="text-blue-400 hover:underline">documentation page</a>.
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1"><Wifi className="w-4 h-4 text-blue-400/80" /></span>
            <div>
              <strong className="text-blue-100">Connect to Network:</strong> Power on your device and follow the on-screen (or serial console) prompts to connect it to your local Wi-Fi network. Ensure it has internet access.
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1"><Globe className="w-4 h-4 text-blue-400/80" /></span>
            <div>
              <strong className="text-blue-100">Online Enrollment:</strong> Once connected, your device will attempt to enroll with the Divine Hinge cloud service. Make sure your account is active.
            </div>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-1"><Settings className="w-4 h-4 text-blue-400/80" /></span>
            <div>
              <strong className="text-blue-100">Add Device:</strong> Click the "Add Device" button above and follow the prompts to register your new device with your account. You'll typically need the device's ID.
            </div>
          </li>
        </ul>
        <p className="mt-4 text-sm text-blue-300/70">
          If you encounter any issues, please refer to our comprehensive <a href="#" className="text-blue-400 hover:underline">troubleshooting guide</a> or contact support.
        </p>
      </CardContent>
    </Card>
  );
}
