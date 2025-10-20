import React, { useState } from 'react';
import type { Category } from '../../types';
import { createCategory, updateCategory } from '../../api/categoryApi';
import Swal from 'sweetalert2';

interface CategoryFormProps {
    category?: Category;
    onSuccess: () => void;
    onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess, onClose }) => {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { name, description };
            if (category?._id) {
                await updateCategory(category._id, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'Danh mục đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createCategory(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'Danh mục mới đã được tạo.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            onSuccess();
            onClose();
            setName('');
            setDescription('');
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu danh mục.'
            });
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            ></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-lg"
                >
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <h2 className="text-2xl font-bold mb-4 text-center">
                        {category ? 'Sửa Danh mục' : 'Thêm Danh mục'}
                    </h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Tên danh mục</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
                        <textarea
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
                    >
                        Lưu
                    </button>
                </form>
            </div>
        </>
    );
};

export default CategoryForm;
