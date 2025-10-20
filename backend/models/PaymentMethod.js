import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
}, { timestamps: true });

export default mongoose.model('PaymentMethod', paymentMethodSchema);
