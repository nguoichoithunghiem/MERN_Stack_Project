import React, { useState } from 'react';
import type { User } from '../../types';
import { createUser, updateUser } from '../../api/userApi';
import Swal from 'sweetalert2';

interface UserFormProps {
    user?: User;
    onSuccess: () => void;
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onClose }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(user?.role || 'user');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { name, email, password, role };

            if (user?._id) {
                await updateUser(user._id, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'User đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createUser(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'User mới đã được tạo.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            onSuccess();
            onClose();

            // Reset form
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu user.'
            });
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            ></div>

            {/* Modal Form */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg shadow-xl p-6 relative w-full max-w-lg"
                >
                    {/* Nút đóng */}
                    <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <h2 className="text-2xl font-bold mb-4 text-center">{user ? 'Sửa' : 'Thêm'} User</h2>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Họ tên</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!user && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-1">Password</label>
                            <input
                                type="password"
                                className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Role</label>
                        <select
                            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
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

export default UserForm;
