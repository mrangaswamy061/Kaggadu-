import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Image, Calendar, Heart, Phone, Shield } from 'lucide-react';
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
      if (location.pathname === '/admin') {
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
      const eventsSection = document.getElementById('upcoming-events');
      const contactSection = document.getElementById('contact');

      if (contactSection && scrollPosition >= contactSection.offsetTop) {
        setActiveSection('contact');
      } else if (eventsSection && scrollPosition >= eventsSection.offsetTop) {
        setActiveSection('events');
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
    <nav className="fixed bottom-0 left-0 right-0 z-45 md:hidden bg-mountain-900/95 backdrop-blur-xl border-t border-mountain-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        
        {/* Home */}
        <button
          onClick={(e) => handleNavClick('hero', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'home' ? 'text-forest-500 scale-105' : 'text-mountain-400 hover:text-mountain-100'
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Home</span>
        </button>

        {/* Treks */}
        <button
          onClick={(e) => handleNavClick('treks', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'treks' ? 'text-forest-500 scale-105' : 'text-mountain-400 hover:text-mountain-100'
          }`}
        >
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Treks</span>
        </button>

        {/* Events */}
        <button
          onClick={(e) => handleNavClick('upcoming-events', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'events' ? 'text-forest-500 scale-105' : 'text-mountain-400 hover:text-mountain-100'
          }`}
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Events</span>
        </button>


        {/* Contact */}
        <button
          onClick={(e) => handleNavClick('contact', e)}
          className={`flex flex-col items-center justify-center w-12 h-full text-center focus:outline-none transition-colors duration-200 cursor-pointer ${
            activeSection === 'contact' ? 'text-forest-500 scale-105' : 'text-mountain-400 hover:text-mountain-100'
          }`}
        >
          <Phone className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-sans font-black uppercase mt-1">Contact</span>
        </button>

      </div>
    </nav>
  );
}
