import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Compass, Sparkles, ShieldCheck, Calendar, Users, Mail, Phone, Clock, MessageSquare } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  const whatsappNumber = "+919876543210";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20Explore%20Beyond%20Limits!%20I%20just%2520registered%20for%20a%20trek.%20Here%20is%20my%20details!`;

  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 relative overflow-hidden font-sans flex items-center justify-center">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto px-6 relative z-10 w-full">
        
        <div className="glass-card p-8 rounded-3xl border border-forest-500/20 text-center space-y-6">
          
          {/* Celebrating graphic icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-forest-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-mountain-900 border border-forest-500/30 p-5 rounded-full flex items-center justify-center text-forest-400">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-forest-400">
              Registration Successful
            </span>
            <h1 className="font-display font-black text-3xl text-white uppercase tracking-wide">
              TRAIL REQUEST RECEIVED!
            </h1>
            <p className="text-xs text-mountain-400 leading-relaxed max-w-sm mx-auto">
              Awesome! Your booking application has been recorded. Our community leads will review your uploaded transfer receipt within 2 to 4 hours.
            </p>
          </div>

          {/* Details Breakdown */}
          {booking && (
            <div className="p-5 bg-mountain-900/60 rounded-2xl border border-white/5 text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between text-mountain-400">
                <span>Booking ID:</span>
                <span className="text-white font-bold">{booking.id || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-mountain-400">
                <span>Trekker Name:</span>
                <span className="text-white font-bold">{booking.name}</span>
              </div>
              <div className="flex justify-between text-mountain-400">
                <span>Selected Destination:</span>
                <span className="text-white font-bold">{booking.selectedTrek}</span>
              </div>
              <div className="flex justify-between text-mountain-400 border-b border-white/5 pb-2.5">
                <span>Contact Number:</span>
                <span className="text-white font-bold">{booking.phone}</span>
              </div>
              <div className="flex justify-between text-mountain-400 items-center">
                <span>Verification Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black uppercase text-[9px] tracking-wide">
                  Pending Verification
                </span>
              </div>
            </div>
          )}

          {/* WhatsApp Helper CTA */}
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center space-y-2.5">
            <p className="text-[11px] text-emerald-400 font-semibold leading-relaxed">
              Want instant verification? WhatsApp your booking details directly to our leads for priority approval.
            </p>
            <a 
              href={whatsappUrl}
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Send Instant Ping
            </a>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 pt-2">
            <Link 
              to="/" 
              className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider text-mountain-400 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition duration-300"
            >
              Back to Home
            </Link>
            <Link 
              to="/gallery" 
              className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider text-white bg-mountain-900 border border-white/5 rounded-xl hover:bg-mountain-850 transition duration-300"
            >
              Explore Gallery
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
