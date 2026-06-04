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
import Event from './models/Event.js';

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

// --- EVENTS API ROUTER ---
app.get('/api/events', async (req, res) => {
  try {
    let query = { status: 'published' };
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        jwt.verify(token, JWT_SECRET);
        query = {}; // Return all draft + published events for admin
      } catch (err) {
        // Invalid token, treat as public user
      }
    }
    const events = await Event.find(query).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ $or: [{ eventId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] });
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', authenticateAdmin, async (req, res) => {
  try {
    const eventId = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newEvent = new Event({
      ...req.body,
      eventId,
      createdBy: req.admin.username || 'admin'
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await Event.findOneAndUpdate(
      { $or: [{ eventId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', authenticateAdmin, async (req, res) => {
  try {
    await Event.findOneAndDelete({ $or: [{ eventId: req.params.id }, { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null }] });
    res.status(200).json({ success: true });
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
    const initialTreks = [
      {
        id: "skandagiri-sunrise",
        name: "Skandagiri Sunrise Trek",
        tagline: "Walk above the clouds at dawn",
        difficulty: "Moderate",
        difficultyLevel: 60,
        price: 1499,
        duration: "2 Days / 1 Night",
        distance: "8 km",
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
          "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1518098268026-4e43a1a009de?auto=format&fit=crop&w=600&q=80"
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
        distance: "18 km",
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
          "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        id: "banasura-hill",
        name: "Banasura Hill Expedition",
        tagline: "Scale the highest peak of Wayanad",
        difficulty: "Challenging",
        difficultyLevel: 80,
        price: 3899,
        duration: "3 Days / 2 Nights",
        distance: "12 km",
        date: "June 19, 2026",
        image: "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=800&q=80",
        highlights: [
          "Stunning views of the massive Banasura Sagar Dam reservoir",
          "Challenging ridge walk above high drop-offs",
          "Camp in Wayanad wilderness or stay in a rustic farm stay",
          "Walk amidst dense bamboo groves and cardamom plantations"
        ],
        pickupPoints: [
          "Koramangala Sony World Signal - 9:30 PM",
          "Mysore Road Satellite Bus Stand - 10:30 PM"
        ],
        inclusions: [
          "Non-AC Sleeper Coach/Traveller transport",
          "Entry fees and permission from Kerala Forest Dept",
          "Accommodations at a Wayanad homestay",
          "All meals starting from Day 2 morning to Day 3 afternoon",
          "Local guides and outdoor leads"
        ],
        exclusions: [
          "Extra water bottles or carbonated drinks",
          "Tipping the local guides"
        ],
        itinerary: [
          { day: "Day 1", title: "Bangalore to Wayanad", desc: "Board vehicle from designated spots. Overnight drive passing through Bandipur Reserve." },
          { day: "Day 2", title: "Summit Ascent", desc: "Start early trek from the base. The trail goes steep through tea estates, into deep forests and steep rock sections. Witness the clouds kissing Banasura peak. Spend some peaceful time and climb down. Relax at homestay with bonfire." },
          { day: "Day 3", title: "Banasura Dam & return", desc: "Visit Banasura Sagar Dam (largest earth dam in India). Optional ziplining or speedboating. Return to Bangalore by 11 PM." }
        ],
        gallery: [
          "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        id: "kodachadri-trek",
        name: "Kodachadri Hill Trek",
        tagline: "Journey through Adi Shankara's meditation trails",
        difficulty: "Moderate",
        difficultyLevel: 65,
        price: 3299,
        duration: "3 Days / 2 Nights",
        distance: "14 km",
        date: "June 26, 2026",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
        highlights: [
          "Visit the majestic Hidlumane Waterfalls with 7 cascades",
          "Off-road 4x4 Jeep ride down the rugged mountain trail",
          "Visit Sarvajna Peetha - where Sage Adi Shankara meditated",
          "Witness sunset over the Arabian Sea from the peak on clear days"
        ],
        pickupPoints: [
          "MG Road Metro - 9:00 PM",
          "Yeshwanthpur Bus Terminal - 9:45 PM"
        ],
        inclusions: [
          "Transportation (Bangalore to Shimoga & return)",
          "4x4 Jeep descending charges",
          "Traditional homestay stay in Shimoga",
          "Food (2 Breakfasts, 1 Lunch, 1 Dinner, High tea)",
          "Forest dept permits and expert local guides"
        ],
        exclusions: [
          "Personal items, towels, and toiletries"
        ],
        itinerary: [
          { day: "Day 1", title: "Drive to Western Ghats", desc: "Night drive from Bangalore towards Hosanagara/Kollur." },
          { day: "Day 2", title: "Hidlumane Falls & Peak", desc: "Start trekking by 8:00 AM. Cross water streams and climb up Hidlumane waterfalls. Cross steep green meadows to reach the peak. Relax at Sarvajna Peetha, enjoy the sunset, and descend in high-octane 4x4 Jeeps. Campfire and dinner at homestay." },
          { day: "Day 3", title: "Nagabana & Return", desc: "Visit the historic Nagara Fort, explore ruins, take photos, and drive back to Bangalore, reaching around 10:00 PM." }
        ],
        gallery: [
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1432406323012-7a7243958a2f?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        id: "gokarna-beach-trek",
        name: "Gokarna Beach Trail & Camping",
        tagline: "Sand, waves, and cliff walks",
        difficulty: "Easy",
        difficultyLevel: 30,
        price: 2999,
        duration: "3 Days / 2 Nights",
        distance: "10 km",
        date: "Every Friday",
        image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
        highlights: [
          "Trek along five major pristine beaches of Gokarna",
          "Camp right under the starry sky on a secluded beach cliff",
          "Enjoy beach sports, Frisbee, and dolphin spotting",
          "Breathtaking sunset views from the iconic Half Moon Cliff"
        ],
        pickupPoints: [
          "Indiranagar BDA Complex - 7:30 PM",
          "Goraguntepalya Metro Station - 8:30 PM"
        ],
        inclusions: [
          "Sleeper coach/Traveller pushback transit",
          "Dome beach tents (twin/triple sharing)",
          "2 Breakfasts, 1 Lunch, 1 Beachside Dinner",
          "Certified leads & campfire guitar night"
        ],
        exclusions: [
          "Water activities (Jet ski, Banana ride - optional)",
          "Dinner on Day 3 during return"
        ],
        itinerary: [
          { day: "Day 1", title: "Journey to the Sea", desc: "Overnight drive from Bangalore, descending the scenic ghats to the coastal town of Gokarna." },
          { day: "Day 2", title: "Five Beach Trek & Camp", desc: "Start trekking from Belekan Beach. Cover Paradise Beach, Half Moon Beach, Om Beach, and Kudle Beach. Interspersed with short hill hikes, cliff-scaling, and swimming in safe zones. Camp at Paradise beach with campfire, songs, and stargazing." },
          { day: "Day 3", title: "Temple Visit & Return", desc: "Visit the ancient Mahabaleshwar temple (optional), try continental cafes at Om Beach, and head back to Bangalore." }
        ],
        gallery: [
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80"
        ]
      }
    ];

    for (const t of initialTreks) {
      await Trek.updateOne({ id: t.id }, { $set: t }, { upsert: true });
    }
    console.log('Seeded and synchronized initial treks data.');

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
      const initialReviews = [];
      if (initialReviews.length > 0) {
        await Review.insertMany(initialReviews);
        console.log('Seeded initial reviews data.');
      }
    }

    // 5. Seed Default Events
    const eventsCount = await Event.countDocuments();
    if (eventsCount === 0) {
      const initialEvents = [
        {
          eventId: "skandagiri-sunrise-event",
          title: "Skandagiri Sunrise Trek",
          date: new Date(Date.now() + 3600000 * 24 * 2), // 2 days from now (this weekend)
          location: "Chikkaballapur, Karnataka",
          difficulty: "Moderate",
          price: 1499,
          slots: 30,
          bookedSlots: 10,
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          status: "published",
          isFeatured: true,
          registrationsEnabled: true,
          createdBy: "admin"
        },
        {
          eventId: "kudremukh-peak-event",
          title: "Kudremukh Peak Trek",
          date: new Date(Date.now() + 3600000 * 24 * 16), // 16 days from now
          location: "Chikmagalur, Karnataka",
          difficulty: "Challenging",
          price: 3499,
          slots: 20,
          bookedSlots: 20, // Sold Out!
          image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80",
          status: "published",
          isFeatured: true,
          registrationsEnabled: true,
          createdBy: "admin"
        },
        {
          eventId: "gokarna-beach-event",
          title: "Gokarna Beach Trail & Camping",
          date: new Date(Date.now() + 3600000 * 24 * 8), // 8 days from now (Next Weekend)
          location: "Gokarna, Karnataka",
          difficulty: "Easy",
          price: 2999,
          slots: 15,
          bookedSlots: 12, // Few Slots Left (3 left)!
          image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
          status: "published",
          isFeatured: false,
          registrationsEnabled: true,
          createdBy: "admin"
        },
        {
          eventId: "kodachadri-hills-event",
          title: "Kodachadri Hills Trek",
          date: new Date(Date.now() + 3600000 * 24 * 23), // 23 days from now
          location: "Shimoga, Karnataka",
          difficulty: "Moderate",
          price: 3299,
          slots: 25,
          bookedSlots: 8,
          image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
          status: "published",
          isFeatured: false,
          registrationsEnabled: true,
          createdBy: "admin"
        }
      ];
      await Event.insertMany(initialEvents);
      console.log('Seeded initial events data.');
    }
  } catch (err) {
    console.error('Database seeding failed', err);
  }
}

app.listen(PORT, () => {
  console.log(`Express active. Server listening on http://localhost:${PORT}`);
});

export default app;
