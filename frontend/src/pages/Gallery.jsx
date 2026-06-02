import React, { useState, useEffect, useRef } from 'react';
import { Compass, Filter, Upload, ExternalLink, Camera, ImagePlus, X, Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'reels'
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload Form states
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', category: 'Sunrise', url: '', type: 'image' });
  const [filePreview, setFilePreview] = useState(null);

  // Immersive Lightbox states
  const [activeViewerIdx, setActiveViewerIdx] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  // Touch Swipe states for Lightbox
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsAdmin(apiService.isAdminLoggedIn());
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getGallery();
      setMedia(data);
      applyFilters(data, activeTab, activeFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data, tab, filter) => {
    let filtered = [...data];
    
    // 1. Separate photos vs reels
    if (tab === 'photos') {
      filtered = filtered.filter(m => m.type !== 'video');
    } else {
      filtered = filtered.filter(m => m.type === 'video');
    }

    // 2. Apply Category Filters
    if (filter !== 'All') {
      filtered = filtered.filter(m => m.category === filter);
    }

    setFilteredMedia(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    applyFilters(media, tab, activeFilter);
  };

  const handleFilter = (category) => {
    setActiveFilter(category);
    applyFilters(media, activeTab, category);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
        setNewImage(prev => ({ ...prev, url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newImage.title || !newImage.url) {
      alert("Please fill in image title and choose a file!");
      return;
    }
    
    try {
      await apiService.uploadGalleryImage(newImage);
      setShowUpload(false);
      setNewImage({ title: '', category: 'Sunrise', url: '', type: 'image' });
      setFilePreview(null);
      await fetchGalleryData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
  };

  // --- Lightbox Touch/Swipe Gestures for Swipe Navigation ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // pixels

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped Left -> Load Next
        handleNextMedia();
      } else {
        // Swiped Right -> Load Prev
        handlePrevMedia();
      }
    }
  };

  const handleNextMedia = () => {
    if (activeViewerIdx === null) return;
    if (activeViewerIdx < filteredMedia.length - 1) {
      setActiveViewerIdx(activeViewerIdx + 1);
    } else {
      setActiveViewerIdx(0); // Loop back to start
    }
  };

  const handlePrevMedia = () => {
    if (activeViewerIdx === null) return;
    if (activeViewerIdx > 0) {
      setActiveViewerIdx(activeViewerIdx - 1);
    } else {
      setActiveViewerIdx(filteredMedia.length - 1); // Loop to end
    }
  };

  // Compressed Image CDN helper
  const getCompressedImgUrl = (url, width = 400) => {
    if (!url) return '';
    if (url.includes('images.unsplash.com')) {
      const cleanUrl = url.split('?')[0];
      return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=70&fm=webp`;
    }
    return url;
  };

  return (
    <div className="bg-mountain-950 min-h-screen pt-24 pb-24 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 block mb-1">Wilderness Captures</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase">THE MEDIA <span className="text-gradient-orange">CAMPFIRE</span></h1>
          <p className="text-xs text-mountain-450 mt-2 leading-relaxed">
            Beautiful snapshots of summits, coastal trails, and misty forest paths captured by Kaggadu Adventures Trekkers.
          </p>
        </div>

        {/* Dynamic Instagram Tabs: Photos & Reels */}
        <div className="flex border-b border-white/10 max-w-md mx-auto mb-6 bg-mountain-900/20 rounded-xl p-1">
          <button
            onClick={() => handleTabChange('photos')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'photos' 
                ? 'bg-mountain-900 text-white shadow' 
                : 'text-mountain-450 hover:text-mountain-200'
            }`}
          >
            📸 Photos
          </button>
          <button
            onClick={() => handleTabChange('reels')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'reels' 
                ? 'bg-mountain-900 text-white shadow' 
                : 'text-mountain-450 hover:text-mountain-200'
            }`}
          >
            🎬 Reels
          </button>
        </div>

        {/* Filter controls and Admin actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6 mb-8">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Sunrise', 'Forest', 'Beach'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border transition duration-300 cursor-pointer ${
                  activeFilter === cat 
                    ? 'bg-forest-750 border-forest-550 text-white shadow-sm' 
                    : 'border-white/5 hover:border-white/20 text-mountain-400 hover:text-white bg-mountain-900/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Admin Upload Prompt */}
          {isAdmin && (
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-orange-650 hover:bg-orange-550 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[40px] w-full sm:w-auto justify-center"
            >
              <ImagePlus className="w-4 h-4" /> Upload picture
            </button>
          )}
        </div>

        {/* Admin Upload Form Box */}
        {showUpload && isAdmin && (
          <form onSubmit={handleUploadSubmit} className="max-w-md mx-auto p-5 glass-card border border-orange-500/20 rounded-2xl mb-8 space-y-4 text-xs font-black uppercase tracking-wider text-mountain-400">
            <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">Add new memory</h3>
            
            <div className="space-y-1">
              <label className="block text-[9px]">Memory Title</label>
              <input 
                type="text" 
                value={newImage.title}
                onChange={e => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Sunrise view at peak"
                className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px]">Type</label>
                <select
                  value={newImage.type}
                  onChange={e => setNewImage(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white cursor-pointer font-semibold"
                >
                  <option value="image">📸 Photo</option>
                  <option value="video">🎬 Reel (Video)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px]">Category</label>
                <select 
                  value={newImage.category}
                  onChange={e => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white cursor-pointer font-semibold"
                >
                  <option value="Sunrise">Sunrise</option>
                  <option value="Forest">Forest</option>
                  <option value="Beach">Beach</option>
                </select>
              </div>
            </div>

            {newImage.type === 'video' ? (
              <div className="space-y-1">
                <label className="block text-[9px]">Reel MP4 Video URL</label>
                <input 
                  type="text" 
                  value={newImage.url}
                  onChange={e => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Paste vertical mp4 video link..."
                  className="w-full bg-mountain-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-[9px]">Image upload</label>
                <label className="w-full p-3 bg-mountain-900 border border-white/10 hover:border-orange-500/30 rounded-xl cursor-pointer text-xs text-mountain-400 text-center flex items-center justify-center gap-1.5 font-bold">
                  <Upload className="w-4 h-4 text-orange-500" /> Choose File
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}

            {filePreview && newImage.type === 'image' && (
              <div className="h-24 w-full rounded-xl overflow-hidden border border-white/10 relative">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowUpload(false)}
                className="flex-1 py-3 text-xs font-black text-mountain-450 hover:text-white uppercase bg-white/5 rounded-xl border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 text-xs font-black text-white bg-forest-700 hover:bg-forest-600 uppercase rounded-xl shadow-lg cursor-pointer"
              >
                Publish memory
              </button>
            </div>
          </form>
        )}

        {/* Gallery Grid Display */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMedia.length > 0 ? (
          <>
            {activeTab === 'photos' ? (
              /* Instagram Profile Photo Grid (3-column square on mobile, masonry on desktop) */
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4 lg:gap-6">
                {filteredMedia.map((item, idx) => (
                  <div 
                    key={item.id || item._id} 
                    onClick={() => setActiveViewerIdx(idx)}
                    className="relative aspect-square rounded-lg sm:rounded-2xl overflow-hidden border border-white/5 cursor-pointer group shadow-md"
                  >
                    <img 
                      src={getCompressedImgUrl(item.url, 400)} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-display font-black text-white uppercase tracking-wider bg-mountain-950/60 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">View Photo</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Instagram Reels Grid (3-column vertical 9:16 on mobile, 4-column on desktop) */
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4 lg:gap-6">
                {filteredMedia.map((item, idx) => (
                  <div 
                    key={item.id || item._id} 
                    onClick={() => setActiveViewerIdx(idx)}
                    className="relative aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 cursor-pointer bg-mountain-900/60 group shadow-lg"
                  >
                    {/* Fallback portrait backdrop poster using Unsplash dawn, or simple gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-10"></div>
                    
                    {/* Render video preview elements */}
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      muted
                      playsInline
                    />
                    
                    {/* Play symbol badge */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="p-2.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10 group-hover:scale-110 group-hover:bg-orange-600 transition-all duration-300">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    </div>

                    {/* Meta labels at bottom */}
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 pr-2">
                      <span className="text-[7px] sm:text-[9px] uppercase font-black text-orange-400 block tracking-widest">{item.category}</span>
                      <h4 className="font-display font-bold text-white text-[9px] sm:text-xs line-clamp-1 leading-none mt-1">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-white/5 rounded-2xl glass-card">
            <Camera className="w-10 h-10 text-mountain-600 mx-auto mb-3" />
            <h3 className="font-display font-bold text-white text-sm">No media found</h3>
            <p className="font-sans text-xs text-mountain-450 mt-1">Try matching another filter tag category!</p>
          </div>
        )}

      </div>

      {/* --- IMMERSIVE FULL-SCREEN LIGHTBOX VIEWER WITH TOUCH SWIPE NAVIGATION --- */}
      {activeViewerIdx !== null && filteredMedia[activeViewerIdx] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 pb-20 select-none animate-[zoomIn_0.25s_ease-out]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Panel Actions */}
          <div className="flex items-center justify-between w-full z-20">
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-black tracking-widest text-orange-500">
                {filteredMedia[activeViewerIdx].category} Exp
              </span>
              <h4 className="font-display font-black text-sm text-white leading-none mt-1">
                {filteredMedia[activeViewerIdx].title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound controller only if video format */}
              {filteredMedia[activeViewerIdx].type === 'video' && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 transition cursor-pointer"
                  title="Mute / Unmute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => setActiveViewerIdx(null)}
                className="p-2.5 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 transition cursor-pointer"
                title="Close Viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Sandbox Core */}
          <div className="flex-grow flex items-center justify-center relative w-full h-[65vh] my-4">
            
            {/* Desktop Previous Action Key */}
            <button 
              onClick={handlePrevMedia}
              className="absolute left-2 z-35 hidden md:flex items-center justify-center p-3 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 active:scale-95 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Immersive Vertical Media wrapper (9:16 preset for Reels, aspect-auto for photos) */}
            <div className="h-full max-h-[70vh] w-full max-w-sm flex items-center justify-center relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              {filteredMedia[activeViewerIdx].type === 'video' ? (
                <video
                  src={filteredMedia[activeViewerIdx].url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  key={filteredMedia[activeViewerIdx].id || filteredMedia[activeViewerIdx]._id}
                />
              ) : (
                <img
                  src={filteredMedia[activeViewerIdx].url}
                  alt={filteredMedia[activeViewerIdx].title}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              )}
            </div>

            {/* Desktop Next Action Key */}
            <button 
              onClick={handleNextMedia}
              className="absolute right-2 z-35 hidden md:flex items-center justify-center p-3 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 active:scale-95 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Swipe helper tip */}
          <div className="text-center z-20 pb-2">
            <p className="text-[9px] uppercase font-black text-mountain-500 tracking-[0.25em] animate-pulse">
              👈 Swipe screen Left/Right to browse 👉
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
