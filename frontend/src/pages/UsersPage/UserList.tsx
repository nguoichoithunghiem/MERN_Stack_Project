import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import UserForm from './UserForm';
import { deleteUser, getUsers } from '../../api/userApi';
import type { User } from '../../types';
import { Edit, Trash2, Plus, Search, ChevronRight, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔍 Bộ lọc
    const [filters, setFilters] = useState({
        name: '',
        email: ''
    });

    // 📄 Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // 📦 Lấy danh sách user từ API
    const fetchUsers = async () => {
        try {
            setLoading(true); // 🔹 Bắt đầu loading
            const query = {
                name: filters.name || undefined,
                email: filters.email || undefined,
                page: currentPage,
                limit: pageSize
            };
            const queryString = Object.entries(query)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
                .join('&');

            const res = await getUsers(queryString);
            setUsers(res.users);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // 🔹 Kết thúc loading
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize]);

    // 🗑️ Xóa user
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa user này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await deleteUser(id);
            fetchUsers();
            Swal.fire(
                'Đã xóa!',
                'User đã được xóa thành công.',
                'success'
            );
        }
    };

    // 📤 Xuất Excel
    const handleExportExcel = () => {
        if (users.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        const dataToExport = users.map(u => ({
            'Họ tên': u.name,
            'Email': u.email,
            'Vai trò': u.role === 'admin' ? 'Admin' : 'User',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNguoiDung');

        XLSX.writeFile(workbook, 'DanhSachNguoiDung.xlsx');
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800">Quản lý người dùng</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <FileSpreadsheet size={18} /> <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => { setEditingUser(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> <span>Thêm User</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end">
                <div className="flex justify-between w-full">
                    <div className="flex flex-1">
                        <input
                            type="text"
                            placeholder="Tìm theo tên..."
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
                        />
                    </div>

                    <div className="flex space-x-2 items-center">
                        <input
                            type="text"
                            placeholder="Tìm theo email..."
                            value={filters.email}
                            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
                        />
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-40"
                        >
                            <option value={5}>5 User</option>
                            <option value={10}>10 User</option>
                            <option value={20}>20 User</option>
                        </select>
                        <button
                            onClick={() => { setCurrentPage(1); fetchUsers(); }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                        >
                            <Search size={18} /> <span>Tìm kiếm</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Form thêm/sửa */}
            {(showForm || editingUser) && (
                <UserForm
                    user={editingUser || undefined}
                    onSuccess={() => { fetchUsers(); setEditingUser(null); setShowForm(false); }}
                    onClose={() => { setShowForm(false); setEditingUser(null); }}
                />
            )}

            {/* Bảng User */}
            {/* Bảng danh sách người dùng */}
            <div className="relative overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
                        {/* Spinner tròn xanh */}
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-blue-500 font-medium">Đang tải dữ liệu...</p>
                    </div>
                )}

                <table className="w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Họ tên</th>
                            <th className="px-6 py-3 text-left font-semibold">Email</th>
                            <th className="px-6 py-3 text-left font-semibold">Vai trò</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((u, index) => (
                                <tr key={u._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                                    <td className="px-6 py-3 font-medium">{u.name}</td>
                                    <td className="px-6 py-3">{u.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {u.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => { setEditingUser(u); setShowForm(true); }}
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u._id)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-500 italic">
                                    Không có user nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                <div className="text-gray-700 text-sm">
                    Hiển thị <span className="font-semibold text-blue-600">{users.length}</span> mục — Trang <span className="font-semibold text-blue-600">{currentPage}</span> / {totalPages}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white 
                        hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm">
                        Trang <span className="font-semibold text-blue-600">{currentPage}</span> / {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white 
                        hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserList;
