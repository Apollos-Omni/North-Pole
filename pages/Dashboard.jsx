
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Hinge } from "@/api/entities";
import { Vision } from "@/api/entities";
import { HingeEvent } from "@/api/entities";
import { CommunityPost } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Sparkles, 
  DoorOpen,
  Target, 
  TrendingUp,
  Users,
  Crown,
  Zap,
  Activity,
  ChevronRight,
  Plus,
  Eye,
  Hexagon
} from "lucide-react";

import HallwayHomeScreen from "../components/dashboard/HallwayHomeScreen";
import DivineAuraDisplay from "../components/dashboard/DivineAuraDisplay";
import VisionBoard from "../components/dashboard/VisionBoard";
import KarmaOverview from "../components/dashboard/KarmaOverview";
import QuickHingeCreation from "../components/dashboard/QuickHingeCreation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [hinges, setHinges] = useState([]);
  const [visions, setVisions] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHingeCreation, setShowHingeCreation] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Offline fallback data
  const createOfflineData = useCallback(() => {
    const offlineUser = {
      id: 'offline-user',
      full_name: 'Demo User',
      email: 'demo@heavenos.local',
      karma_points: 150,
      karma_level: 'Guardian',
      vision_count: 3,
      completed_visions: 1,
      heaven_coin_balance: 25,
      access_role: 'resident',
      aura_color: 'purple',
      divine_aura_level: 25,
      role: 'user',
      isOffline: true
    };

    const offlineHinges = [
      {
        id: 'demo-hinge-1',
        device_id: 'DH-DEMO-001',
        name: 'Demo Portal Alpha',
        location: 'Virtual Workshop',
        door_image_url: 'https://images.unsplash.com/photo-1599307738260-54b90a787a27?w=400&h=600&fit=crop',
        door_glyph: 'sacred_geometry',
        status: 'online',
        owner_id: offlineUser.id,
        access_level: 'private',
        karma_reward: 5,
        total_uses: 42,
        aura_color: 'purple'
      },
      {
        id: 'demo-hinge-2',
        device_id: 'DH-DEMO-002',
        name: 'Demo Gateway Beta',
        location: 'Demo Space',
        door_image_url: 'https://images.unsplash.com/photo-1524185962773-a89a0350a801?w=400&h=600&fit=crop',
        door_glyph: 'nature',
        status: 'locked',
        owner_id: offlineUser.id,
        access_level: 'community',
        karma_reward: 10,
        total_uses: 88,
        aura_color: 'green'
      }
    ];

    const offlineVisions = [
      {
        id: 'demo-vision-1',
        title: 'Complete Morning Meditation',
        description: 'Establish a daily meditation practice',
        status: 'active',
        progress: 65,
        karma_reward: 15,
        category: 'personal',
        created_by: offlineUser.email
      }
    ];

    return { offlineUser, offlineHinges, offlineVisions };
  }, []);

  const createSampleHinges = useCallback(async (userId) => {
    try {
      await Hinge.bulkCreate([
        {
          device_id: "DH-001-ALPHA",
          name: "Portal of Beginnings",
          location: "The Workshop",
          door_image_url: "https://images.unsplash.com/photo-1599307738260-54b90a787a27?w=400&h=600&fit=crop",
          door_glyph: "sacred_geometry",
          status: "online",
          owner_id: userId,
          access_level: "private",
          karma_reward: 5,
          total_uses: 12,
          aura_color: "purple",
          coordinates_x: 10,
          coordinates_y: 20,
          coordinates_z: 0
        },
        {
          device_id: "DH-002-BETA",
          name: "Gateway to the Garden",
          location: "Community Space",
          door_image_url: "https://images.unsplash.com/photo-1524185962773-a89a0350a801?w=400&h=600&fit=crop",
          door_glyph: "nature",
          status: "locked",
          owner_id: userId,
          access_level: "community",
          karma_reward: 10,
          total_uses: 88,
          aura_color: "green",
          coordinates_x: 50,
          coordinates_y: 60,
          coordinates_z: 0
        },
        {
          device_id: "DH-003-GAMMA",
          name: "Threshold of Knowledge",
          location: "Library",
          door_image_url: "https://images.unsplash.com/photo-1588969426982-a044b76a084c?w=400&h=600&fit=crop",
          door_glyph: "celestial",
          status: "unlocked",
          owner_id: userId,
          access_level: "public",
          karma_reward: 2,
          total_uses: 256,
          aura_color: "gold",
          coordinates_x: -30,
          coordinates_y: 45,
          coordinates_z: 0
        }
      ]);
    } catch (error) {
      console.error('Error creating sample hinges:', error);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Add timeout to prevent hanging
      const userData = await Promise.race([
        User.me(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ]);
      
      const userWithDefaults = {
        karma_points: 0,
        karma_level: 'Seeker',
        vision_count: 0,
        completed_visions: 0,
        heaven_coin_balance: 0,
        access_role: 'resident',
        aura_color: 'purple',
        divine_aura_level: 0,
        ...userData,
        isOffline: false // Explicitly set to false for online mode
      };
      
      setUser(userWithDefaults);
      setIsOfflineMode(false);

      // Create sample hinges if none exist and not in offline mode (which uses demo hinges)
      const existingHinges = await Hinge.list('-updated_date');
      if (existingHinges.length === 0 && userWithDefaults.id !== 'offline-user') { 
        await createSampleHinges(userWithDefaults.id);
      }

      const [hingesData, visionsData, eventsData, postsData] = await Promise.all([
        Hinge.filter({ owner_id: userWithDefaults.id }, '-updated_date').catch(() => []),
        Vision.filter({ created_by: userWithDefaults.email, status: 'active' }, '-updated_date', 5).catch(() => []),
        HingeEvent.filter({ user_id: userWithDefaults.id }, '-created_date', 10).catch(() => []),
        CommunityPost.list('-created_date', 5).catch(() => [])
      ]);

      setHinges(hingesData);
      setVisions(visionsData);
      setRecentEvents(eventsData);
      setCommunityPosts(postsData);
      setIsLoading(false);
    } catch (error) {
      console.warn('API unavailable, switching to offline mode:', error.message);
      
      // Switch to offline mode
      setIsOfflineMode(true);
      const { offlineUser, offlineHinges, offlineVisions } = createOfflineData();
      
      setUser(offlineUser);
      setHinges(offlineHinges);
      setVisions(offlineVisions);
      setRecentEvents([]); // No events in offline demo
      setCommunityPosts([]); // No community posts in offline demo
      setIsLoading(false); // Ensure loading state is cleared
    }
  }, [createOfflineData, createSampleHinges]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleHingeCreated = () => {
    setShowHingeCreation(false);
    loadDashboardData();
  };

  const handleRetry = () => {
    loadDashboardData(); // Re-attempt loading data from scratch
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl p-6 animate-pulse border border-purple-700/30">
                <div className="h-32 bg-purple-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="bg-yellow-900/20 border-b border-yellow-700/30 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm">🌟 Demo Mode Active</p>
              <p className="text-yellow-300/70 text-xs">Explore HeavenOS with sample data. Your real data will sync when connected.</p>
            </div>
            <button 
              onClick={handleRetry}
              className="text-yellow-300 border border-yellow-500/50 hover:bg-yellow-900/30 px-4 py-2 rounded-md text-sm transition-colors duration-200"
            >
              Try Reconnect
            </button>
          </div>
        </div>
      )}

      {/* Sacred Header */}
      <div className="relative p-6 md:p-8 border-b border-purple-700/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black/40 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DivineAuraDisplay user={user} />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                  HeavenOS Portal
                </h1>
                <p className="text-purple-200/80">
                  Welcome to your divine realm, {user.full_name || 'Seeker'}
                  {user.isOffline && <span className="text-yellow-400 ml-1">(Demo Mode)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHingeCreation(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm border border-purple-500/30"
              >
                <Plus className="w-5 h-5" />
                Manifest Gateway
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Hallway & Primary Interface */}
          <div className="lg:col-span-8 space-y-8">
            <HallwayHomeScreen hinges={hinges} user={user} onHingeSelect={(hinge) => console.log('Selected hinge:', hinge)} />
            <VisionBoard visions={visions} />
          </div>

          {/* Right Column - Karma & Community */}
          <div className="lg:col-span-4 space-y-8">
            <KarmaOverview user={user} />
            
            {/* Divine Actions Panel */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-700/30 p-6 hover:border-purple-500/50 transition-all duration-500">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-300 to-white bg-clip-text text-transparent">
                <Zap className="w-5 h-5 text-purple-400" />
                Divine Actions
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Vision Quest", icon: Target, url: "VisionTracker", color: "from-purple-500 to-purple-600" },
                  { title: "Gateway Control", icon: DoorOpen, url: "HingeControl", color: "from-blue-500 to-blue-600" },
                  { title: "Community Realm", icon: Users, url: "Community", color: "from-green-500 to-green-600" }
                ].map((action) => (
                  <Link key={action.title} to={createPageUrl(action.url)}>
                    <button className={`w-full flex items-center gap-3 p-4 bg-gradient-to-r ${action.color} rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 backdrop-blur-sm border border-white/10`}>
                      <action.icon className="w-5 h-5" />
                      <span className="font-medium">{action.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Hinge Creation Modal */}
      {showHingeCreation && (
        <QuickHingeCreation 
          user={user}
          onClose={() => setShowHingeCreation(false)}
          onCreated={handleHingeCreated}
        />
      )}
    </div>
  );
}
