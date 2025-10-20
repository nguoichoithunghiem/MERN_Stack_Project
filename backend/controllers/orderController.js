import Order from '../models/Order.js';
import User from '../models/User.js';
import { io } from '../server.js'; // Socket.IO

// 📦 Lấy tất cả đơn hàng (có lọc + phân trang)
export const getOrders = async (req, res) => {
    try {
        const { userName, paymentMethod, status, startDate, endDate, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        let orders = await Order.find(filter)
            .populate('orderItems.product')
            .sort({ createdAt: -1 });

        if (userName) {
            const users = await User.find({ name: { $regex: userName, $options: 'i' } });
            const userIds = users.map(u => u._id.toString());
            orders = orders.filter(order => userIds.includes(order.user.toString()));
        }

        const total = orders.length;
        const paginatedOrders = orders.slice(skip, skip + perPage);

        const ordersWithUserName = await Promise.all(
            paginatedOrders.map(async (order) => {
                const user = await User.findById(order.user);
                return {
                    ...order.toObject(),
                    userName: user ? user.name : 'Unknown',
                };
            })
        );

        res.json({
            total,
            page: Number(page),
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
            orders: ordersWithUserName,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
    }
};

// 🛒 Tạo đơn hàng mới
export const createOrder = async (req, res) => {
    try {
        const { user: userId, orderItems, totalPrice, paymentMethod, status } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User không tồn tại' });

        const order = await Order.create({
            user: userId,
            userName: user.name,
            orderItems,
            totalPrice,
            paymentMethod,
            status,
        });

        io.emit('orderCreated', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error });
    }
};

// ✏️ Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
    try {
        const { user: userId, orderItems, totalPrice, paymentMethod, status } = req.body;

        let updateData = { orderItems, totalPrice, paymentMethod, status };

        if (userId) {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User không tồn tại' });
            updateData.user = userId;
            updateData.userName = user.name;
        }

        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!order) return res.status(404).json({ message: 'Order không tồn tại' });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng', error });
    }
};

// ❌ Xóa đơn hàng
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order không tồn tại' });

        res.json({ message: 'Order đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error });
    }
};

// 📊 Thống kê doanh thu tổng
export const getTotalRevenue = async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $match: { status: 'Completed' } }, // chỉ tính đơn hoàn thành
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        res.json(result[0] || { totalRevenue: 0, totalOrders: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thống kê doanh thu', error: error.message });
    }
};

// 📊 Thống kê doanh thu theo ngày
export const getRevenueByDay = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const match = { status: 'Completed' };
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const result = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalPrice" },
                    dailyOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thống kê doanh thu theo ngày', error: error.message });
    }
};

// 📊 Thống kê doanh thu theo tháng
export const getRevenueByMonth = async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    monthlyRevenue: { $sum: "$totalPrice" },
                    monthlyOrders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thống kê doanh thu theo tháng', error: error.message });
    }
};
