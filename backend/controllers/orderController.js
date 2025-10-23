import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js'; // ✅ Dùng để trừ / cộng tồn kho
import { io } from '../server.js'; // Socket.IO

// =================== 📦 LẤY TẤT CẢ ĐƠN HÀNG (CÓ LỌC + PHÂN TRANG) ===================
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

// =================== 🛒 TẠO ĐƠN HÀNG (TỰ ĐỘNG TRỪ TỒN KHO) ===================
export const createOrder = async (req, res) => {
    try {
        const { user: userId, orderItems, totalPrice, paymentMethod, status } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User không tồn tại' });

        // 🔹 1️⃣ Kiểm tra tồn kho
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Sản phẩm ID ${item.product} không tồn tại` });
            }
            if (product.countInStock < item.qty) {
                return res.status(400).json({
                    message: `Sản phẩm "${product.name}" không đủ hàng (Còn ${product.countInStock})`,
                });
            }
        }

        // 🔹 2️⃣ Tạo đơn hàng
        const order = await Order.create({
            user: userId,
            userName: user.name,
            orderItems,
            totalPrice,
            paymentMethod,
            status,
        });

        // 🔹 3️⃣ Trừ tồn kho
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.qty },
            });
        }

        io.emit('orderCreated', order);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
    }
};

// =================== ✏️ CẬP NHẬT ĐƠN HÀNG ===================
export const updateOrder = async (req, res) => {
    try {
        const { user: userId, orderItems, totalPrice, paymentMethod, status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order không tồn tại' });

        // 🔹 Nếu trạng thái chuyển từ khác -> "Cancelled" → hoàn lại hàng
        if (order.status !== 'Cancelled' && status === 'Cancelled') {
            for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: item.qty },
                });
            }
        }

        // 🔹 Cập nhật user name nếu đổi user
        let updateData = { orderItems, totalPrice, paymentMethod, status };
        if (userId) {
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User không tồn tại' });
            updateData.user = userId;
            updateData.userName = user.name;
        }

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng', error: error.message });
    }
};

// =================== ❌ XÓA ĐƠN HÀNG (TỰ HOÀN LẠI TỒN KHO) ===================
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order không tồn tại' });

        // Hoàn lại tồn kho
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: item.qty },
            });
        }

        await order.deleteOne();
        res.json({ message: 'Order đã được xóa và hoàn lại tồn kho' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error: error.message });
    }
};

// =================== 📊 THỐNG KÊ DOANH THU TỔNG ===================
export const getTotalRevenue = async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $match: { status: 'Completed' } },
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

// =================== 📊 THỐNG KÊ DOANH THU THEO NGÀY ===================
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

// =================== 📊 THỐNG KÊ DOANH THU THEO THÁNG ===================
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
