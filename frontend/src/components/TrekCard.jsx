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
    <div className="group rounded-2xl overflow-hidden flex flex-col h-full bg-mountain-900 border border-mountain-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
      
      {/* Trek Thumbnail */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img 
          src={getCompressedImgUrl(image, 500)} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Difficulty Badge */}
        <span className={`absolute top-4 left-4 z-20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${getDifficultyStyles(difficulty)}`}>
          {difficulty}
        </span>
      </div>

      {/* Trek Content */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Trek Name */}
        <h3 className="font-display font-black text-xl sm:text-2xl text-mountain-100 group-hover:text-forest-500 transition-colors duration-300 line-clamp-1 mb-1.5">
          {name}
        </h3>
        
        {/* Tagline */}
        <p className="font-sans text-sm text-mountain-400 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
          {tagline}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 border-t border-mountain-800 pt-3.5 mb-4 mt-auto text-xs sm:text-sm font-sans font-semibold text-mountain-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-forest-500 shrink-0" />
            <span className="truncate">{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">{distance || '12 km'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-forest-500 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
        </div>

        {/* Pricing block */}
        <div className="flex justify-between items-center mb-4 pt-1">
          <span className="text-xs sm:text-sm uppercase font-bold tracking-wider text-mountain-500">Trek Cost:</span>
          <span className="font-display font-black text-2xl sm:text-3xl text-forest-500 flex items-center">
            ₹{price}
          </span>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link 
            to={`/trek/${trekId}`}
            className="py-2.5 text-center text-xs font-black uppercase tracking-wider text-forest-500 border border-forest-500/30 hover:border-forest-500 hover:bg-forest-50 rounded-xl active:scale-95 transition-all duration-200 min-h-[42px] flex items-center justify-center"
          >
            Details
          </Link>
          <Link 
            to={`/booking?trek=${encodeURIComponent(name)}`}
            className="py-2.5 text-center text-xs font-black uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 rounded-xl active:scale-95 transition-all duration-200 glow-orange min-h-[42px] flex items-center justify-center"
          >
            Book Now
          </Link>
        </div>
      </div>

    </div>
  );
}
