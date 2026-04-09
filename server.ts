import express from 'express';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { User, Transaction } from './src/lib/models.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found in environment variables. Database features will not work.');
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'library-fees',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

const upload = multer({ storage: storage });

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isOwner = (req: any, res: any, next: any) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// API Routes

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (role === 'owner') {
    if (username === process.env.OWNER_USERNAME && password === process.env.OWNER_PASSWORD) {
      const token = jwt.sign({ username, role: 'owner' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true });
      return res.json({ message: 'Logged in as owner', role: 'owner' });
    }
    return res.status(401).json({ error: 'Invalid owner credentials' });
  }

  if (role === 'manager') {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id, username: user.username, role: 'manager' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true });
      return res.json({ message: 'Logged in as manager', role: 'manager' });
    }
    return res.status(401).json({ error: 'Invalid manager credentials' });
  }

  res.status(400).json({ error: 'Invalid role' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json(req.user);
});

// Transactions
app.post('/api/transactions', authenticate, upload.single('paymentProof'), async (req: any, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Only managers can add transactions' });

  const { studentName, amount } = req.body;
  const paymentProof = req.file ? req.file.path : undefined;

  try {
    const transaction = new Transaction({
      studentName,
      amount,
      paymentProof,
      createdBy: req.user.id,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/api/transactions/pending', authenticate, isOwner, async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'pending' }).populate('createdBy', 'username');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.patch('/api/transactions/:id/approve', authenticate, isOwner, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});

// Analytics
app.get('/api/analytics', authenticate, isOwner, async (req, res) => {
  try {
    const approved = await Transaction.find({ status: 'approved' });
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayTotal = approved
      .filter(t => new Date(t.date) >= today)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekTotal = approved
      .filter(t => new Date(t.date) >= last7Days)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by month
    const monthlyData: any = {};
    approved.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + t.amount;
    });

    const chartData = Object.keys(monthlyData).sort().map(key => ({
      month: key,
      amount: monthlyData[key]
    }));

    res.json({
      todayTotal,
      weekTotal,
      chartData,
      allApproved: approved
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Manager Settings
app.patch('/api/settings/manager', authenticate, isOwner, async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.findOne({ role: 'manager' });
    if (user) {
      user.username = username;
      user.password = hashedPassword;
      await user.save();
    } else {
      user = new User({ username, password: hashedPassword, role: 'manager' });
      await user.save();
    }
    res.json({ message: 'Manager settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update manager settings' });
  }
});

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
