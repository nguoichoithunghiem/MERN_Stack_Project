import Brand from '../models/Brand.js';

// 📌 Lấy tất cả thương hiệu (có lọc + pagination)
export const getBrands = async (req, res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // tìm gần đúng theo tên
        }

        // Chỉ nhận limit = 5, 10, 20
        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        const total = await Brand.countDocuments(filter);
        const brands = await Brand.find(filter)
            .skip(skip)
            .limit(perPage);

        res.json({
            total,                // tổng số thương hiệu
            page: Number(page),   // trang hiện tại
            limit: perPage,       // số thương hiệu mỗi trang
            totalPages: Math.ceil(total / perPage), // tổng số trang
            brands                // danh sách thương hiệu
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thương hiệu', error: error.message });
    }
};

// 📌 Tạo thương hiệu mới
export const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({ message: 'Tên thương hiệu đã tồn tại' });
        }

        const brand = await Brand.create({ name, description });
        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo thương hiệu', error: error.message });
    }
};

// 📌 Cập nhật thương hiệu
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const brand = await Brand.findById(id);
        if (!brand) return res.status(404).json({ message: 'Thương hiệu không tồn tại' });

        brand.name = name || brand.name;
        brand.description = description || brand.description;

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thương hiệu', error: error.message });
    }
};

// 📌 Xóa thương hiệu
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await Brand.findById(id);
        if (!brand) return res.status(404).json({ message: 'Thương hiệu không tồn tại' });

        await brand.deleteOne();
        res.json({ message: 'Đã xóa thương hiệu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa thương hiệu', error: error.message });
    }
};
