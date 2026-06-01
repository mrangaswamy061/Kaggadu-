import React, { useState, useEffect } from 'react';
import { Compass, Filter, Upload, ExternalLink, Camera, ImagePlus } from 'lucide-react';
import { apiService } from '../utils/apiService';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Upload Form states
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState({ title: '', category: 'Sunrise', url: '' });
  const [filePreview, setFilePreview] = useState(null);

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
      setFilteredMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (category) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredMedia(media);
    } else {
      setFilteredMedia(media.filter(m => m.category === category));
    }
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
      const payload = { ...newImage, type: 'image' };
      await apiService.uploadGalleryImage(payload);
      setShowUpload(false);
      setNewImage({ title: '', category: 'Sunrise', url: '' });
      setFilePreview(null);
      await fetchGalleryData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    }
  };

  return (
    <div className="bg-mountain-950 min-h-screen pt-28 pb-24 font-sans relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-forest-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-black tracking-widest text-orange-500 block mb-2">Wilderness Captures</span>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-white uppercase">THE MEDIA <span className="text-gradient-orange">CAMPFIRE</span></h1>
          <p className="text-sm text-mountain-400 mt-3 font-medium">Stunning snippets of summits, sunrises, coastline hikes and forest paths captured by Explore Beyond Limits Trekkers.</p>
        </div>

        {/* Filter controls and Admin actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8 mb-12">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Sunrise', 'Forest', 'Beach'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-full border transition duration-300 cursor-pointer ${
                  activeFilter === cat 
                    ? 'bg-forest-700 border-forest-500 text-white shadow-lg glow-forest' 
                    : 'border-white/5 hover:border-white/20 text-mountain-400 hover:text-white'
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
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-300 flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" /> Upload Picture
            </button>
          )}
        </div>

        {/* Admin Upload Form Box */}
        {showUpload && isAdmin && (
          <form onSubmit={handleUploadSubmit} className="max-w-md mx-auto p-6 glass-card border border-orange-500/20 rounded-3xl mb-12 space-y-4">
            <h3 className="font-display font-bold text-white text-base uppercase tracking-wide">Add New Memory</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-mountain-400 block">Memory Title</label>
              <input 
                type="text" 
                value={newImage.title}
                onChange={e => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Misty peak morning"
                className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-mountain-400 block">Category</label>
                <select 
                  value={newImage.category}
                  onChange={e => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-mountain-900 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="Sunrise">Sunrise</option>
                  <option value="Forest">Forest</option>
                  <option value="Beach">Beach</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-mountain-400 block">Image File</label>
                <label className="w-full p-2.5 bg-mountain-900 border border-white/10 hover:border-orange-500/30 rounded-lg cursor-pointer text-xs text-mountain-400 text-center flex items-center justify-center gap-1.5 font-bold">
                  <Upload className="w-4 h-4 text-orange-500" /> Choose File
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {filePreview && (
              <div className="h-24 w-full rounded-lg overflow-hidden border border-white/10 relative">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowUpload(false)}
                className="flex-1 py-2 text-xs font-bold text-mountain-400 hover:text-white uppercase bg-white/5 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 text-xs font-bold text-white bg-forest-700 hover:bg-forest-600 uppercase rounded-lg"
              >
                Publish Image
              </button>
            </div>
          </form>
        )}

        {/* Masonry-style Grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMedia.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="break-inside-avoid relative rounded-3xl overflow-hidden border border-white/10 group shadow-lg transition duration-500 hover:translate-y-[-4px]"
              >
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Visual Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-mountain-950/80 via-mountain-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <div className="w-full flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-orange-500 block mb-1">
                        {item.category}
                      </span>
                      <h4 className="font-display font-bold text-white text-base leading-none">
                        {item.title}
                      </h4>
                    </div>
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2.5 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-orange-500 hover:text-white transition duration-300"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-white/5 rounded-2xl glass-card">
            <Camera className="w-12 h-12 text-mountain-600 mx-auto mb-4" />
            <h3 className="font-display font-bold text-white text-lg">No media captured</h3>
            <p className="font-sans text-xs text-mountain-400 mt-1">Check back later for recent trip clicks!</p>
          </div>
        )}

        {/* Instagram CTA Section */}
        <div className="mt-24 p-8 glass-card rounded-3xl border border-white/5 text-center space-y-6 max-w-4xl mx-auto">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
              JOIN THE REEL COMMUNITY
            </h3>
            <p className="font-sans text-xs text-mountain-400 max-w-md mx-auto mt-2 leading-relaxed">
              We update our stories daily with sunset updates, upcoming schedules, group photos, and camp highlights. Give us a follow!
            </p>
          </div>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-orange-500 hover:text-white text-mountain-950 text-xs font-black uppercase tracking-wider rounded-xl transition duration-300"
          >
            Open Instagram <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

    </div>
  );
}
