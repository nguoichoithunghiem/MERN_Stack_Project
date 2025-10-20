import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// So sánh password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
