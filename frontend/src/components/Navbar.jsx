import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('kaggadu_theme');
    return savedTheme === 'dark';
  });
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
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('kaggadu_theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('kaggadu_theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('kaggadu_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.remove('light-theme');
    } else {
      setIsDark(false);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

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

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4 md:gap-6">
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

          {/* Theme Toggle Button (Mobile & Desktop) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-mountain-950 border border-mountain-800 text-mountain-100 hover:text-forest-500 hover:border-forest-500/30 transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 text-amber-500" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-indigo-500" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
