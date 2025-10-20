import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware kiểm tra token
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user và bỏ password
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không có quyền truy cập, thiếu token' });
    }
};

// Middleware kiểm tra admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
    }
};
