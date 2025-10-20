import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    address: String,
    city: String,
    postalCode: String,
    country: String,
    shippingStatus: { type: String, enum: ['Pending', 'Shipping', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Shipping', shippingSchema);
