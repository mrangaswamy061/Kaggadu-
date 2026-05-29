import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Compass, IndianRupee } from 'lucide-react';

export default function TrekCard({ trek }) {
  const { id, _id, name, tagline, difficulty, price, duration, date, image } = trek;
  const trekId = id || _id;

  // Determine difficulty color styling
  const getDifficultyStyles = (diff) => {
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

  return (
    <div className="group glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col h-full">
      
      {/* Trek Thumbnail */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-mountain-950/80 via-transparent to-transparent z-10"></div>
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
          loading="lazy"
        />
        
        {/* Difficulty Badge */}
        <span className={`absolute top-4 left-4 z-20 px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full border ${getDifficultyStyles(difficulty)}`}>
          {difficulty}
        </span>

        {/* Pricing Badge */}
        <span className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 text-sm font-black rounded-lg bg-orange-500 text-white shadow-lg flex items-center gap-0.5">
          <IndianRupee className="w-3.5 h-3.5" />
          {price}
        </span>
      </div>

      {/* Trek Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-xl text-white group-hover:text-orange-500 transition-colors duration-350 line-clamp-1 mb-2">
          {name}
        </h3>
        <p className="font-sans text-sm text-mountain-400 line-clamp-2 mb-6 min-h-[40px]">
          {tagline}
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mb-6 mt-auto">
          <div className="flex items-center gap-2.5 font-sans text-xs text-mountain-400">
            <Clock className="w-4 h-4 text-forest-500 shrink-0" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2.5 font-sans text-xs text-mountain-400">
            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to={`/trek/${trekId}`}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-mountain-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            Details
          </Link>
          <Link 
            to={`/booking?trek=${encodeURIComponent(name)}`}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white bg-forest-700 hover:bg-forest-600 rounded-xl transition-all duration-300 glow-forest"
          >
            Book Now
          </Link>
        </div>
      </div>

    </div>
  );
}
