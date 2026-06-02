import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Compass, IndianRupee, MapPin } from 'lucide-react';

export default function TrekCard({ trek }) {
  const { id, _id, name, tagline, difficulty, price, duration, distance, date, image } = trek;
  const trekId = id || _id;

  // Determine difficulty color styling
  const getDifficultyStyles = (diff) => {
    if (!diff) return 'bg-mountain-500/10 text-mountain-400 border-mountain-500/20';
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'moderate':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'challenging':
      case 'hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-mountain-500/10 text-mountain-400 border-mountain-500/20';
    }
  };

  // CDN Optimization: Automatic on-the-fly Unsplash WebP compression
  const getCompressedImgUrl = (url, width = 600) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=70&fm=webp`;
    }
    return url;
  };

  return (
    <div className="group glass-card rounded-3xl overflow-hidden flex flex-col h-full border border-white/5 bg-mountain-900/30 hover:border-orange-500/30 transition-all duration-300">
      
      {/* Trek Thumbnail */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-mountain-950/80 via-transparent to-transparent z-10"></div>
        <img 
          src={getCompressedImgUrl(image, 500)} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Difficulty Badge */}
        <span className={`absolute top-4 left-4 z-20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${getDifficultyStyles(difficulty)}`}>
          {difficulty}
        </span>

        {/* Pricing Badge */}
        <span className="absolute bottom-4 right-4 z-20 px-3.5 py-1 text-sm font-black rounded-lg bg-orange-600 text-white shadow-lg flex items-center gap-0.5 glow-orange">
          <IndianRupee className="w-3.5 h-3.5" />
          {price}
        </span>
      </div>

      {/* Trek Content */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Trek Name */}
        <h3 className="font-display font-black text-lg text-white group-hover:text-orange-500 transition-colors duration-300 line-clamp-1 mb-1.5">
          {name}
        </h3>
        
        {/* Tagline */}
        <p className="font-sans text-xs text-mountain-400 line-clamp-2 mb-4 min-h-[32px] leading-relaxed">
          {tagline}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3.5 mb-5 mt-auto text-[11px] font-sans font-semibold text-mountain-450">
          <div className="flex items-center gap-1.5 text-mountain-400">
            <Clock className="w-3.5 h-3.5 text-forest-500 shrink-0" />
            <span className="truncate">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-mountain-400">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{distance || '12 km'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-mountain-400">
            <Calendar className="w-3.5 h-3.5 text-forest-500 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
        </div>

        {/* Action Controls - Large targets for easy thumb tapping */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link 
            to={`/trek/${trekId}`}
            className="py-3 text-center text-xs font-black uppercase tracking-wider text-mountain-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white active:scale-95 transition-all duration-200 min-h-[44px] flex items-center justify-center"
          >
            View Details
          </Link>
          <Link 
            to={`/booking?trek=${encodeURIComponent(name)}`}
            className="py-3 text-center text-xs font-black uppercase tracking-wider text-white bg-forest-700 hover:bg-forest-600 rounded-xl active:scale-95 transition-all duration-200 glow-forest min-h-[44px] flex items-center justify-center"
          >
            Book Now
          </Link>
        </div>
      </div>

    </div>
  );
}
