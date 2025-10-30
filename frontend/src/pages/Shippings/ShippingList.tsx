import React, { useEffect, useState } from "react";
import { getShippings, deleteShipping } from "../../api/shippingApi";
import ShippingForm from "./ShippingForm";
import type { Shipping } from "../../types";
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';

const ShippingList: React.FC = () => {
    const [shippings, setShippings] = useState<Shipping[]>([]);
    const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const pageOptions = [5, 10, 20, 50];

    // 📦 Lấy dữ liệu giao hàng
    const fetchData = async (query = "", pageNumber = 1, perPage = limit) => {
        try {
            setLoading(true); // 🔹 Bắt đầu loading
            const res = await getShippings({
                address: query,
                page: pageNumber.toString(),
                limit: perPage.toString(),
            });
            setShippings(res.shippings);
            setPage(res.page);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // 🔹 Kết thúc loading
        }
    };

    useEffect(() => {
        fetchData(searchTerm, page, limit);
    }, []);

    // 🗑️ Xóa giao hàng
    // 🗑️ Xóa giao hàng
    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa mục này không?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy',
            buttonsStyling: false, // tắt style mặc định
            customClass: {
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded ml-2'
            }
        });

        if (result.isConfirmed) {
            await deleteShipping(id); // gọi API xóa giao hàng
            fetchData(searchTerm, page, limit); // load lại dữ liệu

            Swal.fire({
                title: 'Đã xóa!',
                text: 'Mục đã được xóa thành công.',
                icon: 'success',
                buttonsStyling: false, // tắt style mặc định
                customClass: {
                    confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded'
                }
            });
        }
    };



    // 🔍 Tìm kiếm
    const handleSearch = () => fetchData(searchTerm, 1, limit);

    // ⌨️ Enter để tìm kiếm
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    // ⚙️ Đổi số lượng hiển thị
    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = parseInt(e.target.value);
        setLimit(newLimit);
        fetchData(searchTerm, 1, newLimit);
    };

    // ⬅️➡️ Chuyển trang
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        fetchData(searchTerm, newPage, limit);
    };

    // 📤 Xuất Excel
    const exportToExcel = () => {
        if (shippings.length === 0) {
            alert("Không có dữ liệu để xuất Excel!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
            shippings.map((s, i) => ({
                STT: i + 1,
                "Mã đơn hàng": typeof s.order === "string" ? s.order : s.order?._id || "—",
                "Địa chỉ": s.address,
                "Thành phố": s.city,
                "Mã bưu điện": s.postalCode,
                "Quốc gia": s.country,
                "Trạng thái": s.shippingStatus,
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách giao hàng");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "DanhSachGiaoHang.xlsx");
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
                    Quản lý Giao Hàng
                </h1>

                <div className="flex gap-3">
                    {/* Nút xuất Excel */}
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700 transition"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Xuất Excel</span>
                    </button>

                    {/* Nút thêm */}
                    <button
                        onClick={() => {
                            setSelectedShippingId(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        <span>Thêm giao hàng</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm giao hàng..."
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
                                {opt} mục
                            </option>
                        ))}
                    </select>

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
            {showForm && (
                <ShippingForm
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchData(searchTerm, page, limit);
                        setShowForm(false);
                    }}
                    shippingId={selectedShippingId || undefined}
                />
            )}

            {/* Bảng danh sách giao hàng */}
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
                            <th className="px-6 py-3 text-left font-semibold">Mã đơn hàng</th>
                            <th className="px-6 py-3 text-left font-semibold">Địa chỉ</th>
                            <th className="px-6 py-3 text-left font-semibold">Thành phố</th>
                            <th className="px-6 py-3 text-left font-semibold">Mã bưu điện</th>
                            <th className="px-6 py-3 text-left font-semibold">Quốc gia</th>
                            <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shippings.length > 0 ? (
                            shippings.map((s, index) => (
                                <tr
                                    key={s._id}
                                    className={`hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">
                                        {typeof s.order === "string" ? s.order : s.order?._id || "—"}
                                    </td>
                                    <td className="px-6 py-3">{s.address}</td>
                                    <td className="px-6 py-3">{s.city}</td>
                                    <td className="px-6 py-3">{s.postalCode}</td>
                                    <td className="px-6 py-3">{s.country}</td>
                                    <td className="px-6 py-3">{s.shippingStatus}</td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedShippingId(s._id);
                                                setShowForm(true);
                                            }}
                                            title="Chỉnh sửa giao hàng"
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            title="Xóa giao hàng"
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                                    Không có thông tin giao hàng nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Phân trang */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                <div className="text-gray-700 text-sm">
                    Hiển thị <span className="font-semibold text-blue-600">{shippings.length}</span> mục — Trang{" "}
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

export default ShippingList;
