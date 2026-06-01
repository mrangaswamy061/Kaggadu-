import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, ShieldCheck, QrCode, Upload, ArrowRight, IndianRupee, HelpCircle, PhoneCall } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const trekParam = searchParams.get('trek');
  
  const [treks, setTreks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    emergencyContact: '',
    selectedTrek: '',
    paymentScreenshot: ''
  });
  
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTreks = async () => {
      try {
        const data = await apiService.getTreks();
        setTreks(data);
        if (trekParam) {
          setFormData(prev => ({ ...prev, selectedTrek: trekParam }));
        } else if (data.length > 0) {
          setFormData(prev => ({ ...prev, selectedTrek: data[0].name }));
        }
      } catch (err) {
        console.error("Failed fetching treks", err);
      }
    };
    fetchTreks();
  }, [trekParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Screenshot size should be less than 2MB!');
        return;
      }
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setFormData(prev => ({ ...prev, paymentScreenshot: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.emergencyContact || !formData.selectedTrek) {
      setError('Please fill in all participant details!');
      return;
    }

    if (!formData.paymentScreenshot) {
      setError('Please upload your payment transfer receipt screenshot!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Separate trek place and trek date
      const selectedTrekData = treks.find(t => t.name === formData.selectedTrek);
      const trekDate = selectedTrekData ? selectedTrekData.date : 'TBD';

      const res = await apiService.createBooking({
        ...formData,
        trekDate
      });
      // Navigate to confirmation with booking details in state
      navigate('/booking-confirmation', { state: { booking: res } });
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking request. Try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find price of selected trek
  const selectedTrekData = treks.find(t => t.name === formData.selectedTrek);
  const cost = selectedTrekData ? selectedTrekData.price : 0;
  const upiLink = `upi://pay?pa=8310668859@axl&pn=Explore%20Beyond%20Limits&am=${cost}&cu=INR`;

  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 relative overflow-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-700/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-black tracking-widest text-forest-500 block mb-2">Secure Reservation</span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase">RESERVE YOUR <span className="text-gradient-orange">EXPEDITION</span></h1>
          <p className="text-sm text-mountain-400 mt-3 font-medium">Please enter exact details as per your Government ID for forest permissions and insurance coverage.</p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Left Block: Participant Registration Form */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
            
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide flex items-center gap-2 border-b border-white/5 pb-3">
              <Compass className="w-5 h-5 text-orange-500" /> Participant Details
            </h3>

            {/* Trek Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Select Expedition</label>
              <select 
                name="selectedTrek"
                value={formData.selectedTrek}
                onChange={handleChange}
                className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-forest-500 transition cursor-pointer"
              >
                {treks.map((t) => (
                  <option key={t.id || t._id} value={t.name}>
                    {t.name} (₹{t.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Full Name (As in ID)</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Darshan Gowda"
                className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-forest-500 transition"
                required
              />
            </div>

            {/* Email & Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Phone Number (WhatsApp)</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 99887 76655"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-forest-500 transition"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. name@gmail.com"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-forest-500 transition"
                  required
                />
              </div>
            </div>

            {/* Age & Gender grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Age</label>
                <input 
                  type="number" 
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  min="12"
                  max="65"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-forest-500 transition"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                        formData.gender === g 
                          ? 'bg-forest-700/25 border-forest-500 text-forest-400' 
                          : 'border-white/10 bg-mountain-900 text-mountain-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Emergency Contact Detail (Name & Number)</label>
              <input 
                type="text" 
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. Mother: +91 99887 76600"
                className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-forest-500 transition"
                required
              />
            </div>

          </div>

          {/* Right Block: Cost Summary & Mock Payments */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cost Breakup Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-white/5 pb-3">Booking Summary</h3>
              <div className="flex justify-between text-sm text-mountain-400 font-medium">
                <span>Selected Destination:</span>
                <span className="text-white font-bold text-right max-w-[200px] truncate">{formData.selectedTrek}</span>
              </div>
              <div className="flex justify-between text-sm text-mountain-400 font-medium border-b border-white/5 pb-3">
                <span>Tax & Forest Permits:</span>
                <span className="text-forest-400 font-bold">Included</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs uppercase font-black text-mountain-400">Total Booking Price:</span>
                <span className="font-display font-black text-2xl text-orange-500 flex items-center gap-0.5">
                  <IndianRupee className="w-5 h-5" /> {cost}
                </span>
              </div>
            </div>

            {/* Payment Panel GPay / PhonePe */}
            <div className="glass-card p-6 rounded-3xl border border-forest-900/30 bg-forest-950/5 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-forest-900/10 rounded-full blur-xl"></div>
              
              <div>
                <h4 className="font-display font-black text-sm text-white uppercase tracking-wide flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-orange-500 animate-pulse" /> Complete Payment (UPI)
                </h4>
                <p className="text-[11px] text-mountain-400 mt-1">Please transfer the total booking fee to the authorized community coordinator UPI.</p>
              </div>

              {/* UPI address and Gpay details */}
              <div className="bg-mountain-900/80 p-5 rounded-2xl border border-white/5 text-center space-y-3">
                <span className="text-[10px] uppercase font-black text-mountain-500 block">Scan UPI QR / VPA Address</span>
                <span className="font-display font-black text-base text-white tracking-wider block">8310668859@axl</span>
                
                <a 
                  href={upiLink} 
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 shadow-md hover:translate-y-[-1px] cursor-pointer"
                >
                  <IndianRupee className="w-3.5 h-3.5 shrink-0" /> Pay via UPI App (₹{cost})
                </a>
                
                <p className="text-[10px] text-mountain-500 font-semibold leading-relaxed">
                  *UPI deep-linking opens PhonePe, GPay, or Paytm instantly on mobile with pre-filled details!
                </p>
              </div>

              {/* Upload screenshot box */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-mountain-400 block">Upload Transfer Screenshot</label>
                
                <label className="w-full h-36 bg-mountain-900 hover:bg-mountain-850/80 border-2 border-dashed border-white/10 hover:border-forest-500/50 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {filePreview ? (
                    <img 
                      src={filePreview} 
                      alt="Uploaded Screenshot" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-8 h-8 text-orange-500 mx-auto" />
                      <span className="text-xs text-mountain-300 font-bold block">Select Screenshot File</span>
                      <span className="text-[10px] text-mountain-500 block">JPG, PNG up to 2MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-forest-700 hover:bg-forest-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg glow-forest transition duration-300 hover:translate-y-[-2px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Submit Registration <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-mountain-500 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-500" /> Authorized Safe Ecotourism
              </div>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}
