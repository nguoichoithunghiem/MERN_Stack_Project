import Product from '../models/Product.js';

// =================== 📌 GET ALL PRODUCTS (CÓ LỌC + PAGINATION) ===================
export const getProducts = async (req, res) => {
    try {
        const { name, categoryName, brandName, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        // Bộ lọc linh hoạt
        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // tìm gần đúng theo tên
        }

        if (categoryName) {
            filter.categoryName = { $regex: categoryName, $options: 'i' }; // tìm gần đúng theo danh mục
        }

        if (brandName) {
            filter.brandName = { $regex: brandName, $options: 'i' }; // tìm gần đúng theo thương hiệu
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice); // giá >= minPrice
            if (maxPrice) filter.price.$lte = Number(maxPrice); // giá <= maxPrice
        }

        // Chỉ nhận limit = 5, 10, 20
        const perPage = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 10;
        const skip = (Number(page) - 1) * perPage;

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .skip(skip)
            .limit(perPage);

        res.json({
            total,                 // tổng số sản phẩm
            page: Number(page),    // trang hiện tại
            limit: perPage,        // số sản phẩm mỗi trang
            totalPages: Math.ceil(total / perPage), // tổng số trang
            products               // danh sách sản phẩm
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm', error: error.message });
    }
};

// =================== 📌 CREATE PRODUCT ===================
export const createProduct = async (req, res) => {
    try {
        const { name, price, description, countInStock, categoryName, brandName } = req.body;

        if (!name || !price || !categoryName || !brandName) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin sản phẩm!' });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            name,
            price,
            description,
            countInStock,
            categoryName,
            brandName,
            image: imageUrl,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Tạo sản phẩm thất bại', error: error.message });
    }
};

// =================== 📌 UPDATE PRODUCT ===================
export const updateProduct = async (req, res) => {
    try {
        const { name, price, description, countInStock, categoryName, brandName } = req.body;

        let imageUrl;
        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const updateData = { name, price, description, countInStock, categoryName, brandName };
        if (imageUrl) updateData.image = imageUrl;

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Cập nhật sản phẩm thất bại', error: error.message });
    }
};

// =================== 📌 DELETE PRODUCT ===================
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

        res.json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Xóa sản phẩm thất bại', error: error.message });
    }
};
