import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if admin is logged in
    const checkAdmin = () => {
      setIsAdmin(apiService.isAdminLoggedIn());
    };
    checkAdmin();
    // Set up an interval or trigger to update navbar state
    const interval = setInterval(checkAdmin, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const handleLogout = async () => {
    await apiService.adminLogout();
    setIsAdmin(false);
    navigate('/');
  };

  const handleScrollTo = (sectionId) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home', type: 'scroll', target: 'hero' },
    { label: 'Upcoming Treks', type: 'scroll', target: 'treks' },
    { label: 'Event Calendar', type: 'scroll', target: 'upcoming-events' },
    { label: 'About Us', type: 'scroll', target: 'about' },
    { label: 'Contact', type: 'scroll', target: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 bg-mountain-900 border-b border-mountain-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Kaggadu Adventures Logo" className="w-8 h-8 object-contain rounded-full" />
            <div>
              <span className="font-display font-black text-xl tracking-wider text-mountain-100 block">
                KAGGADU
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-forest-500 block -mt-1.5">
                LIVE WITH NATURE
              </span>
            </div>
          </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.type === 'scroll' ? (
                  <button 
                    onClick={() => handleScrollTo(link.target)}
                    className="font-sans text-sm font-semibold tracking-wide text-mountain-100 hover:text-forest-500 transition-colors duration-300 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link 
                    to={link.path}
                    className="font-sans text-sm font-semibold tracking-wide text-mountain-100 hover:text-forest-500 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Toggle - Removed since we use sticky Bottom Navigation */}
        <div className="lg:hidden">
          {/* Keep top header clean on mobile */}
        </div>
      </div>
    </nav>
  );
}
