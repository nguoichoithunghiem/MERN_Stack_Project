import PaymentMethod from "../models/PaymentMethod.js";

// 📌 Lấy tất cả phương thức thanh toán (có lọc + phân trang)
export const getPaymentMethods = async (req, res) => {
    try {
        const { name, description, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: "i" }; // tìm gần đúng theo tên
        }
        if (description) {
            filter.description = { $regex: description, $options: "i" }; // tìm gần đúng theo mô tả
        }

        // Chỉ nhận limit = 5, 10, 20
        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        const total = await PaymentMethod.countDocuments(filter);
        const methods = await PaymentMethod.find(filter)
            .skip(skip)
            .limit(perPage);

        res.status(200).json({
            total,                // tổng số phương thức
            page: Number(page),   // trang hiện tại
            limit: perPage,       // số item mỗi trang
            totalPages: Math.ceil(total / perPage), // tổng số trang
            methods               // danh sách phương thức
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách phương thức thanh toán",
            error: error.message,
        });
    }
};


// 📌 Lấy phương thức thanh toán theo ID
export const getPaymentMethodById = async (req, res) => {
    try {
        const method = await PaymentMethod.findById(req.params.id);
        if (!method)
            return res
                .status(404)
                .json({ message: "Không tìm thấy phương thức thanh toán" });
        res.status(200).json(method);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy phương thức thanh toán",
            error: error.message,
        });
    }
};

// 📌 Tạo phương thức thanh toán mới
export const createPaymentMethod = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra trùng tên
        const existingMethod = await PaymentMethod.findOne({ name });
        if (existingMethod) {
            return res
                .status(400)
                .json({ message: "Tên phương thức thanh toán đã tồn tại" });
        }

        const newMethod = new PaymentMethod({ name, description });
        const savedMethod = await newMethod.save();
        res.status(201).json(savedMethod);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi tạo phương thức thanh toán",
            error: error.message,
        });
    }
};

// 📌 Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (req, res) => {
    try {
        const updatedMethod = await PaymentMethod.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedMethod)
            return res
                .status(404)
                .json({ message: "Không tìm thấy phương thức thanh toán" });
        res.status(200).json(updatedMethod);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi cập nhật phương thức thanh toán",
            error: error.message,
        });
    }
};

// 📌 Xóa phương thức thanh toán
export const deletePaymentMethod = async (req, res) => {
    try {
        const deletedMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
        if (!deletedMethod)
            return res
                .status(404)
                .json({ message: "Không tìm thấy phương thức thanh toán" });
        res
            .status(200)
            .json({ message: "Xóa phương thức thanh toán thành công" });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi xóa phương thức thanh toán",
            error: error.message,
        });
    }
};
