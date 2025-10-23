import React, { useEffect, useState } from "react";
import type { PaymentMethod } from "../../types";
import { getPaymentMethods, deletePaymentMethod } from "../../api/paymentMethodApi";
import PaymentMethodForm from "./PaymentMethodForm";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

const PaymentMethodList: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);

    const pageOptions = [5, 10, 20, 50];

    // 🔄 Lấy dữ liệu từ backend (có phân trang + filter)
    const fetchData = async (query = "", pageNumber = 1, limitValue = limit) => {
        try {
            setLoading(true); // 🔹 Bật loading
            const data = await getPaymentMethods({
                name: query,
                description: query,
                page: pageNumber,
                limit: limitValue,
            });
            setMethods(data.methods);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // 🔹 Tắt loading
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    // ❌ Xóa phương thức
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa phương thức thanh toán này không?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await deletePaymentMethod(id);
            fetchData(searchTerm, page);
            Swal.fire(
                'Đã xóa!',
                'Phương thức thanh toán đã được xóa thành công.',
                'success'
            );
        }
    };

    // ✏️ Sửa phương thức
    const handleEdit = (id: string) => {
        setSelectedId(id);
        setShowForm(true);
    };

    // ➕ Thêm mới
    const handleAdd = () => {
        setSelectedId(undefined);
        setShowForm(true);
    };

    // 🔍 Tìm kiếm
    const handleSearch = () => {
        fetchData(searchTerm, 1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    // 🔢 Thay đổi số lượng hiển thị mỗi trang
    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(e.target.value);
        setLimit(newLimit);
        fetchData(searchTerm, 1, newLimit);
    };

    // 🔄 Chuyển trang
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) fetchData(searchTerm, newPage);
    };

    // 📤 Xuất Excel
    const exportToExcel = () => {
        if (methods.length === 0) {
            alert("Không có dữ liệu để xuất Excel!");
            return;
        }

        const data = methods.map((m, index) => ({
            STT: index + 1,
            "Tên phương thức": m.name,
            "Mô tả": m.description || "—",
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PhuongThucThanhToan");

        XLSX.writeFile(workbook, "DanhSach_PhuongThucThanhToan.xlsx");
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
                    Quản lý Phương thức Thanh toán
                </h1>

                <div className="flex gap-3">
                    {/* Xuất Excel */}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Xuất Excel</span>
                    </button>

                    {/* Thêm phương thức */}
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        <span>Thêm phương thức</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm phương thức..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                <div className="flex space-x-2">
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                    >
                        {pageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt} Phương thức
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                    >
                        <Search size={18} />
                        <span>Tìm kiếm</span>
                    </button>
                </div>
            </div>

            {/* Modal Form */}
            {showForm && (
                <PaymentMethodForm
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    paymentMethodId={selectedId}
                    onSuccess={() => {
                        fetchData(searchTerm, page);
                        setShowForm(false);
                    }}
                />
            )}

            {/* Bảng dữ liệu phương thức thanh toán */}
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
                            <th className="px-6 py-3 text-left font-semibold">Tên phương thức</th>
                            <th className="px-6 py-3 text-left font-semibold">Mô tả</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {methods.length > 0 ? (
                            methods.map((m, index) => (
                                <tr
                                    key={m._id}
                                    className={`hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">{m.name}</td>
                                    <td className="px-6 py-3">{m.description || "—"}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(m._id)}
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(m._id)}
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
                                    Không có phương thức thanh toán nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                <div className="text-gray-700 text-sm">
                    Hiển thị <span className="font-semibold text-blue-600">{methods.length}</span> mục — Trang{" "}
                    <span className="font-semibold text-blue-600">{page}</span> / {totalPages}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg shadow-sm">
                        Trang <span className="font-semibold text-blue-600">{page}</span> / {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodList;
