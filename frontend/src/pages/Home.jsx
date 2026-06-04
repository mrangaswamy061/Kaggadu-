import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, Users, ChevronRight, Star, Heart, MapPin, Send, Mail, MessageSquare, ExternalLink, ArrowRight, ShieldCheck, Zap, X, Phone, Calendar, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../utils/apiService';
import TrekCard from '../components/TrekCard';
import SkeletonTrekCard from '../components/SkeletonTrekCard';

function EventCountdown({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(eventDate) - new Date();
      if (difference <= 0) {
        setTimeLeft('Happening Today');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
      ⏳ {timeLeft}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [treks, setTreks] = useState([]);
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showcaseStats, setShowcaseStats] = useState({
    trekkersGuided: "4,500+",
    completedTreks: "180+",
    trailsExplored: "25+",
    safetyRating: "4.9/5"
  });
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', role: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Scheduled Events states
  const [events, setEvents] = useState([]);
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'weekend', '30days'
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Pull to refresh states
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef(0);
  const touchMoveRef = useRef(0);

  // Floating Actions Tray state
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const whatsappNumber = "7760013106";
  const whatsappMessage = `👋 Hello Kaggadu Adventure Team,

I'm interested in your trek events 🏔️

📍 Trek Name:
👥 Number of People:
📅 Preferred Date:

Please share itinerary, cost, pickup points, and availability. Thank you!`;
  const whatsappUrl = `https://wa.me/7760013106?text=${encodeURIComponent(whatsappMessage)}`;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getTreks();
      setTreks(data);
      
      // Seed filtering
      if (activeFilter === 'All') {
        setFilteredTreks(data);
      } else {
        setFilteredTreks(data.filter(t => t.difficulty.toLowerCase() === activeFilter.toLowerCase()));
      }

      const statsData = await apiService.getShowcaseStats();
      if (statsData) setShowcaseStats(statsData);

      const reviewsData = await apiService.getReviews();
      setReviews(reviewsData);

      const eventsData = await apiService.getEvents();
      setEvents(eventsData);
      if (eventsData && eventsData.length > 0) {
        const upcoming = eventsData.find(e => new Date(e.date) >= new Date());
        if (upcoming) {
          setCurrentMonth(new Date(upcoming.date).getMonth());
          setCurrentYear(new Date(upcoming.date).getFullYear());
        }
      }
    } catch (err) {
      console.error("Failed fetching treks/reviews/events", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFilteredEvents = () => {
    return events.filter(event => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesLocation = event.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation) return false;
      }

      if (filterDifficulty !== 'all') {
        if (event.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) return false;
      }

      if (filterPrice !== 'all') {
        if (filterPrice === 'under2000' && event.price >= 2000) return false;
        if (filterPrice === '2000to3500' && (event.price < 2000 || event.price > 3500)) return false;
        if (filterPrice === 'over3500' && event.price <= 3500) return false;
      }

      if (filterLocation !== 'all') {
        if (event.location !== filterLocation) return false;
      }

      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0,0,0,0);

      if (eventDate < today && eventDate.toDateString() !== today.toDateString()) return false;

      if (filterDate === 'weekend') {
        const day = eventDate.getDay();
        if (day !== 0 && day !== 6) return false;
      } else if (filterDate === '30days') {
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 30);
        if (eventDate > maxDate) return false;
      }

      if (selectedEventDate) {
        if (eventDate.toDateString() !== selectedEventDate.toDateString()) return false;
      }

      return true;
    });
  };

  const getWeekendHighlights = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);

    return events.filter(e => {
      if (e.status !== 'published') return false;
      const date = new Date(e.date);
      if (date < today) return false;
      if (date > endOfWeek) return false;
      const day = date.getDay();
      return day === 0 || day === 6;
    });
  };

  const renderCalendar = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayEvents = events.filter(e => {
        if (e.status !== 'published') return false;
        return new Date(e.date).toDateString() === date.toDateString();
      });

      const hasEvents = dayEvents.length > 0;
      const isSelected = selectedEventDate && selectedEventDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => {
            if (isSelected) {
              setSelectedEventDate(null);
            } else {
              setSelectedEventDate(date);
            }
          }}
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-[11px] font-black uppercase transition-all duration-200 relative ${
            isSelected 
              ? 'bg-orange-650 text-white scale-110 shadow-lg shadow-orange-500/20' 
              : hasEvents
              ? 'bg-forest-950/40 border border-forest-500/35 text-forest-400 hover:bg-forest-900/60'
              : isToday
              ? 'border border-white/20 text-white font-bold'
              : 'text-mountain-450 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>{day}</span>
          {hasEvents && !isSelected && (
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full absolute bottom-1"></span>
          )}
        </button>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <button 
            type="button"
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
              } else {
                setCurrentMonth(prev => prev - 1);
              }
            }}
            className="p-1 px-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-black uppercase text-mountain-300"
          >
            ◀
          </button>
          <span className="font-display font-black text-sm uppercase text-white tracking-wider">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button 
            type="button"
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
              } else {
                setCurrentMonth(prev => prev + 1);
              }
            }}
            className="p-1 px-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-black uppercase text-mountain-300"
          >
            ▶
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[9px] uppercase font-black text-mountain-500 tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 justify-items-center">
          {cells}
        </div>
      </div>
    );
  };

  const uniqueLocations = Array.from(new Set(events.filter(e => e.status === 'published').map(e => e.location))).filter(Boolean);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.email || !reviewForm.text || !reviewForm.role) {
      alert("Please fill in all the review fields!");
      return;
    }
    try {
      setSubmittingReview(true);
      const savedReview = await apiService.createReview(reviewForm);
      setReviews(prev => [savedReview, ...prev]);
      setShowReviewModal(false);
      setReviewForm({ name: '', email: '', role: '', rating: 5, text: '' });
    } catch (err) {
      console.error("Failed submitting review", err);
      alert("Something went wrong while submitting your review!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredTreks(treks);
    } else {
      const filtered = treks.filter(t => t.difficulty.toLowerCase() === filter.toLowerCase());
      setFilteredTreks(filtered);
    }
  };

  // --- Touch Listeners for Pull to Refresh (Mobile UX Improvement) ---
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;
    touchMoveRef.current = e.touches[0].clientY;
    const distance = touchMoveRef.current - touchStartRef.current;
    
    if (distance > 0) {
      // Pulling down
      e.preventDefault();
      // logarithmic dampening
      const dampened = Math.min(80, Math.pow(distance, 0.85));
      setPullDistance(dampened);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDistance > 60) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const triggerRefresh = async () => {
    setRefreshing(true);
    setPullDistance(50);
    // Reload items
    await fetchData();
    setTimeout(() => {
      setRefreshing(false);
      setPullDistance(0);
    }, 600);
  };

  const stats = [
    { label: 'Trekkers Guided', value: showcaseStats.trekkersGuided, icon: Users, color: 'text-orange-500' },
    { label: 'Completed Treks', value: showcaseStats.completedTreks, icon: Compass, color: 'text-forest-500' },
    { label: 'Western Ghats Trails', value: showcaseStats.trailsExplored, icon: MapPin, color: 'text-orange-500' },
    { label: 'Safety Rating', value: showcaseStats.safetyRating, icon: Star, color: 'text-forest-500' },
  ];

  // Automatic Unsplash WebP CDN compression helper
  const getCompressedImgUrl = (url, width = 800) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=70&fm=webp`;
    }
    return url;
  };

  return (
    <div 
      className="relative overflow-hidden min-h-screen pb-16 md:pb-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Pull To Refresh Spinner */}
      {pullDistance > 0 && (
        <div 
          className="fixed left-0 right-0 z-50 flex items-center justify-center transition-all duration-100 ease-out"
          style={{ top: `${pullDistance}px` }}
        >
          <div className="bg-mountain-900 border border-white/10 p-2.5 rounded-full shadow-2xl flex items-center justify-center text-orange-500">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 4}deg)` }} />
          </div>
        </div>
      )}
      
      {/* 1. HERO SECTION (Redesigned for Mobile-First Approach) */}
      <section id="hero" className="relative h-[95vh] md:h-screen flex items-center justify-center overflow-hidden">
        
        {/* Fullscreen Video / Image Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-mountain-950/70 via-mountain-950/80 to-mountain-950 z-10"></div>
          <img 
            src={getCompressedImgUrl("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", 1200)} 
            alt="Kaggadu Adventures Hero Background" 
            className="w-full h-full object-cover scale-105 animate-[pulse_12s_infinite]"
          />
        </div>

        {/* Brand Header Logo (Top of Hero on Mobile) */}
        <div className="absolute top-8 left-0 right-0 z-20 flex justify-center lg:hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-mountain-950/40 backdrop-blur-md border border-white/5 rounded-full">
            <img src="/logo.jpg" alt="Logo" className="w-6 h-6 object-contain rounded-full" />
            <span className="font-display font-black text-sm tracking-wider text-gradient-mountain">KAGGADU LIVE WITH NATURE</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center pt-16">
          
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-forest-500/30 bg-forest-950/20 backdrop-blur-md mb-5"
          >
            <Zap className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest text-forest-400">
              Karnataka's Wildest Trekking Network
            </span>
          </div>

          <h1 
            className="font-display font-black text-4xl sm:text-6xl md:text-8xl tracking-tight text-white mb-5 uppercase leading-[0.95] max-w-3xl mx-auto"
          >
            Explore Karnataka. <br/>
            <span className="text-gradient-orange">Live With</span> Nature.
          </h1>

          <p 
            className="font-sans text-xs sm:text-sm md:text-base text-mountain-300 max-w-xl mx-auto mb-8 font-medium leading-relaxed"
          >
            Conquer misty peaks, sleep under starry skies, and vibe with a crazy community of student explorers. 90%+ youth recommend us for Western Ghats adventures.
          </p>

          {/* Sticky Double-Action CTA Bar on Mobile (above bottom navigation) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => document.getElementById('treks').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-7 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-orange active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px]"
            >
              Book Weekend Trek
            </button>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 border border-forest-500/30 hover:border-forest-500 bg-forest-950/20 hover:bg-forest-900/40 text-forest-400 font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all duration-200 text-center flex items-center justify-center gap-2 min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Direct
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={() => document.getElementById('treks').scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 block hover:scale-115 transition-all duration-300 cursor-pointer"
          title="Explore"
        >
          <div className="w-6 h-10 border-2 border-white/20 hover:border-orange-500/50 rounded-full flex justify-center p-1.5">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          </div>
        </button>

      </section>

      {/* 2. STATS OVERVIEW */}
      <section className="relative py-8 bg-[#020617] border-y border-white/5 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-left">
                <div className="bg-mountain-900/60 p-2.5 rounded-xl border border-white/5 shrink-0">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <h4 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                    {stat.value}
                  </h4>
                  <p className="font-sans text-[9px] uppercase tracking-wider text-mountain-500 font-black">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING TREKS SECTION (Redesigned with Swipeable Slider on Mobile) */}
      <section id="treks" className="py-16 relative z-20">
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-forest-950/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-forest-500 block mb-1">
                Epic Expeditions
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase">
                Upcoming <span className="text-gradient-orange">Treks</span>
              </h2>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 scrollbar-none overflow-x-auto">
              {['All', 'Easy', 'Moderate', 'Challenging'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilter(filter)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border transition-all duration-300 cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                      : 'border-white/5 hover:border-white/20 text-mountain-400 hover:text-white bg-mountain-900/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Trek Cards Carousel on Mobile, Grid on Desktop */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <SkeletonTrekCard key={n} />
              ))}
            </div>
          ) : filteredTreks.length > 0 ? (
            <>
              {/* Mobile Carousel View (< 768px preset) */}
              <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 scrollbar-none px-1 -mx-5 pl-5">
                {filteredTreks.map((trek) => (
                  <div key={trek.id || trek._id} className="snap-center shrink-0 w-[290px] first:ml-1 last:mr-5">
                    <TrekCard trek={trek} />
                  </div>
                ))}
              </div>

              {/* Desktop Grid View (>= 768px preset) */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTreks.map((trek) => (
                  <TrekCard key={trek.id || trek._id} trek={trek} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 border border-white/5 rounded-2xl glass-card">
              <Compass className="w-10 h-10 text-mountain-600 mx-auto mb-3 animate-spin" />
              <h3 className="font-display font-bold text-sm text-white mb-1">No expeditions found</h3>
              <p className="font-sans text-xs text-mountain-400">Try matching another difficulty level filter</p>
            </div>
          )}

        </div>
      </section>

      {/* --- UPCOMING EVENTS CALENDAR SECTION --- */}
      <section id="upcoming-events" className="py-16 relative border-t border-white/5 z-20">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-orange-950/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 block mb-1">
                Calendar Timeline
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase">
                Upcoming <span className="text-gradient-orange">Events</span>
              </h2>
            </div>
          </div>

          {/* Weekend Highlights slider if any */}
          {getWeekendHighlights().length > 0 && (
            <div className="mb-10 p-4 bg-gradient-to-r from-orange-600/10 via-forest-900/5 to-transparent rounded-3xl border border-orange-500/20">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded animate-pulse">
                  Weekend Special
                </span>
                <h3 className="font-display font-bold text-xs uppercase text-white tracking-wider">This Upcoming Weekend Hits</h3>
              </div>
              
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none">
                {getWeekendHighlights().map(event => {
                  const available = event.slots - event.bookedSlots;
                  const isSoldOut = available <= 0 || !event.registrationsEnabled;
                  const isFewSlotsLeft = !isSoldOut && available <= 5;
                  
                  return (
                    <div key={event.eventId} className="shrink-0 w-[280px] bg-mountain-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between min-h-[150px]">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] text-orange-500 font-bold uppercase">{event.location}</span>
                          <span className="text-[8px] text-mountain-455 font-sans font-semibold">
                            {new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-white line-clamp-1 mt-1">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-white font-bold">₹{event.price}</span>
                          {isSoldOut ? (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sold Out</span>
                          ) : isFewSlotsLeft ? (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Few Slots Left</span>
                          ) : (
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">{available} left</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 mt-3.5 border-t border-white/5 pt-3">
                        <EventCountdown eventDate={event.date} />
                        <Link
                          to={isSoldOut ? '#' : `/booking?trek=${encodeURIComponent(event.title)}`}
                          onClick={e => isSoldOut && e.preventDefault()}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${
                            isSoldOut 
                              ? 'bg-mountain-800 text-mountain-500 cursor-not-allowed' 
                              : 'bg-forest-700 hover:bg-forest-600 text-white'
                          }`}
                        >
                          Book Seat
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky Filters bar */}
          <div className="sticky top-[70px] z-30 bg-mountain-950/90 backdrop-blur-md py-4 border-y border-white/5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {/* Search title/location */}
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events/location..."
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-2.5 px-3.5 text-xs text-white placeholder-mountain-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Date Filter */}
              <div>
                <select 
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="all">Date: All Upcoming</option>
                  <option value="weekend">Date: Weekends Only</option>
                  <option value="30days">Date: Next 30 Days</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <select 
                  value={filterDifficulty}
                  onChange={e => setFilterDifficulty(e.target.value)}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="all">Difficulty: All</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <select 
                  value={filterPrice}
                  onChange={e => setFilterPrice(e.target.value)}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="all">Price: All</option>
                  <option value="under2000">Under ₹2000</option>
                  <option value="2000to3500">₹2000 - ₹3500</option>
                  <option value="over3500">Over ₹3500</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <select 
                  value={filterLocation}
                  onChange={e => setFilterLocation(e.target.value)}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold cursor-pointer focus:outline-none"
                >
                  <option value="all">Location: All</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Show selected day tag from calendar filter */}
            {selectedEventDate && (
              <div className="flex items-center gap-2 mt-3 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-xl w-fit">
                <span className="text-[10px] font-black uppercase text-orange-500">
                  Filtering by date: {selectedEventDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <button 
                  type="button"
                  onClick={() => setSelectedEventDate(null)}
                  className="text-orange-500 hover:text-white font-bold text-xs leading-none"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Main events container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Calendar Grid left (5 cols) */}
              <div className="lg:col-span-5 bg-mountain-900/40 border border-white/5 rounded-3xl p-5 shadow-xl">
                {renderCalendar()}
              </div>

              {/* Selected Events list right (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-display font-black text-sm uppercase text-white tracking-wider border-b border-white/5 pb-2">
                  {selectedEventDate ? 'Events on Selected Date' : 'All Matches'} ({getFilteredEvents().length})
                </h3>

                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {getFilteredEvents().map(event => {
                    const available = event.slots - event.bookedSlots;
                    const isSoldOut = available <= 0 || !event.registrationsEnabled;
                    const isFewSlotsLeft = !isSoldOut && available <= 5;
                    
                    return (
                      <div key={event.eventId} className="bg-mountain-900/30 border border-white/5 hover:border-orange-500/20 rounded-2xl p-4 flex gap-4 transition items-center relative overflow-hidden group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-mountain-950">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] uppercase font-black text-orange-500">{event.difficulty}</span>
                            <span className="text-[9px] font-sans font-bold text-mountain-500">
                              {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-sm text-white group-hover:text-orange-500 transition leading-snug line-clamp-1">{event.title}</h4>
                          <p className="text-[10px] text-mountain-450 font-bold">{event.location}</p>
                          <div className="flex gap-2 items-center pt-1.5 flex-wrap">
                            <span className="text-xs text-white font-black">₹{event.price}</span>
                            {isSoldOut ? (
                              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sold Out</span>
                            ) : isFewSlotsLeft ? (
                              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">Few Slots Left</span>
                            ) : (
                              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">{available} left</span>
                            )}
                            <EventCountdown eventDate={event.date} />
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <Link
                            to={isSoldOut ? '#' : `/booking?trek=${encodeURIComponent(event.title)}`}
                            onClick={e => isSoldOut && e.preventDefault()}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                              isSoldOut 
                                ? 'bg-mountain-800 text-mountain-500 cursor-not-allowed' 
                                : 'bg-forest-750 hover:bg-forest-650 text-white shadow-md active:scale-95'
                            }`}
                          >
                            Book Seat
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getFilteredEvents().length === 0 && (
                    <div className="text-center py-10 bg-mountain-900/10 border border-white/5 rounded-2xl text-mountain-500 font-bold text-xs uppercase">
                      No matching events listed for this date.
                    </div>
                  )}
                </div>

              </div>
            </div>

        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-16 bg-[#020617]/50 relative border-t border-white/5 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Visuals column */}
            <div className="lg:col-span-5 relative hidden md:block">
              <div className="absolute -inset-2 bg-gradient-to-r from-forest-500 to-orange-500 rounded-3xl blur-2xl opacity-10 animate-pulse"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl">
                <img 
                  src={getCompressedImgUrl("/group_trekkers.png", 600)} 
                  alt="Group of trekkers" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-2xl border border-white/10 z-10">
                  <h4 className="font-display font-black text-sm text-white mb-1 uppercase tracking-wide">
                    Kaggadu Adventures Pledge
                  </h4>
                  <p className="font-sans text-[11px] text-mountain-300 leading-relaxed">
                    "Leave nothing but footprints. Take nothing but photos. Kill nothing but time."
                  </p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-forest-500 block mb-1">
                  Youth Trekking Network
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase leading-none mb-4">
                  ABOUT <span className="text-gradient-forest">KAGGADU</span> ADVENTURES
                </h2>
                <p className="font-sans text-xs sm:text-sm text-mountain-300 leading-relaxed font-semibold">
                  We are a wild team of adventure leads, mountaineers, and travelers from Karnataka. Our community was built with a single vision: **making high-altitude nature and mountain therapy accessible, highly affordable, and extremely safe** for students and young travelers.
                </p>
              </div>

              {/* USP Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "Forest Dept Permits", desc: "100% legal routes and authorizations.", icon: ShieldCheck, color: "text-forest-400" },
                  { title: "Student Friendly Deals", desc: "Highly affordable weekend packages.", icon: Heart, color: "text-red-400" },
                  { title: "Certified Trek Leads", desc: "First-aid certified, experienced leads.", icon: Compass, color: "text-orange-400" },
                  { title: "Elite Social Vibes", desc: "Safe, inclusive environment for girls & solo travelers.", icon: Users, color: "text-forest-400" }
                ].map((usp, idx) => (
                  <div key={idx} className="p-3 bg-mountain-900/40 rounded-xl border border-white/5 flex gap-3 items-start">
                    <usp.icon className={`w-4.5 h-4.5 shrink-0 ${usp.color} mt-0.5`} />
                    <div>
                      <h5 className="font-display font-bold text-xs text-white leading-tight">{usp.title}</h5>
                      <p className="font-sans text-[10px] text-mountain-500 mt-0.5">{usp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* 6. CONTACT SECTION */}
      <section id="contact" className="py-16 bg-[#020617] border-t border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-forest-500 block mb-1">
                  Stay Connected
                </span>
                <h2 className="font-display font-black text-3xl text-white uppercase leading-none">
                  REACH THE <br/>
                  <span className="text-gradient-orange">CAMP BASE</span>
                </h2>
                <p className="font-sans text-xs text-mountain-400 mt-3 leading-relaxed">
                  Have questions about pickup spots, fitness criteria, or safety permits? Our leads are online 24/7 to clear your doubts.
                </p>
              </div>

              {/* Contact info cards */}
              <div className="space-y-3 font-sans text-xs">
                
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-forest-950/20 border border-forest-500/25 hover:border-forest-500/50 transition">
                  <div className="p-2.5 rounded-lg bg-forest-900 text-forest-400 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-[10px]">WhatsApp Desk</h4>
                    <p className="text-forest-400 font-bold mt-0.5">+91 77600 13106 (Fast Replies)</p>
                  </div>
                </a>

                <a href="tel:+919353772729" className="flex items-center gap-3 p-3 rounded-xl bg-mountain-900/40 border border-white/5 hover:border-forest-500/30 transition">
                  <div className="p-2.5 rounded-lg bg-mountain-800 text-orange-500 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-[10px]">Lead Direct</h4>
                    <p className="text-mountain-300 font-bold mt-0.5">+91 93537 72729 (Call Direct)</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-mountain-900/40 border border-white/5">
                  <div className="p-2.5 rounded-lg bg-mountain-800 text-orange-500 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-[10px]">Email Coordinator</h4>
                    <p className="text-mountain-300 font-bold mt-0.5">kaggadu@gmail.com</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Embed and instagram teaser */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-white/10 w-full h-64 bg-mountain-900 relative shadow-lg">
                <iframe 
                  title="Kaggadu Adventures Map"
                  src="https://maps.google.com/maps?q=Jayanagar%204th%20Block,%20Tumkur,%20Karnataka&z=14&output=embed" 
                  className="w-full h-full border-0 dark-google-map"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Instagram Card */}
              <div className="p-4 bg-gradient-to-r from-orange-600/10 to-forest-650/10 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-white uppercase tracking-wide mb-0.5">
                    Follow The Trail Vibe
                  </h4>
                  <p className="font-sans text-[10px] text-mountain-450">
                    Catch live drone clips, batch group photos, and community updates on Instagram.
                  </p>
                </div>
                <a 
                  href="https://www.instagram.com/kaggadu_adventures?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-white text-mountain-950 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-orange-500 hover:text-white transition duration-200 flex items-center gap-1.5 whitespace-nowrap min-h-[40px]"
                >
                  Join Instagram <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. REDESIGNED EXPANDABLE FLOATING ACTIONS TRAY (Thumb Pinned UX) */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-6 flex flex-col items-end gap-2.5">
        
        {/* Expanded menu actions */}
        <AnimatePresence>
          {showFloatingMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-2.5 mb-2"
            >
              {/* Event Calendar */}
              <button
                onClick={() => { setShowFloatingMenu(false); document.getElementById('upcoming-events').scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-2 p-2.5 bg-orange-600 text-white rounded-full shadow-2xl border border-orange-500/20 active:scale-95 transition cursor-pointer"
                title="Upcoming Events Calendar"
              >
                <span className="bg-mountain-950/80 px-2 py-0.5 text-[9px] font-black rounded text-orange-500 uppercase tracking-widest border border-white/5">Calendar</span>
                <Calendar className="w-5 h-5 shrink-0" />
              </button>

              {/* Quick Book */}
              <button
                onClick={() => { setShowFloatingMenu(false); navigate('/booking'); }}
                className="flex items-center gap-2 p-2.5 bg-orange-600 text-white rounded-full shadow-2xl border border-orange-500/20 active:scale-95 transition cursor-pointer"
                title="Quick Book Seat"
              >
                <span className="bg-mountain-950/80 px-2 py-0.5 text-[9px] font-black rounded text-orange-500 uppercase tracking-widest border border-white/5">Book Now</span>
                <Calendar className="w-5 h-5 shrink-0" />
              </button>

              {/* Call Direct */}
              <a
                href="tel:+919353772729"
                className="flex items-center gap-2 p-2.5 bg-blue-600 text-white rounded-full shadow-2xl border border-blue-500/20 active:scale-95 transition"
                title="Call Trek Lead"
              >
                <span className="bg-mountain-950/80 px-2 py-0.5 text-[9px] font-black rounded text-blue-400 uppercase tracking-widest border border-white/5">Call Direct</span>
                <Phone className="w-5 h-5 shrink-0" />
              </a>

              {/* WhatsApp Direct */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 bg-emerald-600 text-white rounded-full shadow-2xl border border-emerald-500/20 active:scale-95 transition"
                title="WhatsApp Support"
              >
                <span className="bg-mountain-950/80 px-2 py-0.5 text-[9px] font-black rounded text-emerald-450 uppercase tracking-widest border border-white/5">WhatsApp Us</span>
                <MessageSquare className="w-5 h-5 shrink-0" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Toggle Action Button */}
        <button
          onClick={() => setShowFloatingMenu(!showFloatingMenu)}
          className="p-3.5 bg-gradient-to-tr from-orange-600 to-orange-500 text-white rounded-full shadow-2xl border border-orange-400/20 hover:scale-105 active:scale-95 transition-all duration-200 glow-orange flex items-center justify-center cursor-pointer"
          title="Quick Action Desk"
        >
          {showFloatingMenu ? (
            <X className="w-6 h-6 shrink-0" />
          ) : (
            <Zap className="w-6 h-6 shrink-0 animate-bounce" />
          )}
        </button>
      </div>

      {/* 8. REVIEW SUBMISSION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mountain-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden border border-white/10 rounded-2xl bg-[#020617] p-6 shadow-2xl animate-[zoomIn_0.25s_ease-out]">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full border border-white/5 bg-mountain-900/60 text-mountain-400 hover:text-white transition focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-xl text-white uppercase mb-1">
              Share Your <span className="text-gradient-orange">Trail Vibe</span>
            </h3>
            <p className="font-sans text-[10px] text-mountain-450 mb-4">
              Inspire other students to explore Karnataka by posting your genuine feedback.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-mountain-400">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Darshan Gowda"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-mountain-900 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none text-white text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-mountain-400">Designation / Bio</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student / Nature Enthusiast"
                  value={reviewForm.role}
                  onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-mountain-900 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none text-white text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-mountain-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-mountain-900 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none text-white text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-mountain-400">Star Rating (1-5)</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-0.5 hover:scale-120 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          reviewForm.rating >= star 
                            ? 'fill-orange-500 text-orange-500' 
                            : 'text-mountain-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-black text-mountain-400">Experience / Review</label>
                <textarea
                  required
                  rows="3"
                  placeholder="How was the trail, homestay, food, and coordinator vibe?"
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full px-3 py-2.5 bg-mountain-900 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none text-white text-xs font-semibold resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/2 py-3 border border-white/10 text-white font-bold rounded-xl active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-1/2 py-3 bg-orange-600 text-white font-black rounded-xl shadow-md transition disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {submittingReview ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
