import React, { useState, useEffect } from 'react';
import BrandForm from './BrandForm';
import type { Brand } from '../../types';
import { getBrands, deleteBrand } from '../../api/brandApi';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const BrandList: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const pageOptions = [5, 10, 20];

    // 📦 Lấy danh sách thương hiệu (có filter + pagination)
    const fetchBrands = async (
        nameFilter = '',
        pageNumber = 1,
        perPage = 10
    ) => {
        try {
            setLoading(true);
            const data = await getBrands({ name: nameFilter, page: pageNumber, limit: perPage });
            setBrands(data.brands);
            setPage(data.page);
            setLimit(data.limit);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Lỗi khi tải danh sách thương hiệu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands(searchTerm, page, limit);
    }, []);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa thương hiệu này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await deleteBrand(id);
            fetchBrands(searchTerm, page, limit);
            Swal.fire(
                'Đã xóa!',
                'Thương hiệu đã được xóa thành công.',
                'success'
            );
        }
    };

    const handleSearch = async () => {
        fetchBrands(searchTerm, 1, limit); // reset page về 1 khi tìm kiếm
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        fetchBrands(searchTerm, newPage, limit);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(e.target.value);
        setLimit(newLimit);
        fetchBrands(searchTerm, 1, newLimit); // reset page 1 khi đổi limit
    };

    // 📤 Hàm xuất Excel
    const handleExportExcel = () => {
        if (brands.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        const data = brands.map((b, index) => ({
            STT: index + 1,
            'Tên thương hiệu': b.name,
            'Mô tả': b.description || '',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Thương hiệu');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Danh_sach_thuong_hieu.xlsx');
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
                    Quản lý Thương Hiệu
                </h1>
                <div className='flex space-x-2'>
                    {/* Nút xuất Excel */}
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingBrand(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        <span>Thêm thương hiệu</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc thương hiệu */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end justify-between">
                {/* Ô tìm kiếm */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thương hiệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                <div className='flex space-x-2'>
                    {/* Bộ chọn số lượng hiển thị mỗi trang */}
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        {pageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt} Thương hiệu
                            </option>
                        ))}
                    </select>

                    {/* Nút tìm kiếm */}
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <Search size={18} />
                        <span>Tìm kiếm</span>
                    </button>


                </div>
            </div>

            {/* Modal Form */}
            {(showForm || editingBrand) && (
                <BrandForm
                    brand={editingBrand || undefined}
                    onSuccess={() => {
                        fetchBrands(searchTerm, page, limit);
                        setEditingBrand(null);
                        setShowForm(false);
                    }}
                    onClose={() => {
                        setShowForm(false);
                        setEditingBrand(null);
                    }}
                />
            )}

            {/* Bảng danh sách thương hiệu */}
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
                            <th className="px-6 py-3 text-left font-semibold">Tên thương hiệu</th>
                            <th className="px-6 py-3 text-left font-semibold">Mô tả</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.length > 0 ? (
                            brands.map((b, index) => (
                                <tr
                                    key={b._id}
                                    className={`hover:bg-gray-100 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">{b.name}</td>
                                    <td className="px-6 py-3 text-gray-700">{b.description || '—'}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                setEditingBrand(b);
                                                setShowForm(true);
                                            }}
                                            title="Chỉnh sửa thương hiệu"
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(b._id)}
                                            title="Xóa thương hiệu"
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center py-6 text-gray-500 italic">
                                    Không có thương hiệu nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                <div className="text-gray-700 text-sm">
                    Hiển thị <span className="font-semibold text-blue-600">{brands.length}</span> thương hiệu — Trang{' '}
                    <span className="font-semibold text-blue-600">{page}</span> / {totalPages}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white 
                       hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm">
                        Trang <span className="font-semibold text-blue-600">{page}</span> / {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
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

export default BrandList;
