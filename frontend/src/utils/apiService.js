import { defaultTreks, defaultGallery, defaultTestimonials } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') 
  ? 'http://localhost:5000/api' 
  : '/api');

// Pre-populate localStorage if empty
const initLocalStorage = () => {
  if (!localStorage.getItem('kaggadu_treks')) {
    localStorage.setItem('kaggadu_treks', JSON.stringify(defaultTreks));
  }
  if (!localStorage.getItem('kaggadu_gallery')) {
    localStorage.setItem('kaggadu_gallery', JSON.stringify(defaultGallery));
  }
  if (!localStorage.getItem('kaggadu_reviews')) {
    localStorage.setItem('kaggadu_reviews', JSON.stringify(defaultTestimonials));
  }
  if (!localStorage.getItem('kaggadu_bookings')) {
    const mockBookings = [
      {
        id: "BK-8392",
        name: "Darshan Gowda",
        email: "darshan@gmail.com",
        phone: "+91 99887 76655",
        age: 23,
        gender: "Male",
        emergencyContact: "Father: +91 99887 76600",
        selectedTrek: "Kudremukh Peak Trek",
        trekDate: "June 05, 2026",
        paymentScreenshot: "https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&w=150&q=80", // receipt style
        status: "Approved",
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
      },
      {
        id: "BK-4920",
        name: "Sneha Hegde",
        email: "sneha.h@yahoo.com",
        phone: "+91 98450 12345",
        age: 21,
        gender: "Female",
        emergencyContact: "Mother: +91 98450 54321",
        selectedTrek: "Skandagiri Sunrise Trek",
        trekDate: "Every Sat-Sun",
        paymentScreenshot: "https://images.unsplash.com/photo-1616077168712-fc6c788bc4ee?auto=format&fit=crop&w=150&q=80",
        status: "Pending",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
    localStorage.setItem('kaggadu_bookings', JSON.stringify(mockBookings));
  }
  if (!localStorage.getItem('kaggadu_showcase_stats')) {
    const defaultStats = {
      trekkersGuided: "4,500+",
      completedTreks: "180+",
      trailsExplored: "25+",
      safetyRating: "4.9/5"
    };
    localStorage.setItem('kaggadu_showcase_stats', JSON.stringify(defaultStats));
  }
  if (!localStorage.getItem('kaggadu_admin_logged_in')) {
    localStorage.setItem('kaggadu_admin_logged_in', 'false');
  }
};

initLocalStorage();

// Helper to check if the backend Express server is alive
const checkBackendStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const apiService = {
  // --- TREKS ---
  getTreks: async () => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/treks`);
        return await response.json();
      } catch (err) {
        console.warn("Backend failed, falling back to Local Storage", err);
      }
    }
    // Fallback
    return JSON.parse(localStorage.getItem('kaggadu_treks'));
  },

  getTrekById: async (id) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/treks/${id}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend failed, falling back to Local Storage", err);
      }
    }
    const treks = JSON.parse(localStorage.getItem('kaggadu_treks'));
    return treks.find(t => t.id === id || t._id === id);
  },

  createTrek: async (trekData) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/treks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(trekData)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend trek creation failed, using local storage", err);
      }
    }
    
    // Fallback
    const treks = JSON.parse(localStorage.getItem('kaggadu_treks'));
    const newTrek = { 
      ...trekData, 
      id: trekData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      _id: Math.random().toString(36).substr(2, 9) 
    };
    treks.push(newTrek);
    localStorage.setItem('kaggadu_treks', JSON.stringify(treks));
    return newTrek;
  },

  updateTrek: async (id, trekData) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/treks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(trekData)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend update failed, using local storage", err);
      }
    }
    
    // Fallback
    const treks = JSON.parse(localStorage.getItem('kaggadu_treks'));
    const index = treks.findIndex(t => t.id === id || t._id === id);
    if (index !== -1) {
      treks[index] = { ...treks[index], ...trekData };
      localStorage.setItem('kaggadu_treks', JSON.stringify(treks));
      return treks[index];
    }
    throw new Error('Trek not found');
  },

  deleteTrek: async (id) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/treks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend delete failed, using local storage", err);
      }
    }
    
    // Fallback
    let treks = JSON.parse(localStorage.getItem('kaggadu_treks'));
    treks = treks.filter(t => t.id !== id && t._id !== id);
    localStorage.setItem('kaggadu_treks', JSON.stringify(treks));
    return { success: true };
  },

  // --- BOOKINGS ---
  getBookings: async () => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend bookings fetch failed, using local storage", err);
      }
    }
    return JSON.parse(localStorage.getItem('kaggadu_bookings'));
  },

  createBooking: async (bookingData) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        // Prepare multipart data if files, or regular json
        const response = await fetch(`${BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend booking creation failed, using local storage", err);
      }
    }

    // Fallback
    const bookings = JSON.parse(localStorage.getItem('kaggadu_bookings'));
    const newBooking = {
      ...bookingData,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    localStorage.setItem('kaggadu_bookings', JSON.stringify(bookings));
    return newBooking;
  },

  updateBookingStatus: async (id, status) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/bookings/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend status update failed, using local storage", err);
      }
    }

    // Fallback
    const bookings = JSON.parse(localStorage.getItem('kaggadu_bookings'));
    const index = bookings.findIndex(b => b.id === id || b._id === id);
    if (index !== -1) {
      bookings[index].status = status;
      localStorage.setItem('kaggadu_bookings', JSON.stringify(bookings));
      return bookings[index];
    }
    throw new Error('Booking not found');
  },

  // --- GALLERY ---
  getGallery: async () => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/gallery`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend gallery failed, using local storage", err);
      }
    }
    return JSON.parse(localStorage.getItem('kaggadu_gallery'));
  },

  uploadGalleryImage: async (imageData) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const token = localStorage.getItem('kaggadu_admin_token');
        const response = await fetch(`${BASE_URL}/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(imageData)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend upload failed, using local storage", err);
      }
    }

    // Fallback
    const gallery = JSON.parse(localStorage.getItem('kaggadu_gallery'));
    const newImage = {
      ...imageData,
      id: Math.floor(Math.random() * 100000),
    };
    gallery.push(newImage);
    localStorage.setItem('kaggadu_gallery', JSON.stringify(gallery));
    return newImage;
  },

  // --- REVIEWS ---
  getReviews: async () => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/reviews`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend reviews fetch failed, using local storage", err);
      }
    }
    return JSON.parse(localStorage.getItem('kaggadu_reviews')) || [];
  },

  createReview: async (reviewData) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn("Backend review creation failed, using local storage", err);
      }
    }

    // Fallback
    const reviews = JSON.parse(localStorage.getItem('kaggadu_reviews')) || [];
    const newReview = {
      ...reviewData,
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    localStorage.setItem('kaggadu_reviews', JSON.stringify(reviews));
    return newReview;
  },

  // --- ADMIN AUTH ---
  adminLogin: async (username, password) => {
    const isOnline = await checkBackendStatus();
    if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('kaggadu_admin_token', data.token);
          localStorage.setItem('kaggadu_admin_logged_in', 'true');
          return { success: true, token: data.token };
        }
      } catch (err) {
        console.warn("Backend auth failed, trying local storage", err);
      }
    }

    // Fallback (simple mock login matching 'admin' / 'kaggadu2026')
    if (username === 'admin' && password === 'kaggadu2026') {
      localStorage.setItem('kaggadu_admin_logged_in', 'true');
      localStorage.setItem('kaggadu_admin_token', 'mock-jwt-token-kaggadu-2026');
      return { success: true, token: 'mock-jwt-token-kaggadu-2026' };
    }
    throw new Error('Invalid Admin credentials!');
  },

  adminLogout: async () => {
    localStorage.removeItem('kaggadu_admin_token');
    localStorage.setItem('kaggadu_admin_logged_in', 'false');
    return { success: true };
  },

  isAdminLoggedIn: () => {
    return localStorage.getItem('kaggadu_admin_logged_in') === 'true';
  },

  getShowcaseStats: async () => {
    return JSON.parse(localStorage.getItem('kaggadu_showcase_stats'));
  },

  updateShowcaseStats: async (newStats) => {
    localStorage.setItem('kaggadu_showcase_stats', JSON.stringify(newStats));
    return newStats;
  }
};
