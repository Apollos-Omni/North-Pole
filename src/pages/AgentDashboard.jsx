import React, { useState, useEffect } from 'react';
import { AuditEvent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bot, RefreshCw, MessageSquare, Settings, Activity, Shield, Target, Lock } from "lucide-react";
import { agentSDK } from "@/agents";

export default function AgentDashboard() {
  const [events, setEvents] = useState([]);
  const [agentStats, setAgentStats] = useState({
    fulfillment: { active: 0, completed: 24 },
    compliance: { checks: 156, violations: 2 },
    vision_support: { active_conversations: 8, visions_helped: 45 },
    security: { alerts_today: 3, devices_monitored: 12 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const fetchedEvents = await AuditEvent.list('-created_date', 100);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Failed to load audit events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'EXCEPTION': return 'bg-red-100 text-red-800';
      case 'ORDER':
      case 'TRACKING':
        return 'bg-green-100 text-green-800';
      case 'CARD_CREATE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const agents = [
    {
      name: 'Fulfillment Agent',
      description: 'Handles prize fulfillment and order processing',
      icon: Bot,
      stats: agentStats.fulfillment,
      whatsappUrl: agentSDK.getWhatsAppConnectURL('fulfillment_agent'),
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Compliance Monitor',
      description: 'Monitors regulatory compliance and policy adherence',
      icon: Shield,
      stats: agentStats.compliance,
      whatsappUrl: agentSDK.getWhatsAppConnectURL('compliance_monitor'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Vision Support Agent',
      description: 'Helps users with goal tracking and motivation',
      icon: Target,
      stats: agentStats.vision_support,
      whatsappUrl: agentSDK.getWhatsAppConnectURL('vision_support_agent'),
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Security Guardian',
      description: 'Monitors Divine Hinge devices and security events',
      icon: Lock,
      stats: agentStats.security,
      whatsappUrl: agentSDK.getWhatsAppConnectURL('security_guardian'),
      color: 'from-red-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">AI Agent Dashboard</CardTitle>
                  <p className="text-slate-500">Monitor and manage your AI agents handling automated tasks</p>
                </div>
              </div>
              {isLoading && <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />}
            </div>
          </CardHeader>
        </Card>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Card key={agent.name} className="overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${agent.color} text-white pb-4`}>
                <div className="flex items-center gap-3">
                  <agent.icon className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-slate-600 text-sm mb-4">{agent.description}</p>
                
                <div className="space-y-2 mb-4">
                  {Object.entries(agent.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a 
                    href={agent.whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" className="px-3">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Audit Event Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Agent Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-slate-600 text-xs">
                      {new Date(event.created_date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.actor}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStageBadge(event.stage)}>{event.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{event.code}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 max-w-md truncate">
                      {event.message}
                    </TableCell>
                    <TableCell>
                      <pre className="text-xs bg-slate-50 p-2 rounded-md max-w-xs overflow-auto">
                        {JSON.stringify(event.meta, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {events.length === 0 && !isLoading && (
              <div className="text-center py-12 text-slate-500">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No agent events recorded yet</p>
                <p className="text-sm">Agents will appear here as they process tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}