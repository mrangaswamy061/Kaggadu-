import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, Compass, IndianRupee, ChevronRight, ShieldCheck, MapPin, ListCollapse, Award, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function TrekDetails() {
  const { id } = useParams();
  const [trek, setTrek] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrek = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getTrekById(id);
        setTrek(data);
      } catch (err) {
        console.error("Failed fetching trek details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrek();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-mountain-950">
        <div className="w-12 h-12 border-4 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trek) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-mountain-950 text-center px-6">
        <Compass className="w-16 h-16 text-orange-500 mb-4 animate-bounce" />
        <h2 className="font-display font-black text-2xl text-white uppercase mb-2">Trek Not Found</h2>
        <p className="font-sans text-sm text-mountain-400 mb-6">The requested trek expedition could not be loaded.</p>
        <Link to="/" className="px-6 py-3 bg-forest-700 text-white text-xs font-bold uppercase rounded-lg">
          Return to Base camp
        </Link>
      </div>
    );
  }

  const { name, tagline, difficulty, difficultyLevel, price, duration, date, image, highlights, pickupPoints, inclusions, exclusions, itinerary, gallery } = trek;

  // Determine difficulty details
  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'moderate': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'challenging':
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-mountain-400 bg-mountain-500/10 border-mountain-500/20';
    }
  };

  return (
    <div className="bg-mountain-950 min-h-screen pb-24">
      
      {/* Immersive Header Banner */}
      <div className="relative h-[65vh] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/60 to-transparent z-10"></div>
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover animate-[pulse_10s_infinite]"
          />
        </div>

        {/* Banner Details */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full pb-12">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mountain-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-orange-500">{name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span className={`inline-block px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full border mb-4 ${getDifficultyColor(difficulty)}`}>
                {difficulty} EXPEDITION
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-none">
                {name}
              </h1>
              <p className="font-sans text-sm sm:text-base text-mountain-300 mt-3 max-w-2xl font-medium">
                {tagline}
              </p>
            </div>

            {/* Quick Pricing Box */}
            <div className="glass-card p-6 rounded-2xl border border-mountain-800 shrink-0 lg:w-80 flex items-center justify-between lg:flex-col lg:items-stretch gap-4 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-mountain-500 block">Trek Cost / Person</span>
                <span className="font-display font-black text-3xl text-mountain-100 flex items-center gap-0.5 mt-1">
                  <IndianRupee className="w-6 h-6 text-orange-500" /> {price}
                </span>
              </div>
              <Link 
                to={`/booking?trek=${encodeURIComponent(name)}`}
                className="px-6 py-3 lg:w-full text-center text-xs font-black uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition duration-300 glow-orange whitespace-nowrap block"
              >
                Reserve Seat Now
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        
        {/* Left Column: Details, Timeline, Highlights */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 glass-card rounded-2xl border border-mountain-800 font-sans shadow-sm">
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-mountain-500 block">Duration</span>
              <span className="text-sm font-black text-mountain-100 mt-1 block">{duration}</span>
            </div>
            <div className="text-center sm:text-left border-l border-mountain-800 pl-4 sm:pl-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-mountain-500 block">Departure</span>
              <span className="text-sm font-black text-mountain-100 mt-1 block">{date}</span>
            </div>
            <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-mountain-800 pt-4 sm:pt-0 pl-0 sm:pl-4 col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-mountain-500 block">Start Point</span>
              <span className="text-sm font-black text-mountain-100 mt-1 block">Bengaluru</span>
            </div>
            <div className="text-center sm:text-left border-t sm:border-t-0 border-l sm:border-l border-mountain-800 pt-4 sm:pt-0 pl-4 sm:pl-4 col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-mountain-500 block">Max Altitude</span>
              <span className="text-sm font-black text-mountain-100 mt-1 block">1894 Mtr</span>
            </div>
          </div>

          {/* Difficulty Gauge Meter */}
          <div className="glass-card p-6 rounded-2xl border border-mountain-800 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-mountain-100 uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" /> Difficulty Gauge
              </h3>
              <span className="text-xs font-black uppercase text-mountain-300">
                {difficultyLevel}% Intensity
              </span>
            </div>

            {/* Visual Gauge bar */}
            <div className="h-3 w-full bg-mountain-900 rounded-full overflow-hidden relative border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${difficultyLevel}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 text-[10px] uppercase tracking-wider font-black text-mountain-500">
              <span className="text-green-500">Eco-Hike (0-40)</span>
              <span className="text-orange-500 text-center">Moderate Trail (40-75)</span>
              <span className="text-red-500 text-right">Summit Climb (75+)</span>
            </div>
          </div>

          {/* Highlights Section */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-mountain-100 uppercase flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span> Expedition Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="p-4 bg-mountain-900 rounded-2xl border border-mountain-800 flex gap-3.5 items-start shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-forest-900/50 text-forest-400 font-display font-bold text-xs shrink-0 mt-0.5 border border-forest-500/20">
                    {i + 1}
                  </span>
                  <p className="font-sans text-sm text-mountain-300 leading-relaxed font-medium">
                    {h}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Timeline Itinerary */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-mountain-100 uppercase flex items-center gap-2">
              <span className="w-1.5 h-4 bg-forest-500 rounded-full"></span> Comprehensive Itinerary
            </h3>
            
            <div className="relative border-l-2 border-forest-200 ml-3 pl-8 py-2 space-y-10">
              {itinerary.map((step, idx) => (
                <div key={idx} className="relative">
                  
                  {/* Timeline bullet node */}
                  <span className="absolute -left-12 top-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-mountain-900 border-2 border-forest-500 text-xs font-black text-forest-500">
                    {idx + 1}
                  </span>

                  <div>
                    <span className="text-xs uppercase font-black tracking-widest text-orange-500 block mb-1">
                      {step.day}
                    </span>
                    <h4 className="font-display font-bold text-lg text-mountain-100 mb-2">
                      {step.title}
                    </h4>
                    <p className="font-sans text-sm text-mountain-400 leading-relaxed max-w-3xl">
                      {step.desc}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-2xl text-mountain-100 uppercase flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span> Trail Memories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {gallery && gallery.map((pic, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-white/5 aspect-[4/3] group relative shadow-lg">
                  <img 
                    src={pic} 
                    alt={`Trail view ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-white rotate-45" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Inclusions, Exclusions, Pickups */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Pickup points */}
          <div className="glass-card p-6 rounded-2xl border border-mountain-800 space-y-4 shadow-sm">
            <h4 className="font-display font-bold text-sm text-mountain-100 uppercase tracking-wider flex items-center gap-2 border-b border-mountain-800 pb-3">
              <MapPin className="w-4 h-4 text-orange-500" /> Pickup Timeline
            </h4>
            <ul className="space-y-3 font-sans text-xs text-mountain-400">
              {pickupPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0"></span>
                  <span className="font-semibold text-mountain-300">{pt}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-mountain-500 italic mt-3">
              *All times are strict. Please report at least 15 minutes prior to departures.
            </p>
          </div>

          {/* Inclusions */}
          <div className="glass-card p-6 rounded-2xl border border-mountain-800 space-y-4 shadow-sm">
            <h4 className="font-display font-bold text-sm text-mountain-100 uppercase tracking-wider flex items-center gap-2 border-b border-mountain-800 pb-3">
              <CheckCircle className="w-4 h-4 text-forest-500" /> What's Included
            </h4>
            <ul className="space-y-3 font-sans text-xs text-mountain-400">
              {inclusions.map((inc, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-forest-500 shrink-0 mt-0.5" />
                  <span className="font-semibold text-mountain-300">{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          <div className="glass-card p-6 rounded-2xl border border-mountain-800 space-y-4 shadow-sm">
            <h4 className="font-display font-bold text-sm text-mountain-100 uppercase tracking-wider flex items-center gap-2 border-b border-mountain-800 pb-3">
              <XCircle className="w-4 h-4 text-red-500" /> What's Excluded
            </h4>
            <ul className="space-y-3 font-sans text-xs text-mountain-400">
              {exclusions.map((exc, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-red-500 shrink-0 font-bold leading-none mt-0.5">✕</span>
                  <span className="font-semibold text-mountain-300">{exc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sticky Reservation CTA (on mobile/bottom) */}
          <div className="p-6 bg-mountain-900 rounded-2xl border border-mountain-800 text-center space-y-4 shadow-sm">
            <h4 className="font-display font-black text-lg text-mountain-100 uppercase tracking-wide">
              Secure Your Vibe
            </h4>
            <p className="font-sans text-xs text-mountain-400">
              Seats fill up fast during weekends in Karnataka. Reserve now, upload screenshot, and get verified.
            </p>
            <Link 
              to={`/booking?trek=${encodeURIComponent(name)}`}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-300 block shadow-lg glow-orange"
            >
              Book Seat Now
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
