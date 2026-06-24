# 🚌 BUSSIFY — Smart Bus Management System

A full-stack MERN application for managing a public bus system with real-time occupancy tracking, QR-based digital tickets, and multi-role access.

---

## 📁 Project Structure

```
bussify/
├── backend/               # Node.js + Express API
│   ├── models/            # Mongoose schemas
│   │   ├── User.js        # Passenger, Conductor, Admin accounts
│   │   ├── PassengerCard.js # Virtual card + wallet + journey history
│   │   ├── Bus.js         # Bus info, occupancy, passengers onboard
│   │   ├── Route.js       # Routes with ordered stops and distances
│   │   └── Ticket.js      # Tickets with QR code (base64)
│   ├── routes/            # Express route handlers
│   │   ├── auth.js        # Login, register, JWT
│   │   ├── passenger.js   # Card, wallet, bus search
│   │   ├── conductor.js   # Scan, stop updates, boarding
│   │   ├── admin.js       # Full CRUD + dashboard stats
│   │   ├── bus.js         # Bus/route info (public auth)
│   │   └── ticket.js      # Booking, QR generation
│   ├── middleware/
│   │   └── auth.js        # JWT middleware + role guard
│   ├── server.js          # Express app + MongoDB connect + admin seed
│   ├── .env.example       # Environment variable template
│   └── package.json
│
└── frontend/              # React.js SPA
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js     # Global auth state
        ├── utils/
        │   └── api.js             # Axios with JWT interceptor
        ├── components/shared/
        │   └── Navbar.js          # Role-aware navigation
        ├── pages/
        │   ├── HomePage.js        # Landing with 3 role cards
        │   ├── LoginPage.js       # Universal login
        │   ├── RegisterPage.js    # Passenger signup
        │   ├── passenger/
        │   │   ├── Dashboard.js   # Wallet + quick actions + journey history
        │   │   ├── CardPage.js    # Create/manage virtual card + recharge
        │   │   ├── SearchBus.js   # Search + book + view QR ticket
        │   │   └── MyTickets.js   # All tickets with QR codes
        │   ├── conductor/
        │   │   └── Dashboard.js   # Bus info + scan tickets + update stops
        │   └── admin/
        │       ├── Dashboard.js   # Live stats + bus overview
        │       ├── Buses.js       # CRUD buses + assign conductors
        │       ├── Routes.js      # CRUD routes + stops editor
        │       └── Conductors.js  # CRUD conductor accounts
        ├── index.css              # Global dark theme styles
        ├── App.js                 # Routes + protected routes
        └── index.js
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|---------|
| Node.js | v18+ | https://nodejs.org |
| npm | v8+ | Comes with Node |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| Git | any | https://git-scm.com |

---

## 🚀 Installation & Setup

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd bussify

# Or just navigate to the project folder
cd bussify
```

---

### Step 2 — Start MongoDB

**On Windows:**
```bash
# If installed as a service, it may already be running
# Or open MongoDB Compass and connect to localhost:27017

# Or start manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**On macOS:**
```bash
brew services start mongodb-community
# or
mongod --config /usr/local/etc/mongod.conf
```

**On Linux (Ubuntu):**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod   # optional: auto-start on boot
```

Verify MongoDB is running:
```bash
mongosh
# You should see a > prompt. Type exit to quit.
```

---

### Step 3 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in any editor and set:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bussify
JWT_SECRET=bussify_super_secret_key_2024
ADMIN_EMAIL=admin@bussify.com
ADMIN_PASSWORD=Admin@123
```

> 💡 Change `JWT_SECRET` to any long random string for production.  
> 💡 Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` for your own admin login.

---

### Step 4 — Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

### Step 5 — Run the Application

You need **two terminals** open simultaneously.

**Terminal 1 — Backend:**
```bash
cd bussify/backend
npm run dev
# → Server running on port 5000
# → MongoDB connected
# → Admin user seeded ✅
```

**Terminal 2 — Frontend:**
```bash
cd bussify/frontend
npm start
# → Opens http://localhost:3000 automatically
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@bussify.com | Admin@123 |
| **Conductor** | (create via Admin panel) | (set when creating) |
| **Passenger** | (register via Sign Up) | (set on signup) |

---

## 🧭 How to Use the App

### As Admin (first time setup):

1. Login at `http://localhost:3000` → **Admin Login**
2. Go to **Routes** → Add a route with stops and distances (km)
   - Example: Route R-101 "City Express"  
     Stop 1: Central Bus Stand (0 km)  
     Stop 2: Market Circle (3 km)  
     Stop 3: College Gate (7 km)  
     Stop 4: Railway Station (12 km)
3. Go to **Conductors** → Add a conductor account (email + password)
4. Go to **Buses** → Add a bus, assign the route and conductor

### As Conductor:

1. Login with conductor email/password
2. Dashboard shows your assigned bus with route info
3. Use **Update Stop** to mark which stop the bus is currently at
4. Use **Verify & Board** to scan/enter ticket IDs when passengers board

### As Passenger:

1. Register a new account → Login
2. Go to **My Card** → Create a virtual card (name, DOB, Aadhaar)
3. Recharge wallet (e.g. ₹500)
4. Go to **Search Bus** → Select source & destination stop
5. Choose available bus → Book ticket (fare deducted automatically)
6. Show QR ticket to conductor when boarding

---

## 💡 Key Features Summary

| Feature | Details |
|--------|---------|
| 🎫 QR Tickets | Base64 QR code generated on booking |
| 💳 Virtual Wallet | Balance deducted on booking, fine applied for missed stops |
| 📍 Stop Tracking | Conductor manually updates current stop |
| 🔔 Journey Alerts | Passengers notified at destination and for missed stops |
| 💰 Fare Calculation | ₹10/km based on distance between stops |
| 🚫 Overcrowd Prevention | Bus refuses boarding when full |
| 💰 Fine System | Extra fare applied if passenger misses destination stop |
| 🔒 Auth | JWT tokens, bcrypt passwords, role-based access |

---

## 🐛 Troubleshooting

**"MongoDB connection error"**
→ Make sure MongoDB is running (see Step 2)

**"Cannot GET /api/..."**
→ Make sure backend is running on port 5000

**Frontend shows blank page**
→ Check if backend is running; open browser console for errors

**"No buses found" when searching**
→ Admin must first add Routes, then add Buses on those routes

**Port 3000 already in use**
→ React will ask if you want to use another port — press Y

**Port 5000 already in use**
→ Change PORT in `backend/.env` to 5001, then update frontend `proxy` in `frontend/package.json`

---

## 🔧 API Endpoints Reference

```
POST   /api/auth/register          Register passenger
POST   /api/auth/login             Login any role
GET    /api/auth/me                Get current user

GET    /api/passenger/card         Get virtual card
POST   /api/passenger/card         Create virtual card
POST   /api/passenger/card/recharge Add wallet balance
GET    /api/passenger/search-buses  Search buses by stop
GET    /api/passenger/stops         Get all stop names
GET    /api/passenger/notifications Journey alerts

POST   /api/ticket/book            Book a ticket
GET    /api/ticket/my              Get my tickets

GET    /api/conductor/my-bus       Get assigned bus
POST   /api/conductor/scan         Scan & board passenger
PUT    /api/conductor/update-stop  Update current stop
GET    /api/conductor/passengers   List onboard passengers

GET    /api/admin/stats            Dashboard stats
GET/POST/PUT/DELETE /api/admin/buses
GET/POST/PUT/DELETE /api/admin/routes
GET/POST/PUT/DELETE /api/admin/conductors
```
