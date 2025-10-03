import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Plus, Calendar, MessageCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useRTKQuery';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthState();

  // Dynamic navigation items based on user role
  let navItems = [];

  if (!isAuthenticated) {
    // Not logged in users
    navItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/properties', icon: Search, label: 'Search' },
      { path: '/login', icon: User, label: 'Login' },
    ];
  } else if (user?.role === 'user') {
    // Regular users
    navItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/properties', icon: Search, label: 'Search' },
      { path: '/my-tours', icon: Calendar, label: 'Tours' },
      { path: '/favorites', icon: Heart, label: 'Saved' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];
  } else if (user?.role === 'agent') {
    // Agents
    navItems = [
      { path: '/properties', icon: Search, label: 'Search' },
      { path: '/add-property', icon: Plus, label: 'Add' },
      { path: '/agent-tours', icon: Calendar, label: 'Tours' },
      { path: '/my-messages', icon: MessageCircle, label: 'Messages' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];
  } else if (user?.role === 'admin') {
    // Admins
    navItems = [
      { path: '/properties', icon: Search, label: 'Search' },
      { path: '/add-property', icon: Plus, label: 'Add' },
      { path: '/admin', icon: Settings, label: 'Admin' },
      { path: '/my-messages', icon: MessageCircle, label: 'Messages' },
      { path: '/profile', icon: User, label: 'Profile' },
    ];
  }

  // Don't show on desktop or certain pages
  const hiddenPaths = ['/login', '/register', '/forgot-password'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <nav className="bg-background/80 backdrop-blur-2xl border border-border/30 rounded-[2rem] shadow-2xl mx-3 mb-3 bg-gradient-to-b from-background/90 to-background/70">
        <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2 touch-manipulation active:scale-95 transition-transform group"
            >
              <div className="relative flex flex-col items-center">
                <div className="relative flex items-center justify-center w-10 h-10">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 z-10 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/15 rounded-full blur-sm -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-200 -z-10" />
                </div>
                <span
                  className={`text-[10px] mt-0.5 transition-all duration-200 ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
        </div>
      </nav>
    </div>
  );
};

export default MobileBottomNav;