// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, User, ShoppingCart, Building2, Tags, Truck, CreditCard, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import LogoImage from '../assets/react.svg';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void; // callback để toggle
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Thống kê', path: '/revenue', icon: <TrendingUp className="w-5 h-5" /> },
        { name: 'Sản phẩm', path: '/products', icon: <Box className="w-5 h-5" /> },
        { name: 'Người dùng', path: '/users', icon: <User className="w-5 h-5" /> },
        { name: 'Đơn hàng', path: '/orders', icon: <ShoppingCart className="w-5 h-5" /> },
        { name: 'Thương hiệu', path: '/brands', icon: <Building2 className="w-5 h-5" /> },
        { name: 'Danh mục', path: '/categories', icon: <Tags className="w-5 h-5" /> },
        { name: 'Vận chuyển', path: '/shippings', icon: <Truck className="w-5 h-5" /> },
        { name: 'Thanh toán', path: '/paymentMethods', icon: <CreditCard className="w-5 h-5" /> },
    ];

    return (
        <aside
            className={`bg-gradient-to-b from-[#0a192f] to-[#112240] text-gray-300 min-h-screen flex flex-col justify-between shadow-xl transition-all duration-300
            ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo ở trên cố định */}
            <div className="flex items-center justify-center py-4 border-b border-gray-700">
                <img
                    src={LogoImage}
                    alt="Logo"
                    className={`transition-all duration-300 ${isCollapsed ? 'h-8' : 'h-10 w-auto'}`}
                />
            </div>

            {/* Menu */}
            <nav className="flex-1 p-3">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                                        ${active
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'hover:bg-[#233554] hover:text-white'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer + nút toggle */}
            <div className="p-3 border-t border-gray-700 flex flex-col items-center">
                {!isCollapsed && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                        © 2025 H&T Admin
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="mt-2 p-1 rounded hover:bg-[#233554] transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
