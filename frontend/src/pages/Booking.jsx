import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, ShieldCheck, QrCode, Upload, ArrowRight, ArrowLeft, IndianRupee, HelpCircle, PhoneCall, Check, Users } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const trekParam = searchParams.get('trek');
  
  const [treks, setTreks] = useState([]);
  const [step, setStep] = useState(1); // Step 1: Choose Trek, Step 2: Fill Details, Step 3: Pay & Confirm

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

  // 1. Fetch treks and load auto-saved inputs
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchTreks = async () => {
      try {
        const data = await apiService.getTreks();
        setTreks(data);
        
        // Load temp inputs from localStorage if any
        const savedTempData = localStorage.getItem('kaggadu_booking_temp_inputs');
        if (savedTempData) {
          const parsed = JSON.parse(savedTempData);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Keep URL query trek param if it is explicitly passed
            selectedTrek: trekParam || parsed.selectedTrek || (data.length > 0 ? data[0].name : '')
          }));
          if (parsed.paymentScreenshot) {
            setFilePreview(parsed.paymentScreenshot);
          }
        } else {
          if (trekParam) {
            setFormData(prev => ({ ...prev, selectedTrek: trekParam }));
          } else if (data.length > 0) {
            setFormData(prev => ({ ...prev, selectedTrek: data[0].name }));
          }
        }
      } catch (err) {
        console.error("Failed fetching treks", err);
      }
    };
    fetchTreks();
  }, [trekParam]);

  // 2. Write inputs to local storage on modification (Auto-Save Form Inputs)
  const saveTempInput = (updatedState) => {
    localStorage.setItem('kaggadu_booking_temp_inputs', JSON.stringify({
      ...updatedState,
      paymentScreenshot: '' // Clear heavy base64 strings to prevent quota exhaustion
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      saveTempInput(newState);
      return newState;
    });
  };

  const handleGenderSelect = (g) => {
    setFormData(prev => {
      const newState = { ...prev, gender: g };
      saveTempInput(newState);
      return newState;
    });
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

  // Step Navigations with Validation Checks
  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.selectedTrek) {
        setError('Please select an expedition!');
        return;
      }
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.emergencyContact) {
        setError('Please fill in all participant registration fields!');
        return;
      }
      if (formData.phone.length < 10) {
        setError('Please enter a valid 10-digit WhatsApp number!');
        return;
      }
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.paymentScreenshot) {
      setError('Please upload your payment transfer receipt screenshot!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedTrekData = treks.find(t => t.name === formData.selectedTrek);
      const trekDate = selectedTrekData ? selectedTrekData.date : 'TBD';

      const res = await apiService.createBooking({
        ...formData,
        trekDate
      });

      // Clear temp storage on successful booking
      localStorage.removeItem('kaggadu_booking_temp_inputs');
      navigate('/booking-confirmation', { state: { booking: res } });
    } catch (err) {
      console.error(err);
      setError('Failed to submit booking request. Try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTrekData = treks.find(t => t.name === formData.selectedTrek);
  const cost = selectedTrekData ? selectedTrekData.price : 0;
  const trekDateStr = selectedTrekData ? selectedTrekData.date : 'Every Sat-Sun';
  const trekDistanceStr = selectedTrekData ? selectedTrekData.distance || '12 km' : '12 km';
  
  // High-Converting UPI deep link (opens PhonePe/Paytm/GPay prefilled on mobile)
  const upiLink = `upi://pay?pa=8310668859@axl&pn=Kaggadu%20Adventures&am=${cost}&cu=INR`;

  return (
    <div className="bg-mountain-950 min-h-screen pt-24 pb-24 relative overflow-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto px-4 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] uppercase font-black tracking-widest text-forest-500 block mb-1">Fast Reservation</span>
          <h1 className="font-display font-black text-3xl text-white uppercase leading-none">SECURE YOUR <span className="text-gradient-orange">SEAT</span></h1>
        </div>

        {/* 3-STEP PROGRESS INDICATOR BAR */}
        <div className="flex items-center justify-between mb-8 max-w-sm mx-auto bg-mountain-900/30 p-2.5 rounded-2xl border border-white/5">
          {[
            { num: 1, label: 'Select' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Confirm' }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center font-display font-black text-xs transition-colors duration-300 border ${
                  step === s.num 
                    ? 'bg-orange-600 border-orange-500 text-white' 
                    : step > s.num
                    ? 'bg-forest-750 border-forest-550 text-white'
                    : 'bg-mountain-900 border-white/10 text-mountain-450'
                }`}
              >
                {step > s.num ? <Check className="w-3 h-3 text-white" /> : s.num}
              </div>
              <span className={`text-[10px] font-sans font-black uppercase tracking-wider ${
                step === s.num ? 'text-white' : 'text-mountain-450'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider text-center">
            ⚠️ {error}
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-mountain-900/40 shadow-2xl relative">
          
          {/* STEP 1: CHOOSE EXPEDITION */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-orange-500" /> Choose Expedition
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-mountain-400 block">Select Trek Destination</label>
                <select 
                  name="selectedTrek"
                  value={formData.selectedTrek}
                  onChange={handleChange}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white font-black focus:outline-none focus:border-forest-500 transition cursor-pointer"
                >
                  {treks.map((t) => (
                    <option key={t.id || t._id} value={t.name}>
                      {t.name} (₹{t.price})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrekData && (
                <div className="p-4 bg-mountain-900/60 rounded-2xl border border-white/5 space-y-3 font-sans text-xs">
                  <div className="flex justify-between text-mountain-400">
                    <span>Batch Date:</span>
                    <span className="text-white font-black uppercase tracking-wider">{trekDateStr}</span>
                  </div>
                  <div className="flex justify-between text-mountain-400">
                    <span>Trail Length:</span>
                    <span className="text-white font-black">{trekDistanceStr}</span>
                  </div>
                  <div className="flex justify-between text-mountain-400">
                    <span>Duration:</span>
                    <span className="text-white font-black">{selectedTrekData.duration}</span>
                  </div>
                  <div className="flex justify-between text-mountain-400 border-b border-white/5 pb-2">
                    <span>Forest Permits & Taxes:</span>
                    <span className="text-forest-400 font-bold">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-1">
                    <span className="text-[10px] uppercase font-black text-mountain-450">Trek Cost / seat:</span>
                    <span className="font-display font-black text-xl text-orange-500 flex items-center gap-0.5 glow-orange">
                      <IndianRupee className="w-4.5 h-4.5" /> {cost}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg glow-orange flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition min-h-[44px]"
              >
                Proceed to details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: FILL PARTICIPANT DETAILS */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-500" /> Participant details
              </h3>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Full Name (As in Govt ID)</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Darshan Gowda"
                  autoComplete="name"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-forest-500 transition font-bold"
                  required
                />
              </div>

              {/* Phone Number (Numeric keyboard optimized) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">WhatsApp Number (For coordination)</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-Digit Phone (e.g. 9988776655)"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-forest-500 transition font-bold"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Email Address (For receipts)</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. arjun@gmail.com"
                  autoComplete="email"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-forest-500 transition font-bold"
                  required
                />
              </div>

              {/* Age & Gender Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Age</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 21"
                    min="12"
                    max="65"
                    inputMode="numeric"
                    className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-forest-500 transition font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Gender</label>
                  <div className="flex gap-1">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => handleGenderSelect(g)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition cursor-pointer ${
                          formData.gender === g 
                            ? 'bg-forest-750/30 border-forest-550 text-forest-400' 
                            : 'border-white/10 bg-mountain-900 text-mountain-450'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Emergency Contact (Relation & Phone)</label>
                <input 
                  type="text" 
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Mother: 9988776600"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-forest-500 transition font-bold"
                  required
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 py-3.5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 py-3.5 bg-orange-650 hover:bg-orange-550 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-orange flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition min-h-[44px]"
                >
                  Pay & Confirm <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAY & CONFIRM */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-500" /> Complete Payment (UPI)
              </h3>

              {/* Booking Recap */}
              <div className="p-4 bg-mountain-900/60 rounded-2xl border border-white/5 text-xs space-y-2">
                <div className="flex justify-between text-mountain-450">
                  <span>Selected expedition:</span>
                  <span className="text-white font-bold truncate max-w-[180px]">{formData.selectedTrek}</span>
                </div>
                <div className="flex justify-between text-mountain-450 border-b border-white/5 pb-2">
                  <span>Date schedule:</span>
                  <span className="text-white font-bold">{trekDateStr}</span>
                </div>
                <div className="flex justify-between items-end pt-1">
                  <span className="text-[10px] uppercase font-black text-mountain-450">Payable amount:</span>
                  <span className="font-display font-black text-lg text-orange-500 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" /> {cost}
                  </span>
                </div>
              </div>

              {/* UPI scanning & Deep linking */}
              <div className="bg-mountain-900/80 p-4 rounded-2xl border border-white/5 text-center space-y-3">
                <span className="text-[9px] uppercase font-black text-mountain-500 block">Trek Coordinator UPI ID</span>
                <span className="font-display font-black text-sm text-white tracking-widest block bg-mountain-950 p-2 rounded-lg border border-white/5 selection:bg-orange-500">8310668859@axl</span>
                
                {/* Instant Mobile Deep link */}
                <a 
                  href={upiLink} 
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 w-full bg-indigo-650 hover:bg-indigo-550 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer min-h-[44px]"
                >
                  <IndianRupee className="w-3.5 h-3.5" /> Tap to pay via UPI App
                </a>
                
                <p className="text-[8px] text-mountain-500 font-bold leading-normal">
                  *Deep-linking opens GPay, PhonePe, or Paytm instantly on Android & iOS devices with prefilled total amount.
                </p>
              </div>

              {/* Screenshots upload */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-mountain-400 block">Upload Transfer Screenshot</label>
                
                <label className="w-full h-32 bg-mountain-900 hover:bg-mountain-850 border-2 border-dashed border-white/10 hover:border-forest-550/40 rounded-2xl cursor-pointer transition flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  
                  {filePreview ? (
                    <img 
                      src={filePreview} 
                      alt="Uploaded Screenshot" 
                      className="absolute inset-0 w-full h-full object-contain bg-mountain-950/80 opacity-90"
                    />
                  ) : (
                    <div className="text-center space-y-1.5">
                      <Upload className="w-6 h-6 text-orange-500 mx-auto" />
                      <span className="text-[11px] text-mountain-300 font-bold block">Capture or select Screenshot</span>
                      <span className="text-[9px] text-mountain-500 block">JPG, PNG up to 2MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-1/3 py-3.5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3.5 bg-forest-700 hover:bg-forest-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-forest transition duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>Confirm Booking <ShieldCheck className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
