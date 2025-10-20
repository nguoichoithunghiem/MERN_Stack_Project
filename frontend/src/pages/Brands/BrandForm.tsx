import React, { useState } from 'react';
import type { Brand } from '../../types';
import { createBrand, updateBrand } from '../../api/brandApi';
import Swal from 'sweetalert2';

interface BrandFormProps {
    brand?: Brand;
    onSuccess: () => void;
    onClose: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ brand, onSuccess, onClose }) => {
    const [name, setName] = useState(brand?.name || '');
    const [description, setDescription] = useState(brand?.description || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { name, description };
            if (brand?._id) {
                await updateBrand(brand._id, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'Thương hiệu đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createBrand(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'Thương hiệu mới đã được tạo.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu thương hiệu.'
            });
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose}></div>

            {/* Modal */}
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
                        {brand ? 'Sửa' : 'Thêm'} Thương Hiệu
                    </h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Tên thương hiệu</label>
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
                            rows={3}
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

export default BrandForm;
