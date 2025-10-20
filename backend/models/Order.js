import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }, // ✅ tên người đặt
    orderItems: [{
        name: String,
        qty: Number,
        price: Number,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }],
    totalPrice: Number,
    paymentMethod: String,
    status: { type: String, enum: ['Processing', 'Completed'], default: 'Processing' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
