import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  Heart,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Calendar,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on scroll (mobile fix)
  useEffect(() => {
    const handleScroll = () => {
      if (isDropdownOpen && window.innerWidth < 768) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  const navigation = [
    { name: 'Properties', href: '/properties', icon: Home },
    ...(user?.role === 'agent' || user?.role === 'admin'
      ? [{ name: 'Add Property', href: '/add-property', icon: PlusCircle }]
      : []
    ),
    ...(user?.role === 'user' ? [{ name: 'My Tours', href: '/my-tours', icon: Calendar }] : []),
    ...(user?.role === 'agent' || user?.role === 'admin'
      ? [{ name: 'Tour Requests', href: '/agent-tours', icon: Calendar }]
      : []),
    ...(user?.role === 'agent' || user?.role === 'admin'
      ? [{ name: 'My Messages', href: '/my-messages', icon: MessageCircle }]
      : []),
    ...(user ? [{ name: 'Favorites', href: '/favorites', icon: Heart }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ];

  return (
    <nav className="sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 btn-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient-primary">RealEstate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                              (item.href !== '/' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground/80 hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle - All Devices */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg hover:bg-secondary/50"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-foreground" />
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu
                modal={false}
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-lg p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-background z-[100]"
                  align="end"
                  forceMount
                  sideOffset={5}
                >
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild onClick={handleDropdownItemClick}>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'agent' || user.role === 'admin') && (
                    <DropdownMenuItem asChild onClick={handleDropdownItemClick}>
                      <Link to="/portfolio" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Portfolio
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button className="btn-gradient-primary" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;