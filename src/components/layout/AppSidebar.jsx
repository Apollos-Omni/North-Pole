
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, 
  Target, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Bot,
  Gift, 
  Zap, 
  Shield,
  DoorOpen,
  Globe,
  Store,
  Gamepad2,
  Users,
  Layout,
  LifeBuoy,
  FileText
} from 'lucide-react';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { name: 'Dashboard', icon: Home, page: 'Dashboard' },
  { name: 'Feed', icon: Target, page: 'Feed' },
  { name: 'Visions', icon: Zap, page: 'VisionTracker' },
  { name: 'Gateway Control', icon: DoorOpen, page: 'HingeControl' },
  { name: 'Home World', icon: Globe, page: 'HomeWorld' },
  { name: 'Home Layout', icon: Layout, page: 'HomeLayoutDesigner' },
  { name: 'Security', icon: Shield, page: 'SecurityMonitor'},
  { name: 'Store', icon: Store, page: 'Store' },
  { name: 'Arcade', icon: Gamepad2, page: 'Arcade' },
  { name: 'SantaClause', icon: Gift, page: 'SantaClause' },
  { name: 'Agent Dashboard', icon: Bot, page: 'AgentDashboard' },
  { name: 'Compliance', icon: Shield, page: 'ComplianceDashboard' },
  { name: 'Organizations', icon: Users, page: 'Organizations' },
];

const secondaryNavItems = [
  { name: 'Profile', icon: UserIcon, page: 'Profile' },
  { name: 'My HeavenOS', icon: FileText, page: 'MyHeavenOS' },
  { name: 'Settings', icon: Settings, page: 'Settings' },
  { name: 'Contact Us', icon: LifeBuoy, page: 'ContactUs' },
];

const NavItem = ({ item, onNavigate }) => {
  const location = useLocation();
  const isActive = location.pathname === createPageUrl(item.page) || (item.page === 'Dashboard' && location.pathname === '/');

  return (
    <Link
      to={createPageUrl(item.page)}
      onClick={onNavigate}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-purple-600/20 text-purple-100'
          : 'text-purple-300/70 hover:bg-purple-900/40 hover:text-purple-100'
      }`}
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.name}</span>
    </Link>
  );
};

export default function AppSidebar({ onNavigate }) {
  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-b from-black via-purple-950/30 to-black text-white">
      <div className="mb-8">
        <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 px-2">
          <Gift className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold text-white">DivineHinge</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        <h3 className="px-4 text-xs font-semibold text-purple-400/50 uppercase tracking-wider">Main</h3>
        {mainNavItems.map((item) => (
          <NavItem key={item.name} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto">
        <div className="space-y-2 mb-4">
            <h3 className="px-4 text-xs font-semibold text-purple-400/50 uppercase tracking-wider">Account</h3>
            {secondaryNavItems.map((item) => (
              <NavItem key={item.name} item={item} onNavigate={onNavigate} />
            ))}
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-purple-300/70 hover:bg-red-900/40 hover:text-red-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
