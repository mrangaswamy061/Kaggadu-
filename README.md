# Kaggadu Adventures ⛰️

A highly responsive, cinematic, energetic, and youth-oriented website designed for **Kaggadu Adventures**, a premium trekking and travel community from Karnataka. 

Built using a state-of-the-art modern full-stack architecture, featuring beautiful glassmorphism cards, interactive difficulty meters, timeline itineraries, receipt uploaders, and an elite administration dashboard.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (Vite) + Tailwind CSS v4 + Framer Motion + Lucide Icons.
- **Backend**: Node.js + Express (dynamic middleware + Multer payload parsing).
- **Database**: MongoDB (Mongoose Schemas).
- **Dual-Mode Repository Engine**: Equipped with a smart **Local-First Fallback**. The frontend automatically queries for a running Express backend; if the backend is offline or unconfigured, the app seamlessly runs in-memory/localStorage mode! You can manage treks, bookings, and uploads directly in the browser immediately on first load without spinning up MongoDB first!

---

## 📂 Project Structure

```
kaggadu-adventures/
├── frontend/                 # React + Vite client app
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Footer, TrekCard)
│   │   ├── pages/            # View pages (Home, Details, Booking, Gallery, Admin)
│   │   ├── utils/            # Simulated APIs & seed mock files
│   │   ├── App.jsx           # Routes wiring
│   │   ├── index.css         # Styling system & Google fonts
│   │   └── main.jsx
│   ├── index.html            # Rich SEO meta headers
│   └── vite.config.js        # Vite + Tailwind v4 config
│
├── server/                   # Node.js + Express + Mongoose server
│   ├── config/               # DB credentials configuration
│   ├── models/               # MongoDB models (Trek, Booking, User, Gallery)
│   ├── index.js              # Server entry, auth controllers, and seeder
│   └── .env                  # Port & database connections
└── README.md                 # Setup instructions
```

---

## 🚀 How to Run the App

### 1. Run the Frontend (Immediate Demonstration)

Go to the `frontend` folder, install the packages, and run the developer server:

```bash
cd frontend
npm install
npm run dev
```

Vite will start your dev server (usually at `http://localhost:5173`). Open this link in your browser.
- **Trek Details**: Select any card to explore full itineraries, difficulty meters, and inclusions checklists.
- **Make a Booking**: Register your details, transfer to the test UPI ID, upload a screenshot, and submit!
- **Admin Panel**: Click **Admin Login** in the navbar. Use the credentials below to enter the control room:
  - **Username**: `admin`
  - **Password**: `kaggadu2026`
- Inside the Admin Panel, you can view the bookings table, preview uploaded screenshots in a modal popup, approve bookings, add new trek destinations, and export all trekker data to a standard CSV sheet!

---

### 2. Run the Express + MongoDB Backend

To run the backend, ensure you have a running MongoDB instance, then configure and launch the server:

1. **Verify Database connection**:
   Open `/server/.env` and update the connection URI if your local port is custom:
   `MONGO_URI=mongodb://localhost:27017/kaggadu_adventures`

2. **Launch the Node server**:
   ```bash
   cd server
   npm install
   npm run start
   ```

3. The Express backend will start listening on `http://localhost:5000`.
4. On startup, the server **automatically seeds** default treks, default gallery items, and generates the master hashed admin credentials (`admin` / `kaggadu2026`) in your MongoDB database if it is empty!
5. The frontend will immediately detect that the backend server is online and dynamically switch from `localStorage` fallback to your MongoDB server API endpoints!

---

## 🌿 Ecotourism Pledge

Organized under Karnataka's eco-tourism green mandate:
- **"Leave nothing but footprints. Take nothing but photos. Kill nothing but time."**
