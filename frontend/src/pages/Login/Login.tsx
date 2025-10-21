// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/loginApi';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // reset lỗi trước khi đăng nhập
        try {
            const data = await loginUser({ email, password });
            console.log('Đăng nhập thành công', data);

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Điều hướng đến trang admin/dashboard
            navigate('/');
        } catch (err: any) {
            // Hiển thị thông báo lỗi từ backend
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Đăng nhập thất bại');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-10 rounded-xl shadow-xl w-96 transition-transform transform hover:scale-105"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng nhập</h2>

                {error && (
                    <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
                )}

                <div className="mb-4 relative">
                    <label className="block mb-1 font-medium text-gray-700">Email</label>
                    <div className="relative">
                        <Mail className="absolute top-3 left-3 text-gray-400" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4 relative">
                    <label className="block mb-1 font-medium text-gray-700">Mật khẩu</label>
                    <div className="relative">
                        <Lock className="absolute top-3 left-3 text-gray-400" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                            placeholder="********"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-4"
                >
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default Login;
