import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
}, { timestamps: true });

export default mongoose.model('Brand', brandSchema);
