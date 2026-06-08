import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Compass, Sparkles, ShieldCheck, Calendar, Users, Mail, Phone, Clock, MessageSquare } from 'lucide-react';

export default function BookingConfirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  const whatsappNumber = "7760013106";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 relative overflow-hidden font-sans flex items-center justify-center">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto px-6 relative z-10 w-full">
        
        <div className="glass-card p-8 rounded-3xl border border-mountain-800 text-center space-y-6 shadow-xl">
          
          {/* Celebrating graphic icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-forest-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-mountain-900 border border-forest-500/35 p-5 rounded-full flex items-center justify-center text-forest-500">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-forest-600">
              Registration Successful
            </span>
            <h1 className="font-display font-black text-3xl text-mountain-100 uppercase tracking-wide">
              TRAIL REQUEST RECEIVED!
            </h1>
            <p className="text-xs text-mountain-400 leading-relaxed max-w-sm mx-auto">
              Awesome! Your booking application has been recorded. Our community leads will review your uploaded transfer receipt within 2 to 4 hours.
            </p>
          </div>

          {/* Details Breakdown */}
          {booking && (
            <div className="p-5 bg-mountain-950 rounded-2xl border border-mountain-800 text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between text-mountain-500">
                <span>Booking ID:</span>
                <span className="text-mountain-100 font-bold">{booking.id || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-mountain-500">
                <span>Trekker Name:</span>
                <span className="text-mountain-100 font-bold">{booking.name}</span>
              </div>
              <div className="flex justify-between text-mountain-500">
                <span>Selected Destination:</span>
                <span className="text-mountain-100 font-bold">{booking.selectedTrek}</span>
              </div>
              <div className="flex justify-between text-mountain-500 border-b border-mountain-800 pb-2.5">
                <span>Contact Number:</span>
                <span className="text-mountain-100 font-bold">{booking.phone}</span>
              </div>
              <div className="flex justify-between text-mountain-500 items-center">
                <span>Verification Status:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 font-black uppercase text-[9px] tracking-wide">
                  Pending Verification
                </span>
              </div>
            </div>
          )}

          {/* WhatsApp Helper CTA */}
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-550/20 text-center space-y-2.5">
            <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed">
              Want instant verification? WhatsApp your booking details directly to our leads for priority approval.
            </p>
            <a 
              href={whatsappUrl}
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 shadow-md"
            >
              <MessageSquare className="w-4 h-4" /> Send Instant Ping
            </a>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 pt-2">
            <Link 
              to="/" 
              className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider text-mountain-400 border border-mountain-800 rounded-xl hover:bg-mountain-950 hover:text-mountain-100 transition duration-300"
            >
              Back to Home
            </Link>
            <Link 
              to="/" 
              className="flex-1 py-3 text-center text-xs font-black uppercase tracking-wider text-forest-500 bg-mountain-900 border border-forest-500/30 hover:bg-forest-50 rounded-xl transition duration-300"
            >
              Browse More Treks
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
