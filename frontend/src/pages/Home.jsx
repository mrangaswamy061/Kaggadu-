import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Eye, Users, ChevronRight, Star, Heart, MapPin, Send, Mail, MessageSquare, ExternalLink, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiService } from '../utils/apiService';
import TrekCard from '../components/TrekCard';

export default function Home() {
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

  // Floating WhatsApp Link
  const whatsappNumber = "7760013106";
  const whatsappUrl = `https://wa.me/7760013106?text=Hi%20Kaggadu%20Adventures!%20I'm%20interested%20in%20joining%20your%20upcoming%20treks.`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getTreks();
        setTreks(data);
        setFilteredTreks(data);

        // Fetch custom stats
        const statsData = await apiService.getShowcaseStats();
        if (statsData) {
          setShowcaseStats(statsData);
        }

        // Fetch reviews
        const reviewsData = await apiService.getReviews();
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed fetching treks/reviews", err);
      } finally {
        setIsLoading(false);
      }
    };
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

  const stats = [
    { label: 'Trekkers Guided', value: showcaseStats.trekkersGuided, icon: Users, color: 'text-orange-500' },
    { label: 'Completed Treks', value: showcaseStats.completedTreks, icon: Compass, color: 'text-forest-500' },
    { label: 'Western Ghats Trails', value: showcaseStats.trailsExplored, icon: MapPin, color: 'text-orange-500' },
    { label: 'Safety Rating', value: showcaseStats.safetyRating, icon: Star, color: 'text-forest-500' },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        
        {/* Fullscreen Video / Image Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-mountain-950/40 via-mountain-950/70 to-mountain-950 z-10"></div>
          <img 
            src="/background.jpg" 
            alt="Kaggadu Hero Background" 
            className="w-full h-full object-cover scale-105 animate-[pulse_10s_infinite]"
          />
        </div>

        {/* Animated Mountain Parallax Overlay Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-mountain-950 to-transparent z-20 pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-forest-500/30 bg-forest-900/10 backdrop-blur-md mb-6"
          >
            <Zap className="w-4 h-4 text-orange-500 animate-bounce" />
            <span className="text-xs uppercase font-black tracking-widest text-forest-400">
              Karnataka's Wildest Youth Community
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white mb-6 uppercase leading-[0.9]"
          >
            EXPLORE <br/>
            <span className="text-gradient-orange">BEYOND</span> LIMITS
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-lg sm:text-xl text-mountain-300 max-w-2xl mx-auto mb-10 font-medium"
          >
            Conquer the mist-laden peaks of the Western Ghats, sleep under thousands of stars, and find your vibe with a crazy community of students and nature lovers.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('treks').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg glow-orange hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
            >
              Join Upcoming Treks
            </button>
            <Link 
              to="/gallery" 
              className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-forest-500 bg-white/5 hover:bg-forest-900/20 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:translate-y-[-2px] transition-all duration-300 text-center flex items-center justify-center gap-2"
            >
              View Gallery <Eye className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator (Secret Admin Portal Link) */}
        <Link 
          to="/admin" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 block hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Scroll Down / Admin Gate"
        >
          <div className="w-6 h-10 border-2 border-white/20 hover:border-orange-500/50 rounded-full flex justify-center p-1.5 transition-colors">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          </div>
        </Link>

      </section>

      {/* 2. STATS OVERVIEW */}
      <section className="relative py-12 bg-[#020617] border-y border-white/5 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left justify-center lg:justify-start">
                <div className="bg-mountain-900/60 p-3.5 rounded-2xl border border-white/5 shrink-0">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <h4 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white leading-tight">
                    {stat.value}
                  </h4>
                  <p className="font-sans text-[10px] sm:text-xs uppercase tracking-wider text-mountain-500 font-bold mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING TREKS SECTION */}
      <section id="treks" className="py-24 relative z-20">
        
        {/* Glow Accent */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-forest-950/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-forest-500 block mb-2">
                Epic Adventures
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase">
                Upcoming <span className="text-gradient-orange">Treks</span>
              </h2>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Easy', 'Moderate', 'Challenging'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilter(filter)}
                  className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-full border transition-all duration-300 cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'border-white/5 hover:border-white/20 text-mountain-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Trek Cards Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTreks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTreks.map((trek) => (
                <TrekCard key={trek.id || trek._id} trek={trek} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/5 rounded-2xl glass-card">
              <Compass className="w-12 h-12 text-mountain-600 mx-auto mb-4 animate-spin" />
              <h3 className="font-display font-bold text-lg text-white mb-2">No expeditions found</h3>
              <p className="font-sans text-sm text-mountain-400">Try matching another difficulty level filter</p>
            </div>
          )}

        </div>
      </section>

      {/* 4. ABOUT US SECTION */}
      <section id="about" className="py-24 bg-[#020617]/50 relative border-t border-white/5 z-20">
        
        {/* Background Gradients */}
        <div className="absolute right-0 top-1/3 w-96 h-96 bg-orange-700/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Visuals column */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-forest-500 to-orange-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl">
                <img 
                  src="/group_trekkers.png" 
                  alt="Group of trekkers" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating visual detail */}
                <div className="absolute bottom-6 left-6 right-6 p-5 glass-card rounded-2xl border border-white/10 z-10">
                  <h4 className="font-display font-black text-lg text-white mb-1 uppercase tracking-wide">
                    Kaggadu Pledge
                  </h4>
                  <p className="font-sans text-xs text-mountain-300 leading-relaxed">
                    "Leave nothing but footprints. Take nothing but photos. Kill nothing but time."
                  </p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-forest-500 block mb-2">
                  Our Community
                </span>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase leading-none mb-6">
                  ABOUT <span className="text-gradient-forest">KAGGADU</span> ADVENTURES
                </h2>
                <p className="font-sans text-base text-mountain-300 leading-relaxed mb-6 font-medium">
                  We are a crazy team of adventure leads, mountaineers, and travelers from Karnataka. Our community was built with a single vision: **making extreme nature and mountain therapy accessible, highly affordable, and extremely safe** for students, young professionals, and eco-tourists.
                </p>
                <p className="font-sans text-base text-mountain-400 leading-relaxed">
                  Whether it is scaling Skandagiri under the moonlight, witnessing Kudremukh's green velvet grasslands, climbing Banasura in Kerala, or walking along Gokarna's pristine beaches, we make sure each trek is curated with incredible group energy, local farm-stays, authorized permissions, and deep memories.
                </p>
              </div>

              {/* USP Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Forest Dept Authorizations", desc: "No illegal routes. Full legal permissions.", icon: ShieldCheck, color: "text-forest-400" },
                  { title: "Student Friendly Pricing", desc: "Most affordable weekend adventures.", icon: Heart, color: "text-red-400" },
                  { title: "Certified Trek Leads", desc: "First-aid certified, experienced leads.", icon: Compass, color: "text-orange-400" },
                  { title: "Elite Social Vibes", desc: "Meet amazing, youthful people.", icon: Users, color: "text-forest-400" }
                ].map((usp, idx) => (
                  <div key={idx} className="p-4 bg-mountain-900/40 rounded-2xl border border-white/5 flex gap-3.5 items-start">
                    <usp.icon className={`w-5 h-5 shrink-0 ${usp.color} mt-0.5`} />
                    <div>
                      <h5 className="font-display font-bold text-sm text-white">{usp.title}</h5>
                      <p className="font-sans text-xs text-mountain-500 mt-0.5">{usp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 relative z-20">
        
        {/* Glow */}
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-forest-950/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="text-left max-w-2xl">
              <span className="text-xs uppercase font-black tracking-widest text-orange-500 block mb-2">
                Trekker Voices
              </span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase">
                VIBES FROM THE <span className="text-gradient-orange">TRAIL</span>
              </h2>
              <p className="font-sans text-sm text-mountain-400 mt-3 max-w-md">
                Real reviews from students, travelers, and nature lovers who explored with us.
              </p>
            </div>
            <div className="flex gap-3 items-center flex-wrap">
              <a
                href="https://share.google/xz6mx5xymRqaM1FnV"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                Google Reviews <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
              </a>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:translate-y-[-2px] transition duration-300 cursor-pointer whitespace-nowrap"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((t) => (
                <div key={t.id || t._id} className="glass-card glass-card-hover p-8 rounded-2xl flex flex-col h-full border border-white/5 relative">
                  
                  {/* Visual Quote mark */}
                  <span className="absolute top-6 right-8 text-6xl font-display font-black text-forest-700/20 pointer-events-none">
                    “
                  </span>

                  {/* Rating stars */}
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <p className="font-sans text-sm text-mountain-300 leading-relaxed mb-6 flex-grow italic">
                    "{t.text}"
                  </p>

                  {/* Profiler */}
                  <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-5">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-display font-black text-sm flex items-center justify-center shrink-0 uppercase">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {t.name}
                      </h4>
                      <p className="font-sans text-[11px] font-bold text-forest-500 uppercase tracking-wider mt-0.5">
                        {t.role}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-white/5 rounded-2xl glass-card max-w-4xl mx-auto">
              <MessageSquare className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-white text-lg">No trail reviews yet</h3>
              <p className="font-sans text-xs text-mountain-400 mt-1">Be the first to share your epic trekking experience with the community!</p>
            </div>
          )}

        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="py-24 bg-[#020617] border-t border-white/5 relative z-20">
        
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase font-black tracking-widest text-forest-500 block mb-2">
                  Stay Connected
                </span>
                <h2 className="font-display font-black text-4xl sm:text-5xl text-white uppercase leading-none">
                  REACH THE <br/>
                  <span className="text-gradient-orange">CAMP BASE</span>
                </h2>
                <p className="font-sans text-sm text-mountain-400 mt-4 leading-relaxed">
                  Have questions about fitness requirements, pickup spots, or trek groups? Drop us a ping! Our leads are online 24/7 to solve your doubts.
                </p>
              </div>

              {/* Contact info cards */}
              <div className="space-y-4 font-sans text-sm">
                
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-forest-950/20 border border-forest-500/25 hover:border-forest-500/50 hover:bg-forest-950/40 transition duration-300">
                  <div className="p-3 rounded-xl bg-forest-900 text-forest-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-xs">WhatsApp Direct</h4>
                    <p className="text-forest-400 font-semibold mt-0.5">+91 77600 13106 (Quick Reply)</p>
                  </div>
                </a>

                <a href="tel:+919353772729" className="flex items-center gap-4 p-4 rounded-2xl bg-mountain-900/40 border border-white/5 hover:border-forest-500/50 hover:bg-mountain-900/60 transition duration-300">
                  <div className="p-3 rounded-xl bg-mountain-850 text-orange-500 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-xs">Lead Number</h4>
                    <p className="text-mountain-300 font-semibold mt-0.5">+91 93537 72729 (Call Direct)</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-mountain-900/40 border border-white/5">
                  <div className="p-3 rounded-xl bg-mountain-850 text-orange-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-xs">Email Desk</h4>
                    <p className="text-mountain-300 font-semibold mt-0.5">kaggadu@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-mountain-900/40 border border-white/5">
                  <div className="p-3 rounded-xl bg-mountain-850 text-forest-500 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white uppercase tracking-wide text-xs">Camp Headquarters</h4>
                    <p className="text-mountain-300 font-semibold mt-0.5">Jayanagar 4th Block, Tumkur, Karnataka</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Map Embed and mini form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Google Maps embed */}
              <div className="rounded-3xl overflow-hidden border border-white/10 w-full h-80 bg-mountain-900 relative shadow-2xl">
                {/* Realistic Google Maps Embed */}
                <iframe 
                  title="Kaggadu Camp Map"
                  src="https://maps.google.com/maps?q=Jayanagar%204th%20Block,%20Tumkur,%20Karnataka&z=15&output=embed" 
                  className="w-full h-full border-0 dark-google-map"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Insta Button card */}
              <div className="p-6 bg-gradient-to-r from-orange-600/10 to-forest-600/10 rounded-3xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-display font-bold text-lg text-white uppercase tracking-wide mb-1">
                    Follow The Reel Vibe
                  </h4>
                  <p className="font-sans text-xs text-mountain-400">
                    Stay updated with drone shots, trip schedules, and live trek updates.
                  </p>
                </div>
                <a 
                  href="https://www.instagram.com/kaggadu_adventures?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-3 bg-white text-mountain-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-orange-500 hover:text-white transition duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  Join on Instagram <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. FLOATING WHATSAPP BUTTON */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-2xl hover:scale-110 transition duration-300 glow-forest flex items-center gap-2"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="font-sans text-xs font-black uppercase tracking-wider hidden md:inline-block pr-1">
          Chat With Leads
        </span>
      </a>

      {/* 8. REVIEW SUBMISSION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mountain-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden border border-white/10 rounded-3xl bg-[#020617] p-8 shadow-2xl animate-[zoomIn_0.3s_ease-out]">
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/5 bg-mountain-900/60 text-mountain-400 hover:text-white transition duration-300 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-black text-2xl text-white uppercase mb-1 tracking-wide">
              Share Your <span className="text-gradient-orange">Trail Vibe</span>
            </h3>
            <p className="font-sans text-xs text-mountain-400 mb-6">
              Let the community know about your awesome Kaggadu Adventures experience!
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-sm">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-mountain-400 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Darshan Gowda"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-mountain-900/60 border border-white/5 rounded-xl focus:border-orange-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-mountain-400 mb-1.5">
                  Who Are You? (Designation/Vibe)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student / Nature Enthusiast"
                  value={reviewForm.role}
                  onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-mountain-900/60 border border-white/5 rounded-xl focus:border-orange-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-mountain-400 mb-1.5">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-mountain-900/60 border border-white/5 rounded-xl focus:border-orange-500 focus:outline-none text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-mountain-400 mb-1.5">
                  Star Rating (1-5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 text-mountain-500 hover:scale-125 transition duration-200"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          reviewForm.rating >= star 
                            ? 'fill-orange-500 text-orange-500' 
                            : 'text-mountain-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-mountain-400 mb-1.5">
                  Your Review / Experience
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell us about the peaks, the guides, the homestays, and the general vibes..."
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full px-4 py-3 bg-mountain-900/60 border border-white/5 rounded-xl focus:border-orange-500 focus:outline-none text-white font-medium resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/2 py-3.5 border border-white/10 hover:border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-1/2 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-600/20 transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
