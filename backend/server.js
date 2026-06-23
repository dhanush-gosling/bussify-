const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/passenger', require('./routes/passenger'));
app.use('/api/conductor', require('./routes/conductor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bus', require('./routes/bus'));
app.use('/api/ticket', require('./routes/ticket'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Bussify API running ✅' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed admin on startup
    await seedAdmin();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚌 Bussify server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function seedAdmin() {
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  const existing = await User.findOne({ role: 'admin' });
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@bussify.com',
      password: hashed,
      role: 'admin'
    });
    console.log('✅ Admin user seeded');
  }
}
