
import React, { useState } from 'react';
import AppSidebar from './components/layout/AppSidebar';
import { Home, Target, User as UserIcon, Menu as MenuIcon, Settings, Bot, Gift } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

const mobileNavItems = [
  { title: "Feed", href: createPageUrl("Feed"), icon: Home },
  { title: "Visions", href: createPageUrl("VisionTracker"), icon: Target },
  { title: "Profile", href: createPageUrl("Profile"), icon: UserIcon },
];

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (url) => location.pathname === url || (url === createPageUrl("Feed") && location.pathname === "/");

  return (
    <>
      <style>
        {`
          :root {
            --primary: 66 58 255; /* #423AFF - Adjusted for better contrast */
            --dark-base: 11 11 16; /* #0B0B10 */
            --grey-1: 30 30 37; /* #1E1E25 */
            --grey-2: 42 42 51; /* #2A2A33 */
            --grey-3: 142 142 154; /* #8E8E9A */
            --accent-soft-white: 245 246 250; /* #F5F6FA */
            --accent-success: 34 197 94; /* Emerald-500 for success */
            --accent-warning: 245 158 11; /* Amber-500 for warning */
            --accent-danger: 220 38 38; /* Red-600 for danger */
            
            --electric-purple-glow: 0px 0px 24px rgba(110, 58, 255, 0.6);
          }
        `}
      </style>
      <div className="flex h-screen bg-gradient-to-br from-black via-[rgb(var(--grey-1))] to-black relative overflow-hidden text-[rgb(var(--accent-soft-white))]">
        {/* Celestial Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[rgb(var(--primary))] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-600 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Sacred Geometry Grid */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="sacred-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="rgb(var(--primary))" opacity="0.3"/>
                <path d="M15,30 L45,30 M30,15 L30,45" stroke="rgb(var(--primary))" strokeWidth="0.5" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sacred-grid)" />
          </svg>
        </div>

        {/* --- Desktop Sidebar --- */}
        <div className="hidden lg:block w-64 h-full relative z-10">
          <AppSidebar />
        </div>
        
        {/* --- Mobile Sidebar (Slide-in) --- */}
        <div 
          className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-64 h-full bg-gradient-to-b from-black via-purple-950/50 to-black border-r border-purple-700/30">
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6 text-purple-200" />
              </Button>
            </div>
            <AppSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto relative z-10 bg-black/20 backdrop-blur-sm pb-20 lg:pb-0">
          {children}
        </main>
        
        {/* --- Mobile Bottom Navigation --- */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-purple-700/30 flex justify-around items-center lg:hidden z-40">
          {mobileNavItems.map(item => (
            <Link 
              key={item.href} 
              to={item.href} 
              className={`flex flex-col items-center justify-center w-full h-full ${isActive(item.href) ? 'text-purple-400' : 'text-purple-200/70'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full text-purple-200/70"
          >
            <MenuIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>

      </div>
    </>
  );
}
