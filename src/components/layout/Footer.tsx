import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-sky-400' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-500' }
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Return Policy', href: '/return-policy' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 btn-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-2xl text-white">Crimson Bricks</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We make real estate simple, transparent, and accessible for everyone.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-slate-400 transition-colors duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-slate-400">
                <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                <span>Indira Nagar Chinimaya Hospital Road<br />Near Indira Nagar Metro Station</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 8770800807</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-5 h-5 text-primary" />
                <span>info@crimsonbricks.com</span>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium text-white mb-3">Subscribe to our newsletter</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email address" 
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
                />
                <Button size="icon" className="btn-gradient-primary shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator className="my-12 bg-slate-800" />

        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500"
        >
          <p>© {currentYear} Crimson Bricks. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;