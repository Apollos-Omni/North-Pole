import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Wifi, 
  Shield, 
  Settings,
  Book,
  X
} from "lucide-react";

import DeviceEnrollmentPanel from './DeviceEnrollmentPanel';
import DeploymentGuide from './DeploymentGuide';
import ProductionModeToggle from './ProductionModeToggle';

export default function AddDeviceDialog({ user, onClose, onDeviceAdded }) {
  const [activeTab, setActiveTab] = useState("enroll");
  const [showDeploymentGuide, setShowDeploymentGuide] = useState(false);
  const [isProductionMode, setIsProductionMode] = useState(false);
  const [mqttConfig, setMqttConfig] = useState({
    host: '',
    port: '8883',
    username: '',
    password: '',
    webhookSecret: ''
  });

  const handleDeviceEnrolled = (deviceData) => {
    console.log('Device enrolled:', deviceData);
    if (onDeviceAdded) {
      onDeviceAdded(deviceData);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border border-blue-700/30">
          <CardHeader className="sticky top-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add Divine Hinge Device
              </CardTitle>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full mb-6 bg-blue-900/30">
                <TabsTrigger value="enroll" className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Enroll Device
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  Setup Guide
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enroll" className="space-y-4">
                {!isProductionMode ? (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-6 text-center">
                    <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-200 mb-2">Demo Mode Active</h3>
                    <p className="text-yellow-300 mb-4">
                      Real device enrollment requires production MQTT integration. 
                      Sample devices are automatically available in demo mode.
                    </p>
                    <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30 mb-4">
                      Enable production mode in Settings tab to connect real devices
                    </Badge>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => setActiveTab("settings")}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Configure Production Mode
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-yellow-500/50 text-yellow-300"
                      >
                        Continue with Demo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DeviceEnrollmentPanel 
                    user={user}
                    onDeviceEnrolled={handleDeviceEnrolled}
                  />
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <ProductionModeToggle
                  isProductionMode={isProductionMode}
                  onToggle={setIsProductionMode}
                  mqttConfig={mqttConfig}
                  onConfigUpdate={setMqttConfig}
                />
                
                {isProductionMode && (
                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                    <h4 className="text-green-200 font-medium mb-2">✅ Production Mode Enabled</h4>
                    <p className="text-green-300 text-sm mb-3">
                      Your app is now configured to connect to real MQTT devices. 
                      Make sure your backend functions are deployed and configured.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("enroll")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Device Enrollment
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="guide" className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6">
                  <h3 className="text-blue-100 text-xl font-semibold mb-4">Quick Start Guide</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-blue-200">Set up MQTT Broker</h4>
                        <p className="text-blue-300 text-sm">Create account on HiveMQ Cloud or configure your own broker</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-purple-200">Deploy Backend Functions</h4>
                        <p className="text-purple-300 text-sm">Set up serverless functions to handle MQTT communication</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-green-200">Flash Raspberry Pi</h4>
                        <p className="text-green-300 text-sm">Install edge agent code on your Pi Zero 2 W device</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium text-orange-200">Enroll Device</h4>
                        <p className="text-orange-300 text-sm">Use zero-touch enrollment to connect your device</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-blue-700/30">
                    <Button
                      onClick={() => setShowDeploymentGuide(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Book className="w-4 h-4 mr-2" />
                      View Full Deployment Guide
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Guide Modal */}
      <DeploymentGuide 
        isOpen={showDeploymentGuide}
        onClose={() => setShowDeploymentGuide(false)}
      />
    </>
  );
}