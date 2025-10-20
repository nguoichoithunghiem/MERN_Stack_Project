import React, { useEffect, useState } from 'react';
import type { Product } from '../../types';
import { createProduct, updateProduct } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import Swal from 'sweetalert2';

interface ProductFormProps {
    product?: Product;
    onSuccess: () => void;
    onClose?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onClose }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [description, setDescription] = useState(product?.description || '');
    const [countInStock, setCountInStock] = useState(product?.countInStock || 0);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [categoryName, setCategoryName] = useState(product?.categoryName || '');
    const [brandName, setBrandName] = useState(product?.brandName || '');
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [brands, setBrands] = useState<{ name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, brandRes] = await Promise.all([
                    getCategories(),
                    getBrands(),
                ]);
                setCategories(categoryRes.categories);
                setBrands(brandRes.brands);
            } catch (err) {
                console.error('Lỗi khi tải danh mục hoặc thương hiệu:', err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', price.toString());
            formData.append('description', description);
            formData.append('countInStock', countInStock.toString());
            formData.append('categoryName', categoryName);
            formData.append('brandName', brandName);
            if (imageFile) formData.append('image', imageFile);

            if (product?._id) {
                await updateProduct(product._id, formData);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'Sản phẩm đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createProduct(formData);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'Sản phẩm mới đã được tạo.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            onSuccess();
            if (onClose) onClose();

            // Reset form
            setName('');
            setPrice(0);
            setDescription('');
            setCountInStock(0);
            setCategoryName('');
            setBrandName('');
            setImageFile(null);
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu sản phẩm.'
            });
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            ></div>

            <form
                onSubmit={handleSubmit}
                className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl"
            >
                {/* Nút đóng */}
                <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {product ? 'Sửa' : 'Thêm'} sản phẩm
                </h2>

                {/* Grid chia 2 cột */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cột trái */}
                    <div className="space-y-3">
                        <div>
                            <label className="block mb-1 font-medium">Tên sản phẩm</label>
                            <input
                                type="text"
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Danh mục</label>
                            <select
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((cat) => (
                                    <option key={cat.name} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Thương hiệu</label>
                            <select
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn thương hiệu --</option>
                                {brands.map((b) => (
                                    <option key={b.name} value={b.name}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Giá</label>
                            <input
                                type="number"
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-3">
                        <div>
                            <label className="block mb-1 font-medium">Mô tả</label>
                            <textarea
                                className="border p-2 w-full h-24 rounded focus:ring-2 focus:ring-blue-400 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Số lượng tồn</label>
                            <input
                                type="number"
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                                value={countInStock}
                                onChange={(e) => setCountInStock(Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Ảnh sản phẩm</label>
                            <input
                                type="file"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded w-full hover:bg-blue-600 transition-all"
                    >
                        Lưu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
