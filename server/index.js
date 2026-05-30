import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dns from 'dns';

// Force Cloudflare and Google DNS to bypass local ISP router failures resolving MongoDB SRV records
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
  console.warn('Failed to override local DNS servers:', e.message);
}
dns.setDefaultResultOrder('ipv4first');

// Schemas
import Trek from './models/Trek.js';
import Booking from './models/Booking.js';
import User from './models/User.js';
import Gallery from './models/Gallery.js';
import Review from './models/Review.js';

// Mail Service
import { sendBookingStatusEmail } from './utils/mailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kaggadu_adventures';
const JWT_SECRET = process.env.JWT_SECRET || 'kaggadu_secret_token_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- DATABASE CONNECTIVITY ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB successfully connected.');
    await seedDatabase();
  })
  .catch(err => {
    console.warn('MongoDB connection failed. Continuing in localized database backup mode.', err.message);
  });

// --- AUTH MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token.' });
  }
};

// --- HEALTH & STATUS API ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Express Server is active and operational!' });
});

// --- AUTH ROUTER ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Admin credentials not found!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect master password!' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TREK API ROUTER ---
app.get('/api/treks', async (req, res) => {
  try {
    const treks = await Trek.find();
    res.status(200).json(treks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/treks/:id', async (req, res) => {
  try {
    const trek = await Trek.findOne({ $or: [{ id: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] });
    if (!trek) return res.status(404).json({ error: 'Trek not found.' });
    res.status(200).json(trek);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/treks', authenticateAdmin, async (req, res) => {
  try {
    const newTrek = new Trek({
      ...req.body,
      id: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });
    await newTrek.save();
    res.status(201).json(newTrek);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/treks/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Trek.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/treks/:id', authenticateAdmin, async (req, res) => {
  try {
    await Trek.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BOOKINGS API ROUTER ---
app.get('/api/bookings', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking({
      ...req.body,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending'
    });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id/status', authenticateAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Booking.findOneAndUpdate(
      { $or: [{ id: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] },
      { $set: { status } },
      { new: true }
    );

    // Send confirmation email if status is Approved or Rejected
    if (updated && (status === 'Approved' || status === 'Rejected')) {
      sendBookingStatusEmail(updated, updated.selectedTrek).catch(err => {
        console.error('Failed to trigger background booking status email:', err);
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS API ROUTER ---
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GALLERY API ROUTER ---
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find();
    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gallery', authenticateAdmin, async (req, res) => {
  try {
    const newPic = new Gallery(req.body);
    await newPic.save();
    res.status(201).json(newPic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SEED DATABASE UTILITY ---
async function seedDatabase() {
  try {
    // 1. Seed Admin user
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('kaggadu2026', salt);
      const admin = new User({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('Seeded Master Admin credentials: admin / kaggadu2026');
    }

    // 2. Seed Default Treks
    const trekCount = await Trek.countDocuments();
    if (trekCount === 0) {
      // Inline default treks for DB seeding
      const initialTreks = [
        {
          id: "skandagiri-sunrise",
          name: "Skandagiri Sunrise Trek",
          tagline: "Walk above the clouds at dawn",
          difficulty: "Moderate",
          difficultyLevel: 60,
          price: 1499,
          duration: "2 Days / 1 Night",
          date: "Every Sat-Sun",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          highlights: [
            "Breathtaking views of the sunrise above a sea of clouds",
            "Night trekking experience with torchlights",
            "Explore the ruined historic fortress of Tipu Sultan at the peak",
            "Engaging campfire session and stargazing"
          ],
          pickupPoints: [
            "Domlur Club - 9:30 PM",
            "MG Road metro station - 10:00 PM",
            "Hebbal Flyover - 10:30 PM"
          ],
          inclusions: [
            "To and Fro Transportation (Non-AC Pushback)",
            "Permissions from Karnataka Forest Dept",
            "1 Breakfast, 1 Lunch, 1 Snacks & Dinner",
            "Certified Outdoor Leads",
            "First Aid Support"
          ],
          exclusions: [
            "Personal Expenses",
            "Any extra beverages/meals ordered",
            "Anything not mentioned in inclusions"
          ],
          itinerary: [
            { day: "Day 1", title: "Departure & Briefing", desc: "Board the pushback vehicle from Bangalore starting at 9:30 PM. Introductions and ice-breaker sessions on board." },
            { day: "Day 2", title: "Ascent & Sunrise View", desc: "Reach the base village around 3:00 AM. Start the night trek through forest and rocky trails. Reach peak by 5:30 AM, witness the incredible sunrise, explore the ruins. Descend, have breakfast, and return to Bangalore by evening." }
          ],
          gallery: [
            "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80"
          ]
        },
        {
          id: "kudremukh-trek",
          name: "Kudremukh Peak Trek",
          tagline: "Conquer the second-highest peak in Karnataka",
          difficulty: "Challenging",
          difficultyLevel: 85,
          price: 3499,
          duration: "3 Days / 2 Nights",
          date: "June 05, 2026",
          image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80",
          highlights: [
            "Climb the iconic horse-faced peak standing at 1894 meters",
            "Trek through lush green Shola forests and bubbling streams",
            "Spot wildlife in the Kudremukh National Park",
            "Stay in an authentic eco-homestay near the foothills"
          ],
          pickupPoints: [
            "Indiranagar BDA Complex - 8:00 PM",
            "MG Road Metro - 8:30 PM",
            "Yeshwanthpur Govra Mall - 9:15 PM"
          ],
          inclusions: [
            "Bangalore to Kudremukh and return transit",
            "Jeep ride from homestay to forest office",
            "Homestay accommodation (multiple sharing)",
            "2 Breakfasts, 2 Lunches, 1 Dinner, Snacks",
            "Forest department entry fees & local guide"
          ],
          exclusions: [
            "Dinner on Day 3 during return travel",
            "Personal toiletries and medicines"
          ],
          itinerary: [
            { day: "Day 1", title: "Overnight Journey", desc: "Leave Bangalore late evening. Enjoy a scenic overnight drive to Chikkamagaluru district." },
            { day: "Day 2", title: "The Mighty Climb", desc: "Arrive at the homestay, freshen up, and enjoy hot local breakfast. Take a jeep to the starting point. Trek 9km each way through misty grass valleys. Touch the majestic peak, experience chilling winds, and return to the homestay for hot Malnad dinner." },
            { day: "Day 3", title: "Somavati Falls & Return", desc: "Visit the cascading Somavati Waterfalls, take a dip, purchase fresh organic tea leaves, and head back to Bangalore by midnight." }
          ],
          gallery: [
            "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80"
          ]
        }
      ];
      await Trek.insertMany(initialTreks);
      console.log('Seeded initial treks data.');
    }

    // 3. Seed Default Gallery
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      const initialGallery = [
        { title: "Skandagiri Dawn", category: "Sunrise", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
        { title: "Kudremukh Grasslands", category: "Forest", url: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80" },
        { title: "Gokarna Cliffs", category: "Beach", url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80" }
      ];
      await Gallery.insertMany(initialGallery);
      console.log('Seeded initial gallery data.');
    }

    // 4. Seed Default Reviews
    const reviewsCount = await Review.countDocuments();
    if (reviewsCount === 0) {
      const initialReviews = [
        {
          name: "Akash Gowda",
          role: "Engineering Student",
          rating: 5,
          text: "Absolutely the best weekend of my college life! The Kudremukh trek was so well organized. Excellent guides, super friendly crowd, and very budget-friendly. Recommend 100%!",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
        },
        {
          name: "Dr. Anjali Rao",
          role: "Nature Lover",
          rating: 5,
          text: "Kaggadu Adventures knows how to curate trails. The Skandagiri Night Trek was magical. Walking above the sea of clouds at sunrise was pure therapy. Very safe for solo female trekkers.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
        },
        {
          name: "Pranav M",
          role: "IT Professional",
          rating: 5,
          text: "Highly energetic leads! Gokarna Beach trek was an absolute blast. Campfire under the stars with live music made it unforgettable. Group vibes are so youthful and amazing.",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
        }
      ];
      await Review.insertMany(initialReviews);
      console.log('Seeded initial reviews data.');
    }
  } catch (err) {
    console.error('Database seeding failed', err);
  }
}

app.listen(PORT, () => {
  console.log(`Express active. Server listening on http://localhost:${PORT}`);
});

export default app;
