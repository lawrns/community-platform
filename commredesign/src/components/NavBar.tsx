import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import Button from './ui/Button';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Scroll animation values
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.6, 0.95]);
  const navBlur = useTransform(scrollY, [0, 100], ["blur(8px)", "blur(12px)"]);
  const navBg = useTransform(
    scrollY, 
    [0, 100], 
    ["rgba(23, 25, 35, 0.4)", "rgba(23, 25, 35, 0.85)"]
  );
  
  // Handle mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu on resize to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Navigation links with hover effect
  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <motion.a
      href={href}
      className="relative text-white font-medium text-sm md:text-base"
      whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
      whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
    >
      {label}
      <motion.span 
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 glass-effect"
      style={{
        backgroundColor: navBg,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        opacity: navOpacity,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 15, stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          className="flex-shrink-0"
          whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
          whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
        >
          <a href="#" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-white font-bold text-xl">Community</span>
          </a>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink href="#features" label="Features" />
          <NavLink href="#posts" label="Posts" />
          <NavLink href="#resources" label="Resources" />
          <NavLink href="#members" label="Members" />
          <NavLink href="#events" label="Events" />
          <div className="ml-4">
            <Button>Join Now</Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-x-0 mt-3 glass-effect"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <NavLink href="#features" label="Features" />
              <NavLink href="#posts" label="Posts" />
              <NavLink href="#resources" label="Resources" />
              <NavLink href="#members" label="Members" />
              <NavLink href="#events" label="Events" />
              <div className="mt-2">
                <Button fullWidth>Join Now</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;