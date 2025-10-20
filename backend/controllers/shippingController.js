import Shipping from '../models/shipping.js';

// 📌 Lấy danh sách tất cả shipping (có lọc + phân trang)
export const getShippings = async (req, res) => {
    try {
        const { receiverName, address, status, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (receiverName) {
            filter.receiverName = { $regex: receiverName, $options: 'i' }; // tìm gần đúng theo tên người nhận
        }
        if (address) {
            filter.address = { $regex: address, $options: 'i' }; // tìm gần đúng theo địa chỉ
        }
        if (status) {
            filter.status = { $regex: status, $options: 'i' }; // lọc theo trạng thái
        }

        // Chỉ nhận limit = 5, 10, 20
        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        const total = await Shipping.countDocuments(filter);
        const shippings = await Shipping.find(filter)
            .populate('order')
            .skip(skip)
            .limit(perPage);

        res.status(200).json({
            total,                // tổng số shipping
            page: Number(page),   // trang hiện tại
            limit: perPage,       // số item/trang
            totalPages: Math.ceil(total / perPage), // tổng số trang
            shippings             // danh sách shipping
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách giao hàng', error: error.message });
    }
};

// 📌 Lấy chi tiết 1 shipping theo ID
export const getShippingById = async (req, res) => {
    try {
        const shipping = await Shipping.findById(req.params.id).populate('order');
        if (!shipping) return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng' });
        res.status(200).json(shipping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📌 Tạo mới shipping
export const createShipping = async (req, res) => {
    try {
        const newShipping = new Shipping(req.body);
        const savedShipping = await newShipping.save();
        res.status(201).json(savedShipping);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo thông tin giao hàng', error });
    }
};

// 📌 Cập nhật shipping
export const updateShipping = async (req, res) => {
    try {
        const updatedShipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedShipping)
            return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng để cập nhật' });
        res.status(200).json(updatedShipping);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật thông tin giao hàng', error });
    }
};

// 📌 Xóa shipping
export const deleteShipping = async (req, res) => {
    try {
        const deletedShipping = await Shipping.findByIdAndDelete(req.params.id);
        if (!deletedShipping)
            return res.status(404).json({ message: 'Không tìm thấy thông tin giao hàng để xóa' });
        res.status(200).json({ message: 'Đã xóa thông tin giao hàng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa thông tin giao hàng', error });
    }
};
