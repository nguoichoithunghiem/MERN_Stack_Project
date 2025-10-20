import Category from '../models/category.js';

// 📌 Lấy tất cả danh mục (có lọc theo tên + pagination)
export const getCategories = async (req, res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // tìm gần đúng theo tên
        }

        // Chỉ nhận limit = 5, 10, 20
        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        const total = await Category.countDocuments(filter);
        const categories = await Category.find(filter)
            .skip(skip)
            .limit(perPage);

        res.json({
            total,                // tổng số danh mục
            page: Number(page),   // trang hiện tại
            limit: perPage,       // số danh mục mỗi trang
            totalPages: Math.ceil(total / perPage), // tổng số trang
            categories           // danh sách danh mục
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error: error.message });
    }
};

// 📌 Tạo danh mục mới
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
    }
};

// 📌 Cập nhật danh mục
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

        category.name = name || category.name;
        category.description = description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
    }
};

// 📌 Xóa danh mục
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });

        await category.deleteOne();
        res.json({ message: 'Đã xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: error.message });
    }
};
