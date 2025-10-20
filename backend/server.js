import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/shippings', shippingRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);

// Test route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend OK + MongoDB OK' });
});

// HTTP server + Socket.IO
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Ví dụ: nghe sự kiện từ client
    socket.on('example-event', (data) => {
        console.log('Received from client:', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Connect DB & start server
const PORT = process.env.PORT || 5000;
const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();
