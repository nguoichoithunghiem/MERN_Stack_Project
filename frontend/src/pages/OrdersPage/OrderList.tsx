import React, { useState, useEffect } from 'react';
import type { Order, User, Product } from '../../types';
import { getOrders, deleteOrder } from '../../api/orderApi';
import { getUsers } from '../../api/userApi';
import { getProducts } from '../../api/productApi';
import OrderForm from './OrderForm';
import { Edit, Trash2, Plus, Search, Eye, ChevronRight, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import OrderDetailModal from "./OrderDetail";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useOrderNotification } from '../../hooks/useOrderNotification';
import Swal from 'sweetalert2';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const { newOrdersCount } = useOrderNotification();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const itemsPerPageOptions = [5, 10, 20, 50];

    // 📦 Lấy danh sách đơn hàng từ API
    const fetchOrders = async (filters: any = {}) => {
        try {
            setLoading(true);
            const data = await getOrders({ ...filters, page, limit });
            setOrders(data.orders);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Lỗi khi lấy đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    // 🌟 Khi có đơn hàng mới, load lại danh sách
    useEffect(() => {
        if (newOrdersCount > 0) {
            fetchOrders(); // lấy lại danh sách đơn hàng
        }
    }, [newOrdersCount]);

    // 🌟 Khi page hoặc limit thay đổi
    useEffect(() => {
        handleSearch();
    }, [page, limit]);

    // 🌟 Khi load trang lần đầu: lọc từ đầu tháng đến hiện tại
    useEffect(() => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const start = `${firstDayOfMonth.getFullYear()}-${pad(firstDayOfMonth.getMonth() + 1)}-${pad(firstDayOfMonth.getDate())}`;
        const end = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        setStartDate(start);
        setEndDate(end);

        handleSearch(start, end);
    }, []);

    // 🔎 Nút tìm kiếm (có thể truyền start/end tùy ý)
    const handleSearch = async (start?: string, end?: string) => {
        const filters: any = {};
        if (searchTerm.trim()) filters.userName = searchTerm.trim();
        if (statusFilter) filters.status = statusFilter;
        if (paymentFilter) filters.paymentMethod = paymentFilter;
        filters.startDate = start || startDate;
        filters.endDate = end || endDate;

        setPage(1);
        await fetchOrders(filters);
    };

    // 🗑 Xử lý xóa đơn hàng
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa đơn hàng này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy',
            buttonsStyling: false,
            customClass: {
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded ml-2'
            }
        });

        if (result.isConfirmed) {
            await deleteOrder(id);
            fetchOrders();
            Swal.fire({
                title: 'Đã xóa!',
                text: 'Đơn hàng đã được xóa thành công.',
                icon: 'success',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded'
                }
            });
        }
    };

    // 📥 Mở form thêm/sửa
    const handleOpenForm = async (order?: Order) => {
        setEditingOrder(order || null);
        setShowForm(true);
        if (users.length === 0 || products.length === 0) {
            try {
                const [u, p] = await Promise.all([getUsers(), getProducts()]);
                setUsers(u.users);
                setProducts(p.products);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu user/product:', err);
            }
        }
    };

    // 📤 Xuất Excel
    const handleExportExcel = () => {
        if (orders.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        const data = orders.map((o, index) => ({
            STT: index + 1,
            "Mã đơn hàng": o._id,
            "Khách hàng": o.userName,
            "Tổng tiền": o.totalPrice?.toLocaleString() + " đ",
            "Phương thức thanh toán": o.paymentMethod,
            "Trạng thái": o.status,
            "Ngày tạo": o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách đơn hàng");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Danh_sach_don_hang.xlsx");
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className='flex justify-between items-center mb-6'>
                <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">Quản lý đơn hàng</h1>
                <div className='flex space-x-2'>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Thêm đơn hàng</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end justify-between">
                <div className="relative w-full sm:w-44 md:w-48 lg:w-52">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full"
                    />
                </div>

                <div className='flex space-x-2 '>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-40">
                        <option value="">Tất cả trạng thái</option>
                        <option value="Processing">Processing</option>
                        <option value="Booking Successful">Booking Successful</option>
                    </select>

                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-40">
                        <option value="">Tất cả thanh toán</option>
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Chuyển Khoản">Chuyển Khoản</option>
                    </select>

                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-36" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-36" />

                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-20"
                    >
                        {itemsPerPageOptions.map((n) => (
                            <option key={n} value={n}>{n} Đơn</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handleSearch()}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <Search size={18} />
                        <span>Tìm kiếm</span>
                    </button>
                </div>
            </div>

            {/* Form thêm/sửa */}
            {(showForm || editingOrder) && (
                <OrderForm
                    order={editingOrder || undefined}
                    users={users}
                    products={products}
                    onSuccess={() => {
                        fetchOrders();
                        setShowForm(false);
                        setEditingOrder(null);
                    }}
                    onClose={() => {
                        setShowForm(false);
                        setEditingOrder(null);
                    }}
                />
            )}

            {/* Modal chi tiết */}
            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}

            {/* Bảng danh sách đơn hàng */}
            <div className="relative overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-blue-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                )}

                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Mã đơn hàng</th>
                            <th className="px-6 py-3 text-left font-semibold">Khách hàng</th>
                            <th className="px-6 py-3 text-left font-semibold">Tổng tiền</th>
                            <th className="px-6 py-3 text-left font-semibold">Thanh toán</th>
                            <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-6 py-3 text-left font-semibold">Ngày tạo</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((o, index) => (
                                <tr
                                    key={o._id}
                                    className={`hover:bg-gray-100 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">{o._id}</td>
                                    <td className="px-6 py-3">{o.userName}</td>
                                    <td className="px-6 py-3 font-semibold text-gray-800">{o.totalPrice?.toLocaleString()} đ</td>
                                    <td className="px-6 py-3">{o.paymentMethod}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === 'Booking Successful' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button onClick={() => setSelectedOrder(o)} title="Xem chi tiết" className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow"><Eye size={16} /></button>
                                        <button onClick={() => handleOpenForm(o)} title="Chỉnh sửa" className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(o._id)} title="Xóa" className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-500 italic">Không có đơn hàng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                <div className="text-gray-700 text-sm">
                    Hiển thị <span className="font-semibold text-blue-600">{orders.length}</span> mục — Trang <span className="font-semibold text-blue-600">{page}</span> / {totalPages}
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm">Trang <span className="font-semibold text-blue-600">{page}</span> / {totalPages}</span>
                    <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages} className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderList;
