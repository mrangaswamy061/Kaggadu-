import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, Flame } from 'lucide-react';

export default function Footer() {
  const handleScrollTo = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <footer className="relative bg-[#020617] border-t border-forest-900/30 pt-16 pb-8 overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-700/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-mountain-900 p-2 rounded-full border border-white/5">
                <Compass className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-wider text-white block">
                  KAGGADU
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-forest-500 block -mt-1.5">
                  LIVE WITH NATURE
                </span>
              </div>
            </Link>
            <p className="font-sans text-sm text-mountain-400 leading-relaxed">
              Karnataka's most passionate and energetic adventure community. Organizing safe, highly affordable, and memory-loaded trekking expeditions for students and young nature lovers. Let's live with nature!
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/kaggadu_adventures?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-mountain-900 border border-white/5 hover:border-orange-500 hover:text-orange-500 transition-all duration-300 text-mountain-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a 
                href="mailto:kaggadu@gmail.com" 
                className="p-2.5 rounded-full bg-mountain-900 border border-white/5 hover:border-forest-500 hover:text-forest-500 transition-all duration-300 text-mountain-400"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/7760013106" 
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-mountain-900 border border-white/5 hover:border-forest-500 hover:text-forest-500 transition-all duration-300 text-mountain-400"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48a11.997 11.997 0 00-15.04.02c-4.13 4.14-4.13 10.86 0 15 4.13 4.13 10.87 4.13 15 0 4.13-4.13 4.13-10.86 0-15.02zM12 20.5c-4.68 0-8.5-3.82-8.5-8.5S7.32 3.5 12 3.5s8.5 3.82 8.5 8.5-3.82 8.5-8.5 8.5z"/><path d="M15.66 10.3c-.23-.46-.48-.69-1-.88l-1-.5c-.55-.28-1.21-.15-1.66.11l-.66.42c-1-.06-2.01-.41-2.96-1c-3.24-2.07-6.23-5.97-6.94-7.1a.68.68 0 01.15-.77L5 1.07c.09-.09.2-.12.34-.07.33.12 2.23 1.13 3.84 2.68 1.04 1 1.84 1.93 2.49 3.02.33.4.78 1.07 1.02 1.5a5.94 5.94 0 01-.31-.04c-2.61-.36-5.42-.28-8.18.86a.5.5 0 00-.28.28c-.12.23-.12.5.02.71a10.71 10.71 0 0015.85 2.68c.14-.1.24-.23.24-.44.08-2.08-.1-5.28-.69-5.71zm-1.56 8.45c-2.26 2.26-5.93 2.26-8.19 0-2.26-2.26-2.26-5.93 0-8.19 2.26-2.26 5.93-2.26 8.19 0 2.26 2.26 2.26 5.93 0 8.19z"/></svg>
              </a>
              <a 
                href="tel:+919353772729" 
                className="p-2.5 rounded-full bg-mountain-900 border border-white/5 hover:border-forest-500 hover:text-forest-500 transition-all duration-300 text-mountain-400"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="font-sans text-sm text-mountain-400 mt-2">Jayanagar 4th Block, Tumkur, Karnataka</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-base text-white tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-forest-600 rounded-full"></span> Quick Links
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <button onClick={() => handleScrollTo('hero')} className="text-mountain-400 hover:text-orange-500 transition-colors cursor-pointer">
                  Home Base
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('treks')} className="text-mountain-400 hover:text-orange-500 transition-colors cursor-pointer">
                  Upcoming Expeditions
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('upcoming-events')} className="text-mountain-400 hover:text-orange-500 transition-colors cursor-pointer text-left">
                  Upcoming Events
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo('about')} className="text-mountain-400 hover:text-orange-500 transition-colors cursor-pointer">
                  About Community
                </button>
              </li>
            </ul>
          </div>

          {/* Epic Treks */}
          <div>
            <h4 className="font-display font-bold text-base text-white tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-orange-600 rounded-full"></span> Top Trails
            </h4>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <Link to="/trek/skandagiri-sunrise" className="text-mountain-400 hover:text-forest-500 transition-colors flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Skandagiri Sunrise Trek
                </Link>
              </li>
              <li>
                <Link to="/trek/kudremukh-trek" className="text-mountain-400 hover:text-forest-500 transition-colors flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Kudremukh Peak Trek
                </Link>
              </li>
              <li>
                <Link to="/trek/kodachadri-trek" className="text-mountain-400 hover:text-forest-500 transition-colors flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Kodachadri Hill Climb
                </Link>
              </li>
              <li>
                <Link to="/trek/gokarna-beach-trek" className="text-mountain-400 hover:text-forest-500 transition-colors flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Gokarna Coastal Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Community */}
          <div>
            <h4 className="font-display font-bold text-base text-white tracking-wider uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-forest-600 rounded-full"></span> Adventure Rules
            </h4>
            <p className="font-sans text-sm text-mountain-400 leading-relaxed mb-4">
              All treks are subject to forest department approvals, weather compliance, and green ecotourism policies. Join our green community pledge!
            </p>
            <Link 
              to="/privacy" 
              className="text-xs text-forest-500 hover:text-orange-500 transition-colors font-bold uppercase tracking-wider"
            >
              Privacy Policy & Terms
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-mountain-800/40 to-transparent my-8"></div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-mountain-500 text-center">
          <p>© 2020 Kaggadu Adventures. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed By&nbsp;
            <a 
              href="https://www.instagram.com/swam___y" 
              target="_blank" 
              rel="noreferrer" 
              className="text-orange-500 hover:text-orange-400 transition font-bold"
            >
              @swam___y
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
