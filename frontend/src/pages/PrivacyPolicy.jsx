import React from 'react';
import { Compass, ShieldAlert, FileText, CheckCircle2, Trees } from 'lucide-react';

export default function PrivacyPolicy() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 font-sans text-mountain-300 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="bg-mountain-900 border border-white/10 p-3 rounded-full inline-block text-orange-500">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
            Privacy Policy & Terms
          </h1>
          <p className="text-xs text-mountain-500 font-bold uppercase tracking-widest">
            Last Updated: May 26, 2026
          </p>
        </div>

        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/5 space-y-6 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wide flex items-center gap-2">
              <Trees className="w-5 h-5 text-forest-500" /> 1. Ecotourism & Environment Pledge
            </h3>
            <p>
              Explore Beyond Limits operates strictly under the **Karnataka Forest Department green directives** and ecotourism guidelines. We mandate a zero-tolerance policy towards plastic littering, wildlife disturbance, and biological harvesting during any of our trekking expeditions.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wide flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-500" /> 2. Booking Verification & Refunds
            </h3>
            <p>
              All seat reservations require verification of UPI payment transfers. Standard bookings are non-refundable but fully transferable to another participant of your choice, provided the transfer details are updated at least 24 hours prior to departure.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> 3. Medical Indemnity & Safety
            </h3>
            <p>
              Trekking is an active physical outdoor sport. All participants must confirm they are physically fit and free of heart conditions or respiratory ailments. Explore Beyond Limits supplies basic first-aid, but participants are responsible for carrying custom prescriptions.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-forest-400" /> 4. Data Privacy Pledge
            </h3>
            <p>
              Your contact numbers, emergency details, and government-required identification are solely utilized to procure forest permits, group travel insurance, and direct booking support via WhatsApp. We never share or sell participant data to third-party brokers.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
}
