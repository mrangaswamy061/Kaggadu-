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
    { label: 'Gallery', type: 'link', path: '/gallery' },
    { label: 'About Us', type: 'scroll', target: 'about' },
    { label: 'Testimonials', type: 'scroll', target: 'testimonials' },
    { label: 'Contact', type: 'scroll', target: 'contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'py-4 bg-mountain-950/80 backdrop-blur-md border-b border-white/5 shadow-2xl' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Kaggadu Logo" className="w-8 h-8 object-contain" />
            <div>
              <span className="font-display font-black text-xl tracking-wider text-gradient-mountain block">
                KAGGADU
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-forest-500 block -mt-1.5">
                Adventures
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
                    className="font-sans text-sm font-semibold tracking-wide text-mountain-400 hover:text-orange-500 transition-colors duration-300 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link 
                    to={link.path}
                    className="font-sans text-sm font-semibold tracking-wide text-mountain-400 hover:text-orange-500 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="h-5 w-px bg-white/10"></div>

          {/* Theme & User Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 text-mountain-400 hover:text-white"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-forest-700" />}
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin" 
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-500 border border-orange-500/30 rounded-full bg-orange-500/10 hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                  Admin Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full border border-white/5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/admin" 
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white border border-white/10 rounded-full hover:border-forest-500 hover:bg-forest-700 transition-all duration-300"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/5 text-mountain-400"
          >
            {isDark ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-forest-700" />}
          </button>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-mountain-900 border border-white/10 rounded-full text-mountain-100 focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-x-0 top-full lg:hidden bg-mountain-950/95 backdrop-blur-lg border-b border-white/5 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <ul className="flex flex-col px-6 py-6 gap-5">
          {navLinks.map((link) => (
            <li key={link.label}>
              {link.type === 'scroll' ? (
                <button 
                  onClick={() => handleScrollTo(link.target)}
                  className="font-sans text-lg font-semibold tracking-wide text-mountain-400 hover:text-orange-500 transition-colors w-full text-left"
                >
                  {link.label}
                </button>
              ) : (
                <Link 
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-lg font-semibold tracking-wide text-mountain-400 hover:text-orange-500 transition-colors block"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
          
          <div className="h-px bg-white/10 my-2"></div>

          <li>
            {isAdmin ? (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="py-3 text-center text-sm font-bold uppercase tracking-wider text-orange-500 border border-orange-500/30 rounded-lg bg-orange-500/10 hover:bg-orange-500 hover:text-white transition-all"
                >
                  Admin Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-3 text-center text-sm font-bold uppercase tracking-wider text-red-500 border border-red-500/20 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white transition-all"
                >
                  Logout Admin
                </button>
              </div>
            ) : (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)}
                className="block py-3 text-center text-sm font-bold uppercase tracking-wider text-white border border-white/10 rounded-lg hover:border-forest-500 hover:bg-forest-700 transition-all"
              >
                Admin Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
