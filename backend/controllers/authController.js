import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng nhập', error: error.message });
    }
};
