import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Normalize string để bỏ dấu
const normalizeString = (str) => {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// GET tất cả users + filter + pagination
export const getUsers = async (req, res) => {
    try {
        const { name, email, page = 1, limit = 10 } = req.query;

        let users = await User.find();

        if (name) {
            const nameNormalized = normalizeString(name);
            users = users.filter(u => normalizeString(u.name).includes(nameNormalized));
        }

        if (email) {
            const emailNormalized = normalizeString(email);
            users = users.filter(u => normalizeString(u.email).includes(emailNormalized));
        }

        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const currentPage = Number(page);
        const total = users.length;
        const totalPages = Math.ceil(total / perPage);
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const paginatedUsers = users.slice(start, end);

        res.json({ total, page: currentPage, limit: perPage, totalPages, users: paginatedUsers });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
    }
};

// CREATE user
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

        const user = await User.create({ name, email, password, role }); // password plain text, Mongoose hash
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo người dùng', error: error.message });
    }
};

// UPDATE user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        if (password) user.password = password; // Mongoose sẽ hash

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', error: error.message });
    }
};

// DELETE user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

        await user.deleteOne();
        res.json({ message: 'Đã xóa người dùng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
    }
};
