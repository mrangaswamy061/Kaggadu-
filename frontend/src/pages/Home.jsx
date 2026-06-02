import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Eye, Users, ChevronRight, Star, Heart, MapPin, Send, Mail, MessageSquare, ExternalLink, ArrowRight, ShieldCheck, Zap, X, Phone, Calendar, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../utils/apiService';
import TrekCard from '../components/TrekCard';
import SkeletonTrekCard from '../components/SkeletonTrekCard';

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

  // Pull to refresh states
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartRef = useRef(0);
  const touchMoveRef = useRef(0);

  // Floating Actions Tray state
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const whatsappNumber = "7760013106";
  const whatsappUrl = `https://wa.me/7760013106?text=Hi%20Explore%20Beyond%20Limits!%20I'm%20interested%20in%20joining%20your%20upcoming%20treks.`;

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
    } catch (err) {
      console.error("Failed fetching treks/reviews", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      {/* 5. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 block mb-1">
                Trekker Reviews
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase">
                VIBES FROM THE <span className="text-gradient-orange">TRAIL</span>
              </h2>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap shrink-0">
              <a
                href="https://share.google/xz6mx5xymRqaM1FnV"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 whitespace-nowrap min-h-[40px]"
              >
                Google Maps <ExternalLink className="w-3 h-3 text-orange-500" />
              </a>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer whitespace-nowrap min-h-[40px]"
              >
                Write Review
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid (Swipeable or Grid) */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((t) => (
                <div key={t.id || t._id} className="glass-card p-5 rounded-2xl flex flex-col h-full border border-white/5 relative bg-mountain-900/20">
                  <span className="absolute top-4 right-5 text-4xl font-display font-black text-forest-750/15 pointer-events-none">
                    “
                  </span>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  
                  <p className="font-sans text-xs text-mountain-300 leading-relaxed mb-4 flex-grow italic">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-3 mt-auto border-t border-white/5 pt-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-display font-black text-xs flex items-center justify-center shrink-0 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-white leading-none">
                        {t.name}
                      </h4>
                      <p className="font-sans text-[9px] font-black text-forest-550 uppercase tracking-wider mt-1">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/5 rounded-2xl glass-card">
              <MessageSquare className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <h3 className="font-display font-bold text-white text-sm">No reviews yet</h3>
              <p className="font-sans text-xs text-mountain-400 mt-1">Be the first to share your trekking experience!</p>
            </div>
          )}

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
