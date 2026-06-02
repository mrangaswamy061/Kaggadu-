import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Download, Check, X, FileSpreadsheet, Eye, Plus, Trash2, Calendar, Settings, LayoutDashboard, Map, Image, Lock, HelpCircle, Upload } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Tab states: 'bookings' or 'treks'
  const [activeTab, setActiveTab] = useState('bookings');

  // Dashboard Data states
  const [bookings, setBookings] = useState([]);
  const [treks, setTreks] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, approvedBookings: 0, activeTreks: 0 });

  // Showcase Stats Settings state
  const [showcaseStatsForm, setShowcaseStatsForm] = useState({
    trekkersGuided: '4,500+',
    completedTreks: '180+',
    trailsExplored: '25+',
    safetyRating: '4.9/5'
  });
  const [statsSavedMsg, setStatsSavedMsg] = useState('');

  // Lightbox for Payment screenshots
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Trek Creator/Editor states
  const [showTrekForm, setShowTrekForm] = useState(false);
  const [editingTrek, setEditingTrek] = useState(null);
  const [trekFormData, setTrekFormData] = useState({
    name: '', tagline: '', difficulty: 'Moderate', difficultyLevel: 50,
    price: '', duration: '', distance: '', date: '', image: '', highlights: '',
    pickupPoints: '', inclusions: '', exclusions: '', itinerary: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      const logged = apiService.isAdminLoggedIn();
      setIsLoggedIn(logged);
      if (logged) {
        loadDashboardData();
      }
    };
    checkAuth();
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    try {
      const bData = await apiService.getBookings();
      const tData = await apiService.getTreks();
      setBookings([...bData].reverse());
      setTreks(tData);

      // Compute statistics
      const pending = bData.filter(b => b.status === 'Pending').length;
      const approved = bData.filter(b => b.status === 'Approved').length;
      setStats({
        totalBookings: bData.length,
        pendingBookings: pending,
        approvedBookings: approved,
        activeTreks: tData.length
      });

      // Load showcase stats
      const sData = await apiService.getShowcaseStats();
      if (sData) {
        setShowcaseStatsForm(sData);
      }
    } catch (err) {
      console.error("Failed loading admin dashboard data", err);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await apiService.adminLogin(username, password);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = async () => {
    await apiService.adminLogout();
    setIsLoggedIn(false);
  };

  const handleApprove = async (id) => {
    try {
      await apiService.updateBookingStatus(id, 'Approved');
      await loadDashboardData();
    } catch (err) {
      alert("Failed updating booking status!");
    }
  };

  const handleReject = async (id) => {
    try {
      await apiService.updateBookingStatus(id, 'Rejected');
      await loadDashboardData();
    } catch (err) {
      alert("Failed updating booking status!");
    }
  };

  // Trek form submit handler (covers create and update)
  const handleTrekFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedTrek = {
        ...trekFormData,
        price: Number(trekFormData.price),
        difficultyLevel: Number(trekFormData.difficultyLevel),
        highlights: trekFormData.highlights.split('\n').filter(Boolean),
        pickupPoints: trekFormData.pickupPoints.split('\n').filter(Boolean),
        inclusions: trekFormData.inclusions.split('\n').filter(Boolean),
        exclusions: trekFormData.exclusions.split('\n').filter(Boolean),
        itinerary: [
          { day: "Day 1", title: "Expedition Departure", desc: `Pickup from Bangalore, briefing, and night drive details.` },
          { day: "Day 2", title: "Summit Trek & Return", desc: `Trek up ${trekFormData.name}, enjoy views, descend, and return.` }
        ],
        gallery: [
          trekFormData.image,
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80"
        ]
      };

      if (editingTrek) {
        await apiService.updateTrek(editingTrek.id || editingTrek._id, formattedTrek);
      } else {
        await apiService.createTrek(formattedTrek);
      }

      setShowTrekForm(false);
      setEditingTrek(null);
      resetTrekFormData();
      await loadDashboardData();
    } catch (err) {
      alert("Failed storing trek info.");
    }
  };

  const handleEditTrek = (trek) => {
    setEditingTrek(trek);
    setTrekFormData({
      name: trek.name,
      tagline: trek.tagline,
      difficulty: trek.difficulty,
      difficultyLevel: trek.difficultyLevel,
      price: trek.price,
      duration: trek.duration,
      distance: trek.distance || '12 km',
      date: trek.date,
      image: trek.image,
      highlights: trek.highlights.join('\n'),
      pickupPoints: trek.pickupPoints.join('\n'),
      inclusions: trek.inclusions.join('\n'),
      exclusions: trek.exclusions.join('\n'),
      itinerary: ''
    });
    setShowTrekForm(true);
  };

  const handleDeleteTrek = async (id) => {
    if (window.confirm("Are you sure you want to delete this trek?")) {
      try {
        await apiService.deleteTrek(id);
        await loadDashboardData();
      } catch (err) {
        alert("Failed deleting trek.");
      }
    }
  };

  const resetTrekFormData = () => {
    setTrekFormData({
      name: '', tagline: '', difficulty: 'Moderate', difficultyLevel: 50,
      price: '', duration: '', distance: '', date: '', image: '', highlights: '',
      pickupPoints: '', inclusions: '', exclusions: '', itinerary: ''
    });
  };

  const handleTrekFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrekFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // CSV Exporter
  const exportToCSV = () => {
    if (bookings.length === 0) {
      alert("No participant bookings to export!");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Booking ID,Trekker Name,Email,Phone,Age,Gender,Emergency Contact,Trek Place,Trek Date,Status,Registered At\r\n";
    
    bookings.forEach((b) => {
      const row = [
        b.id || b._id,
        `"${b.name}"`,
        b.email,
        b.phone,
        b.age,
        b.gender,
        `"${b.emergencyContact}"`,
        `"${b.selectedTrek}"`,
        `"${b.trekDate || 'Every Sat-Sun'}"`,
        b.status,
        b.createdAt
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kaggadu_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. GATEWAY SCREEN (Logged Out state)
  if (!isLoggedIn) {
    return (
      <div className="bg-mountain-950 min-h-screen pt-24 pb-24 font-sans flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md mx-auto px-4 relative z-10 w-full">
          <form onSubmit={handleLoginSubmit} className="glass-card p-6 sm:p-8 rounded-3xl border border-orange-500/20 shadow-2xl space-y-5">
            <div className="text-center space-y-1.5">
              <div className="bg-mountain-900 border border-white/10 p-3 rounded-full inline-block text-orange-500">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wide">
                Admin Control Room
              </h2>
              <p className="text-[11px] text-mountain-450 leading-relaxed">
                Approve seat receipts and manage trekking batches directly from your smartphone.
              </p>
            </div>

            {loginError && (
              <div className="p-2.5 text-[9px] text-red-400 font-black bg-red-500/10 border border-red-500/20 rounded-xl text-center uppercase tracking-wider">
                {loginError}
              </div>
            )}

            <div className="space-y-3.5 text-[10px] font-black uppercase tracking-wider text-mountain-400">
              <div className="space-y-1">
                <label className="block">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block">Master Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="e.g. password"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-orange-650 hover:bg-orange-550 text-white font-black text-xs uppercase tracking-widest rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer min-h-[44px]"
            >
              Enter Command Cockpit
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW (Logged In state - Redesigned for Mobile-First Cockpit)
  return (
    <div className="bg-mountain-950 min-h-screen pt-24 pb-24 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header command board */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 mb-6">
          <div>
            <span className="text-[9px] uppercase font-black tracking-widest text-forest-500 block mb-0.5">
              Command Cockpit
            </span>
            <h1 className="font-display font-black text-2xl text-white uppercase flex items-center gap-1.5 leading-none">
              <ShieldCheck className="w-6 h-6 text-orange-500 shrink-0" /> Kaggadu Admin Panel
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={exportToCSV}
              className="px-3.5 py-2.5 bg-forest-750 hover:bg-forest-650 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer min-h-[40px] flex-grow sm:flex-grow-0 justify-center"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={handleLogout}
              className="px-3.5 py-2.5 border border-white/10 text-mountain-400 hover:text-white bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition min-h-[40px] flex-grow sm:flex-grow-0 justify-center"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {/* Stats Grid widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, color: 'text-white' },
            { label: 'Pending Receipts', value: stats.pendingBookings, color: 'text-orange-500 animate-pulse' },
            { label: 'Approved seats', value: stats.approvedBookings, color: 'text-forest-450' },
            { label: 'Active Trails', value: stats.activeTreks, color: 'text-orange-500' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl border border-white/5 flex flex-col justify-between min-h-[85px] bg-mountain-900/40">
              <span className="text-[9px] uppercase font-black tracking-wider text-mountain-500">{stat.label}</span>
              <span className={`font-display font-black text-2xl ${stat.color} mt-1.5`}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Showcase Stats Settings Panel */}
        <div className="glass-card p-4 rounded-xl border border-white/5 bg-mountain-900/20 mb-6 text-xs font-black uppercase text-mountain-400">
          <h3 className="font-display font-bold text-sm text-white mb-3 uppercase tracking-wider">Configure Homepage Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[8px]">Trekkers Guided</label>
              <input type="text" value={showcaseStatsForm.trekkersGuided} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, trekkersGuided: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2 text-xs text-white font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px]">Completed Treks</label>
              <input type="text" value={showcaseStatsForm.completedTreks} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, completedTreks: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2 text-xs text-white font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px]">Trails Explored</label>
              <input type="text" value={showcaseStatsForm.trailsExplored} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, trailsExplored: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2 text-xs text-white font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px]">Safety Rating</label>
              <input type="text" value={showcaseStatsForm.safetyRating} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, safetyRating: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2 text-xs text-white font-bold" />
            </div>
          </div>
          <button onClick={async()=>{ try { await apiService.updateShowcaseStats(showcaseStatsForm); setStatsSavedMsg('Showcase stats updated!'); setTimeout(()=>setStatsSavedMsg(''), 2000); } catch(e){ console.error(e); } }} className="mt-3.5 px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white text-[9px] font-black uppercase rounded-lg active:scale-95 transition min-h-[36px] cursor-pointer">
            {statsSavedMsg || 'Save stats'}
          </button>
        </div>

        {/* Tab Selection Switch */}
        <div className="flex gap-2.5 border-b border-white/5 pb-3 mb-6 bg-mountain-900/10 rounded-xl p-1 max-w-sm">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-mountain-450 hover:text-white'
            }`}
          >
            Manage Bookings
          </button>
          <button 
            onClick={() => setActiveTab('treks')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeTab === 'treks' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-mountain-450 hover:text-white'
            }`}
          >
            Configure Treks
          </button>
        </div>

        {/* TAB 1: MANAGE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            
            {/* MOBILE CARD LIST (Hidden on >=768px, highly detailed and swipe-friendly on mobile) */}
            <div className="flex flex-col gap-3 md:hidden">
              {bookings.map((booking) => (
                <div 
                  key={booking.id || booking._id} 
                  className="p-4 bg-mountain-900/40 rounded-2xl border border-white/5 space-y-3.5 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-black text-sm text-white leading-tight">{booking.name}</h4>
                      <p className="text-[9px] text-mountain-450 font-semibold mt-0.5">Age: {booking.age} | {booking.gender}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${
                      booking.status === 'Approved' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : booking.status === 'Rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Trek Details */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans font-semibold text-mountain-400 bg-mountain-950/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[8px] uppercase font-black text-mountain-500 block">Expedition</span>
                      <span className="text-white font-bold block truncate mt-0.5">{booking.selectedTrek}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-black text-mountain-500 block">Date</span>
                      <span className="text-white font-bold block mt-0.5">{booking.trekDate || 'Every Sat-Sun'}</span>
                    </div>
                  </div>

                  {/* Contacts details */}
                  <div className="text-[10px] font-sans font-semibold text-mountain-400 space-y-1">
                    <div className="flex justify-between">
                      <span>WhatsApp Phone:</span>
                      <a href={`tel:${booking.phone}`} className="text-orange-400 font-bold">{booking.phone}</a>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Info:</span>
                      <span className="text-white font-bold">{booking.emergencyContact}</span>
                    </div>
                  </div>

                  {/* Quick-action buttons */}
                  <div className="flex gap-2.5 pt-1.5 border-t border-white/5 items-center justify-between">
                    <button 
                      onClick={() => setSelectedScreenshot(booking.paymentScreenshot)}
                      className="px-3 py-2 bg-mountain-900 border border-white/10 rounded-xl text-[10px] font-black uppercase text-mountain-300 flex items-center gap-1 transition min-h-[38px] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-500" /> View Receipt
                    </button>

                    {booking.status === 'Pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleReject(booking.id || booking._id)}
                          className="px-3.5 py-2 bg-red-650/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition min-h-[38px] cursor-pointer"
                          title="Reject Receipt"
                        >
                          ✕ Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(booking.id || booking._id)}
                          className="px-3.5 py-2 bg-green-650/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/20 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition min-h-[38px] cursor-pointer glow-forest"
                          title="Approve seat"
                        >
                          ✓ Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {bookings.length === 0 && (
                <div className="text-center py-10 border border-white/5 rounded-2xl glass-card text-mountain-500 font-black text-xs uppercase">
                  No bookings found
                </div>
              )}
            </div>

            {/* DESKTOP TABLE VIEW (Visible on >=768px, traditional spreadsheet layout) */}
            <div className="hidden md:block glass-card rounded-3xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left font-sans border-collapse">
                  <thead>
                    <tr className="bg-mountain-900 border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-mountain-500">
                      <th className="p-4 pl-6">Participant</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Trek Expedition</th>
                      <th className="p-4">Receipt</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-mountain-300 font-semibold divide-y divide-white/5">
                    {bookings.map((booking) => (
                      <tr key={booking.id || booking._id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="text-sm font-bold text-white">{booking.name}</div>
                          <div className="text-[10px] text-mountain-500 mt-0.5">Age: {booking.age} | {booking.gender}</div>
                        </td>
                        <td className="p-4">
                          <div>{booking.phone}</div>
                          <div className="text-[10px] text-mountain-500 mt-0.5">{booking.email}</div>
                        </td>
                        <td className="p-4 font-bold text-white max-w-[200px] truncate">
                          <div className="text-sm font-bold text-white">{booking.selectedTrek}</div>
                          <div className="text-[10px] text-mountain-500 font-semibold mt-0.5">{booking.trekDate || 'Every Sat-Sun'}</div>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => setSelectedScreenshot(booking.paymentScreenshot)}
                            className="px-3 py-1.5 rounded-lg bg-mountain-900 hover:bg-mountain-850 border border-white/10 text-mountain-300 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-500" /> View Receipt
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                            booking.status === 'Approved' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : booking.status === 'Rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                          {booking.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(booking.id || booking._id)}
                                className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 transition cursor-pointer"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(booking.id || booking._id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition cursor-pointer"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}

                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-mountain-500 font-bold uppercase tracking-wider">
                          No participant registrations listed
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CONFIGURE TREKS */}
        {activeTab === 'treks' && (
          <div className="space-y-6">
            
            {/* Header and Creator trigger */}
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-base text-white uppercase tracking-wide">
                Destination Trails
              </h3>
              <button 
                onClick={() => { resetTrekFormData(); setEditingTrek(null); setShowTrekForm(!showTrekForm); }}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <Plus className="w-4 h-4 shrink-0" /> Create Trek
              </button>
            </div>

            {/* Trek Creator Form (Optimized for Mobile viewports) */}
            {showTrekForm && (
              <form onSubmit={handleTrekFormSubmit} className="p-5 glass-card border border-orange-500/20 rounded-2xl space-y-4 text-xs font-black uppercase tracking-wider text-mountain-400">
                <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  {editingTrek ? 'Edit Expedition Details' : 'Design Trek Expedition'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Trek Name</label>
                    <input 
                      type="text" 
                      value={trekFormData.name}
                      onChange={e => setTrekFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Skandagiri Sunrise Trek"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Tagline Description</label>
                    <input 
                      type="text" 
                      value={trekFormData.tagline}
                      onChange={e => setTrekFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="e.g. Walk above the clouds at dawn"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label>Difficulty</label>
                    <select 
                      value={trekFormData.difficulty}
                      onChange={e => setTrekFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white cursor-pointer font-bold"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Intensity Gauge (0-100)</label>
                    <input 
                      type="number" 
                      value={trekFormData.difficultyLevel}
                      onChange={e => setTrekFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      value={trekFormData.price}
                      onChange={e => setTrekFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 1499"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Duration</label>
                    <input 
                      type="text" 
                      value={trekFormData.duration}
                      onChange={e => setTrekFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 2 Days / 1 Night"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label>Trail Distance</label>
                    <input 
                      type="text" 
                      value={trekFormData.distance}
                      onChange={e => setTrekFormData(prev => ({ ...prev, distance: e.target.value }))}
                      placeholder="e.g. 8 km or 18 km"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1 font-black uppercase text-mountain-400">
                    <label>Batch Date schedule</label>
                    <input 
                      type="text" 
                      value={trekFormData.date}
                      onChange={e => setTrekFormData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. Every Sat-Sun or June 05, 2026"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Visual Banner URL / File</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={trekFormData.image}
                        onChange={e => setTrekFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Paste image link..."
                        className="flex-grow bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                        required
                      />
                      <label className="px-3 bg-mountain-900 border border-white/10 rounded-xl cursor-pointer text-[10px] text-mountain-400 font-bold flex items-center justify-center gap-1 whitespace-nowrap hover:border-orange-500/30">
                        <Upload className="w-3.5 h-3.5 text-orange-500" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleTrekFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {trekFormData.image && (
                  <div className="relative h-20 w-40 rounded-xl overflow-hidden border border-white/10 bg-mountain-900">
                    <img 
                      src={trekFormData.image} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => setTrekFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-1 right-1 p-1 bg-red-650 rounded-full text-white text-[8px] font-bold leading-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Highlights (One per line)</label>
                    <textarea 
                      value={trekFormData.highlights}
                      onChange={e => setTrekFormData(prev => ({ ...prev, highlights: e.target.value }))}
                      placeholder="High cloud sunrise&#10;Night trekking"
                      rows="3"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans font-bold"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label>Pickup points (One per line)</label>
                    <textarea 
                      value={trekFormData.pickupPoints}
                      onChange={e => setTrekFormData(prev => ({ ...prev, pickupPoints: e.target.value }))}
                      placeholder="MG Road Metro - 9:30 PM&#10;Hebbal Flyover - 10:00 PM"
                      rows="3"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans font-bold"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Includes (One per line)</label>
                    <textarea 
                      value={trekFormData.inclusions}
                      onChange={e => setTrekFormData(prev => ({ ...prev, inclusions: e.target.value }))}
                      placeholder="Transportation&#10;Forest permits"
                      rows="3"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans font-bold"
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label>Excludes (One per line)</label>
                    <textarea 
                      value={trekFormData.exclusions}
                      onChange={e => setTrekFormData(prev => ({ ...prev, exclusions: e.target.value }))}
                      placeholder="Personal Expenses&#10;Extra meals"
                      rows="3"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans font-bold"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowTrekForm(false); setEditingTrek(null); }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-mountain-450 hover:text-white text-xs font-black rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-forest-700 hover:bg-forest-600 text-white text-xs font-black rounded-xl shadow-lg glow-forest cursor-pointer"
                  >
                    {editingTrek ? 'Update Trek' : 'Publish Expedition'}
                  </button>
                </div>
              </form>
            )}

            {/* Trek listings layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treks.map((trek) => (
                <div key={trek.id || trek._id} className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[140px] group bg-mountain-900/30">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase font-black text-orange-500 tracking-widest">{trek.difficulty}</span>
                      <span className="text-[9px] font-sans font-bold text-mountain-500">{trek.distance || '12 km'}</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-white group-hover:text-orange-500 transition line-clamp-1 mt-1">{trek.name}</h4>
                    <p className="text-[10px] text-mountain-500 font-sans mt-0.5">₹{trek.price} | {trek.duration} | {trek.date}</p>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-3 mt-4">
                    <button 
                      onClick={() => handleEditTrek(trek)}
                      className="px-3 py-1.5 bg-mountain-900 hover:bg-mountain-850 border border-white/10 rounded-lg text-[10px] font-black text-mountain-300 cursor-pointer"
                    >
                      Edit Info
                    </button>
                    <button 
                      onClick={() => handleDeleteTrek(trek.id || trek._id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-550/20 text-red-500 hover:text-white rounded-lg cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* LIGHTBOX SCREENSHOT VIEWER */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedScreenshot(null)}>
          <div className="max-w-md w-full glass-card p-4 rounded-2xl border border-white/10 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">Transaction Receipt</span>
              <button 
                onClick={() => setSelectedScreenshot(null)}
                className="p-1 bg-mountain-900 border border-white/10 rounded-full text-white font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="rounded-xl overflow-hidden aspect-[3/4] bg-mountain-950 border border-white/5">
              <img 
                src={selectedScreenshot} 
                alt="Payment Receipt Screenshot" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[9px] text-mountain-500 text-center font-bold uppercase tracking-wider mt-2.5">Tap outside to close window</p>
          </div>
        </div>
      )}

    </div>
  );
}
