import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import AvatarImg from '../assets/avatar.png';
import { io, type Socket } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import config from '../config.json'; // import config
import 'react-toastify/dist/ReactToastify.css';

let socket: Socket;

interface OrderNotification {
    _id: string;
    userName: string;
    totalPrice: number;
}

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [newOrders, setNewOrders] = useState<OrderNotification[]>([]);
    const [hovering, setHovering] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    useEffect(() => {
        socket = io(`${config.API_BASE_URL}`); // URL backend của bạn

        socket.on('orderCreated', (order: OrderNotification) => {
            toast.info(`Có đơn hàng mới từ ${order.userName} - Tổng: ${order.totalPrice}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClick: () => navigate('/orders')
            });

            setNewOrders(prev => [order, ...prev]); // thêm đơn hàng mới vào đầu danh sách
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

    const resetCount = () => setNewOrders([]);

    return (
        <>
            <header className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] text-white px-6 py-4 flex justify-between items-center shadow-lg">
                <h1 className="text-lg font-semibold">H&T Admin Dashboard</h1>

                <div className="flex items-center gap-4 relative">
                    {/* Nút thông báo đơn hàng mới */}
                    <div
                        className="relative"
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                    >
                        <button
                            onClick={() => { resetCount(); navigate('/orders'); }}
                            className="relative p-2 rounded-full hover:bg-white/20 transition"
                        >
                            <Bell className="w-6 h-6" />
                            {newOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {newOrders.length}
                                </span>
                            )}
                        </button>

                        {/* Dropdown hiện thông tin khi hover */}
                        {hovering && newOrders.length > 0 && (
                            <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-2 font-semibold border-b border-gray-200">Đơn hàng mới</div>
                                <ul className="max-h-64 overflow-y-auto">
                                    {newOrders.map(o => (
                                        <li key={o._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/orders')}>
                                            <div className="text-sm font-medium">{o.userName}</div>
                                            <div className="text-xs text-gray-500">Tổng: {o.totalPrice.toLocaleString()} đ</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <img src={AvatarImg} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition duration-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </header>

            <ToastContainer />
        </>
    );
};

export default Navbar;
