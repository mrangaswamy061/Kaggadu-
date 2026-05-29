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
    price: '', duration: '', date: '', image: '', highlights: '',
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
      setBookings(bData.reverse());
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
      // Format textareas to arrays
      const formattedTrek = {
        ...trekFormData,
        price: Number(trekFormData.price),
        difficultyLevel: Number(trekFormData.difficultyLevel),
        highlights: trekFormData.highlights.split('\n').filter(Boolean),
        pickupPoints: trekFormData.pickupPoints.split('\n').filter(Boolean),
        inclusions: trekFormData.inclusions.split('\n').filter(Boolean),
        exclusions: trekFormData.exclusions.split('\n').filter(Boolean),
        // Simple 2-day mock itinerary mapper
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
      price: '', duration: '', date: '', image: '', highlights: '',
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
    
    // Header row
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
      <div className="bg-mountain-950 min-h-screen pt-28 pb-24 font-sans flex items-center justify-center relative overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md mx-auto px-6 relative z-10 w-full">
          
          <form onSubmit={handleLoginSubmit} className="glass-card p-8 rounded-3xl border border-orange-500/20 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="bg-mountain-900 border border-white/10 p-3.5 rounded-full inline-block text-orange-500">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wide">
                Admin Control Room
              </h2>
              <p className="text-xs text-mountain-400">
                Verify payment screenshots and manage upcoming treks.
              </p>
            </div>

            {loginError && (
              <div className="p-3 text-[10px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 rounded-xl text-center uppercase tracking-wide">
                {loginError}
              </div>
            )}

            <div className="space-y-4 text-xs font-black uppercase tracking-wider text-mountain-400">
              
              <div className="space-y-1.5">
                <label className="block">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3.5 text-xs text-white tracking-wide"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block">Master Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="e.g. password"
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3.5 text-xs text-white"
                  required
                />
              </div>

            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition duration-300 shadow-lg glow-orange flex items-center justify-center gap-2 cursor-pointer"
            >
              Enter Dashboard
            </button>

            <div className="p-4 bg-mountain-900/60 rounded-2xl border border-white/5 space-y-1.5 text-center text-[10px] text-mountain-500">
              <p className="font-bold uppercase tracking-wider text-forest-500">Local-First Sandbox Credentials</p>
              <p>Username: <span className="text-white">admin</span></p>
              <p>Password: <span className="text-white">kaggadu2026</span></p>
            </div>

          </form>

        </div>

      </div>
    );
  }

  // 2. DASHBOARD VIEW (Logged In state)
  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Summary Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-10">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-forest-500 block mb-1">
              Control Panel
            </span>
            <h1 className="font-display font-black text-3xl text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-orange-500" /> Kaggadu Admin Command
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-forest-700 hover:bg-forest-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Bookings CSV
            </button>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 border border-white/10 hover:border-red-500 text-mountain-400 hover:text-white bg-white/5 hover:bg-red-950/20 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300"
            >
              Logout Admin
            </button>
          </div>
        </div>

        {/* Stats widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, color: 'text-white' },
            { label: 'Pending Approvals', value: stats.pendingBookings, color: 'text-orange-500' },
            { label: 'Approved seaters', value: stats.approvedBookings, color: 'text-forest-400' },
            { label: 'Active Destinies', value: stats.activeTreks, color: 'text-orange-500' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-mountain-500">{stat.label}</span>
              <span className={`font-display font-black text-3xl ${stat.color} mt-2`}>{stat.value}</span>
            </div>
          ))}
        </div>
{/* Showcase Stats Configuration */}
<div className="mt-8 space-y-4 max-w-2xl">
  <h2 className="font-display font-bold text-xl text-white uppercase tracking-wide">Showcase Statistics</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-1.5">
      <label className="text-xs uppercase font-black text-mountain-400">Trekkers Guided</label>
      <input type="text" value={showcaseStatsForm.trekkersGuided} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, trekkersGuided: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white" />
    </div>
    <div className="space-y-1.5">
      <label className="text-xs uppercase font-black text-mountain-400">Completed Treks</label>
      <input type="text" value={showcaseStatsForm.completedTreks} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, completedTreks: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white" />
    </div>
    <div className="space-y-1.5">
      <label className="text-xs uppercase font-black text-mountain-400">Trails Explored</label>
      <input type="text" value={showcaseStatsForm.trailsExplored} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, trailsExplored: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white" />
    </div>
    <div className="space-y-1.5">
      <label className="text-xs uppercase font-black text-mountain-400">Safety Rating</label>
      <input type="text" value={showcaseStatsForm.safetyRating} onChange={e=>setShowcaseStatsForm(prev=>({ ...prev, safetyRating: e.target.value }))} className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white" />
    </div>
  </div>
  <button onClick={async()=>{ try { await apiService.updateShowcaseStats(showcaseStatsForm); setStatsSavedMsg('Showcase stats saved.'); } catch(e){ console.error(e); } }} className="mt-4 px-4 py-2 bg-forest-700 hover:bg-forest-600 text-white text-xs font-black uppercase rounded-xl">
    {statsSavedMsg || 'Save Stats'}
  </button>
