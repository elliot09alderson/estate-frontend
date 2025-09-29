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
  Clock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:bg-red-600' }
  ];

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Properties', href: '/properties' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-secondary/20 border-t border-border">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2 group">
              <motion.div
                className="w-10 h-10 btn-gradient-primary rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Home className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-bold text-2xl text-gradient-primary">RealEstate</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We make real estate simple, transparent, and accessible.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-2 pt-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center transition-all duration-300 ${social.color} hover:text-white`}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm flex items-center group transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-1 transition-transform group-hover:translate-x-1" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <motion.div
                className="flex items-start space-x-3 group"
                whileHover={{ x: 5 }}
              >
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Office Address</p>
                  <p className="text-muted-foreground">
                    123 Business Avenue, Suite 100<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-3 group"
                whileHover={{ x: 5 }}
              >
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Phone</p>
                  <a href="tel:+1234567890" className="text-muted-foreground hover:text-foreground">
                    +1 (234) 567-890
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-3 group"
                whileHover={{ x: 5 }}
              >
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@realestate.com" className="text-muted-foreground hover:text-foreground">
                    info@realestate.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-3 group"
                whileHover={{ x: 5 }}
              >
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Business Hours</p>
                  <p className="text-muted-foreground">
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Sat: 10:00 AM - 4:00 PM<br />
                    Sun: Closed
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Map Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="font-semibold text-lg">Find Us</h3>
            <motion.div
              className="relative rounded-lg overflow-hidden h-48 bg-secondary/50"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Map placeholder - Replace with actual map integration */}
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841902395577!2d-73.98823492346903!3d40.758011034710635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258fecf664df5%3A0x33d224a0d5dacca2!2sRockefeller%20Center!5e0!3m2!1sen!2sus!4v1703095842739!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <Button
              className="w-full btn-gradient-primary"
              onClick={() => window.open('https://maps.google.com', '_blank')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Newsletter Section */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4 py-8"
        >
          <h3 className="text-2xl font-bold">Stay Updated</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Subscribe to our newsletter for the latest property listings and real estate news.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="btn-gradient-primary">
              Subscribe
            </Button>
          </motion.div>
        </motion.div>

        <Separator className="my-8" />

        {/* Copyright */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            © {currentYear} RealEstate. All rights reserved. | Made with ❤️ by Your Team
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/cookies" className="text-muted-foreground hover:text-foreground">
              Cookies
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;