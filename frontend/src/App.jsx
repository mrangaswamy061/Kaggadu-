import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TrekDetails from './pages/TrekDetails';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-mountain-950 text-mountain-100">
        
        {/* Navigation Floating Header */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trek/:id" element={<TrekDetails />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Global Layout Footer */}
        <FooterWrapper />

      </div>
    </Router>
  );
}

function FooterWrapper() {
  const location = useLocation();
  if (location.pathname === '/admin') {
    return null;
  }
  return <Footer />;
}
