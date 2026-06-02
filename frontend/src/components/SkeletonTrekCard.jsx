import React from 'react';

export default function SkeletonTrekCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full animate-pulse border border-white/5 bg-mountain-900/40">
      
      {/* Trek Image Placeholder */}
      <div className="relative h-56 bg-mountain-800/60 overflow-hidden">
        {/* Difficulty badge placeholder */}
        <div className="absolute top-4 left-4 w-20 h-6 bg-mountain-700/50 rounded-full"></div>
        {/* Pricing badge placeholder */}
        <div className="absolute bottom-4 right-4 w-16 h-8 bg-mountain-700/50 rounded-lg"></div>
      </div>

      {/* Trek Content Placeholder */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        {/* Trek Title */}
        <div className="w-3/4 h-6 bg-mountain-850 rounded-lg"></div>
        {/* Tagline */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-mountain-850/60 rounded-md"></div>
          <div className="w-5/6 h-4 bg-mountain-850/60 rounded-md"></div>
        </div>

        {/* Stats Grid Placeholder */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-mountain-800"></div>
            <div className="w-16 h-3 bg-mountain-800 rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-mountain-800"></div>
            <div className="w-20 h-3 bg-mountain-800 rounded"></div>
          </div>
        </div>

        {/* Action Controls Placeholder */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 bg-mountain-800 rounded-xl"></div>
          <div className="h-10 bg-mountain-800 rounded-xl"></div>
        </div>
      </div>

    </div>
  );
}
