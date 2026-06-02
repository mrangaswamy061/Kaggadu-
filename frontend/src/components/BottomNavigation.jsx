import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Image, Heart, Phone, Shield } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Periodically check if admin is logged in
    const checkAdmin = () => {
      setIsAdmin(apiService.isAdminLoggedIn());
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update active state based on scroll position if on home page
  useEffect(() => {
    if (location.pathname !== '/') {
      if (location.pathname === '/gallery') {
        setActiveSection('gallery');
      } else if (location.pathname === '/admin') {
        setActiveSection('admin');
      } else {
        setActiveSection('');
      }
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      const heroSection = document.getElementById('hero');
      const treksSection = document.getElementById('treks');
      const testimonialsSection = document.getElementById('testimonials');
      const contactSection = document.getElementById('contact');

      if (contactSection && scrollPosition >= contactSection.offsetTop) {
        setActiveSection('contact');
      } else if (testimonialsSection && scrollPosition >= testimonialsSection.offsetTop) {
        setActiveSection('community');
      } else if (treksSection && scrollPosition >= treksSection.offsetTop) {
        setActiveSection('treks');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial call
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-45 md:hidden bg-mountain-950/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.6)] pb-safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        
        {/* Home */}
        <button
          onClick={(e) => handleNavClick('hero', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'home' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Home</span>
        </button>

        {/* Treks */}
        <button
          onClick={(e) => handleNavClick('treks', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'treks' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
          }`}
        >
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Treks</span>
        </button>

        {/* Gallery */}
        <Link
          to="/gallery"
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 ${
            activeSection === 'gallery' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
          }`}
        >
          <Image className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Gallery</span>
        </Link>

        {/* Community */}
        <button
          onClick={(e) => handleNavClick('testimonials', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'community' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
          }`}
        >
          <Heart className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Vibe</span>
        </button>

        {/* Contact */}
        <button
          onClick={(e) => handleNavClick('contact', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'contact' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
          }`}
        >
          <Phone className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Contact</span>
        </button>

        {/* Admin Dashboard (Shortcut visible only if logged in or clicked) */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 ${
              activeSection === 'admin' ? 'text-orange-500 scale-105' : 'text-mountain-450 hover:text-mountain-200'
            }`}
            title="Admin Console"
          >
            <Shield className="w-5 h-5 shrink-0 text-orange-500 animate-pulse" />
            <span className="text-[9px] font-sans font-black uppercase mt-1">Admin</span>
          </Link>
        )}

      </div>
    </nav>
  );
}