</div>

        {/* tab section switches */}
        <div className="flex gap-4 border-b border-white/5 pb-4 mb-8">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-orange-500 text-white shadow-lg glow-orange' 
                : 'text-mountain-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Manage Bookings
          </button>
          <button 
            onClick={() => setActiveTab('treks')}
            className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeTab === 'treks' 
                ? 'bg-orange-500 text-white shadow-lg glow-orange' 
                : 'text-mountain-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Configure Treks
          </button>
        </div>

        {/* TAB 1: MANAGE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-mountain-900 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-mountain-400">
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
                        No participant registrations currently listed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: CONFIGURE TREKS */}
        {activeTab === 'treks' && (
          <div className="space-y-8">
            
            {/* Header and Creator trigger */}
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                Registered Destination Trails
              </h3>
              <button 
                onClick={() => { resetTrekFormData(); setEditingTrek(null); setShowTrekForm(!showTrekForm); }}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create New Trek
              </button>
            </div>

            {/* Trek Creator Form overlay */}
            {showTrekForm && (
              <form onSubmit={handleTrekFormSubmit} className="p-6 sm:p-8 glass-card border border-orange-500/20 rounded-3xl space-y-6 max-w-4xl">
                <h4 className="font-display font-bold text-base text-white uppercase tracking-wider">
                  {editingTrek ? 'Edit Expedition Details' : 'Design New Trek Expedition'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-black uppercase text-mountain-400">
                  <div className="space-y-1.5">
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
                  <div className="space-y-1.5">
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-black uppercase text-mountain-400">
                  <div className="space-y-1.5">
                    <label>Difficulty</label>
                    <select 
                      value={trekFormData.difficulty}
                      onChange={e => setTrekFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label>Intensity Gauge (0-100)</label>
                    <input 
                      type="number" 
                      value={trekFormData.difficultyLevel}
                      onChange={e => setTrekFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label>Trek Price (₹)</label>
                    <input 
                      type="number" 
                      value={trekFormData.price}
                      onChange={e => setTrekFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 1499"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-black uppercase text-mountain-400">
                  <div className="space-y-1.5">
                    <label>Scheduling Dates</label>
                    <input 
                      type="text" 
                      value={trekFormData.date}
                      onChange={e => setTrekFormData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. June 05, 2026 or Every Weekend"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label>Visual Banner Image</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={trekFormData.image}
                        onChange={e => setTrekFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Paste image URL or choose file"
                        className="flex-grow bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                        required
                      />
                      <label className="px-4 bg-mountain-900 border border-white/10 hover:border-orange-500/30 rounded-xl cursor-pointer text-xs text-mountain-400 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <Upload className="w-4 h-4 text-orange-500" /> Upload
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
                  <div className="relative h-24 w-48 rounded-xl overflow-hidden border border-white/10 bg-mountain-900">
                    <img 
                      src={trekFormData.image} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      type="button"
                      onClick={() => setTrekFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-1 right-1 p-1.5 bg-red-600 rounded-full text-white text-[9px] font-bold leading-none"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Textareas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-black uppercase text-mountain-400">
                  <div className="space-y-1.5">
                    <label>Highlights (One per line)</label>
                    <textarea 
                      value={trekFormData.highlights}
                      onChange={e => setTrekFormData(prev => ({ ...prev, highlights: e.target.value }))}
                      placeholder="Highlight 1&#10;Highlight 2"
                      rows="4"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label>Pickup coordinates (One per line)</label>
                    <textarea 
                      value={trekFormData.pickupPoints}
                      onChange={e => setTrekFormData(prev => ({ ...prev, pickupPoints: e.target.value }))}
                      placeholder="Pickup spot 1 - 9:30 PM&#10;Pickup spot 2 - 10:00 PM"
                      rows="4"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-black uppercase text-mountain-400">
                  <div className="space-y-1.5">
                    <label>Included Checklist (One per line)</label>
                    <textarea 
                      value={trekFormData.inclusions}
                      onChange={e => setTrekFormData(prev => ({ ...prev, inclusions: e.target.value }))}
                      placeholder="Inclusion 1&#10;Inclusion 2"
                      rows="4"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label>Excluded Checklist (One per line)</label>
                    <textarea 
                      value={trekFormData.exclusions}
                      onChange={e => setTrekFormData(prev => ({ ...prev, exclusions: e.target.value }))}
                      placeholder="Exclusion 1&#10;Exclusion 2"
                      rows="4"
                      className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white font-sans"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowTrekForm(false); setEditingTrek(null); }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-mountain-300 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-forest-700 hover:bg-forest-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-300 glow-forest cursor-pointer"
                  >
                    {editingTrek ? 'Update Trek Details' : 'Publish Expedition'}
                  </button>
                </div>
              </form>
            )}

            {/* Trek list grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treks.map((trek) => (
                <div key={trek.id || trek._id} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-44 group">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-orange-500">{trek.difficulty}</span>
                    <h4 className="font-display font-bold text-base text-white group-hover:text-orange-500 transition line-clamp-1 mt-1">{trek.name}</h4>
                    <p className="text-[11px] text-mountain-500 font-medium font-sans mt-1">₹{trek.price} | {trek.duration}</p>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-white/5 pt-4 mt-auto">
                    <button 
                      onClick={() => handleEditTrek(trek)}
                      className="px-3 py-1.5 bg-mountain-900 hover:bg-mountain-850 border border-white/10 rounded-lg text-xs font-bold text-mountain-300 transition cursor-pointer"
                    >
                      Edit Info
                    </button>
                    <button 
                      onClick={() => handleDeleteTrek(trek.id || trek._id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/25 rounded-lg text-red-500 hover:text-white transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* LIGHTBOX FOR SCREENSHOT RECEIPT VIEWER */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setSelectedScreenshot(null)}>
          <div className="max-w-md w-full glass-card p-4 rounded-3xl border border-white/10 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase font-black tracking-widest text-orange-500">Transaction Receipt</span>
              <button 
                onClick={() => setSelectedScreenshot(null)}
                className="p-1.5 bg-mountain-900 rounded-full border border-white/10 text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-mountain-950 border border-white/5">
              <img 
                src={selectedScreenshot} 
                alt="Payment Screen Capture" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] text-mountain-500 text-center font-bold uppercase tracking-wider mt-3">Click anywhere outside to close window</p>
          </div>
        </div>
      )}

    </div>
  );
}
