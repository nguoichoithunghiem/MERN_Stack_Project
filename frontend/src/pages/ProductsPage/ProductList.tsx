import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import { deleteProduct, getProducts } from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import type { Product, Category, Brand } from '../../types';
import { Edit, Trash2, Plus, Search, ChevronRight, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false); // 🔹 Thêm dòng này

    // 🔍 Bộ lọc
    const [filters, setFilters] = useState({
        name: '',
        categoryName: '',
        brandName: '',
        minPrice: '',
        maxPrice: ''
    });

    // 🧭 Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, [currentPage, pageSize]);

    const fetchProducts = async () => {
        try {
            setLoading(true); // Bật loading
            const res = await getProducts({
                name: filters.name || undefined,
                categoryName: filters.categoryName || undefined,
                brandName: filters.brandName || undefined,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                page: currentPage,
                limit: pageSize
            });
            setProducts(res.products);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); // Tắt loading
        }
    };

    const fetchCategories = async () => {
        const data = await getCategories();
        setCategories(data.categories);
    };

    const fetchBrands = async () => {
        const data = await getBrands();
        setBrands(data.brands);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn xóa sản phẩm này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await deleteProduct(id);
            fetchProducts();
            Swal.fire(
                'Đã xóa!',
                'Sản phẩm đã được xóa thành công.',
                'success'
            );
        }
    };

    // 📤 Xuất Excel
    const handleExportExcel = () => {
        if (products.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        const data = products.map((p, index) => ({
            STT: index + 1,
            'Tên sản phẩm': p.name,
            'Danh mục': p.categoryName || '',
            'Thương hiệu': p.brandName || '',
            'Giá': p.price?.toLocaleString() + ' đ',
            'Số lượng': p.countInStock || 0,
            'Hình ảnh': p.image || '',
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Danh_sach_san_pham.xlsx');
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800">Quản lý sản phẩm</h1>
                <div className='flex space-x-2'>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <FileSpreadsheet size={18} /> <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={() => { setEditingProduct(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> <span>Thêm sản phẩm</span>
                    </button>
                </div>
            </div>

            {/* Bộ lọc */}
            <div className="rounded-xl mb-6 bg-white p-4 shadow flex flex-wrap gap-4 items-end justify-between">
                <div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sản phẩm..."
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
                    />
                </div>
                <div className='flex space-x-2'>
                    <select
                        value={filters.categoryName}
                        onChange={(e) => setFilters({ ...filters, categoryName: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-48"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.brandName}
                        onChange={(e) => setFilters({ ...filters, brandName: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-40"
                    >
                        <option value="">Tất cả thương hiệu</option>
                        {brands.map((b) => (
                            <option key={b._id} value={b.name}>{b.name}</option>
                        ))}
                    </select>
                    <select
                        value={`${filters.minPrice}-${filters.maxPrice}`}
                        onChange={(e) => {
                            const [min, max] = e.target.value.split('-');
                            setFilters({ ...filters, minPrice: min || '', maxPrice: max || '' });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 w-40"
                    >
                        <option value="-">Giá tiền</option>
                        <option value="-500000">Dưới 500.000đ</option>
                        <option value="500000-1000000">500.000đ - 1.000.000đ</option>
                        <option value="1000000-3000000">1.000.000đ - 3.000.000đ</option>
                        <option value="3000000-5000000">3.000.000đ - 5.000.000đ</option>
                        <option value="5000000-">Trên 5.000.000đ</option>
                    </select>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-gray-300 rounded-lg px-3 py-2 "
                    >
                        <option value={5}>5 Sản phẩm</option>
                        <option value={10}>10 Sản phẩm</option>
                        <option value={20}>20 Sản phẩm</option>
                    </select>

                    <button
                        onClick={() => { setCurrentPage(1); fetchProducts(); }}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                    >
                        <Search size={18} /> <span>Tìm kiếm</span>
                    </button>
                </div>
            </div>


            {/* Form thêm/sửa */}
            {(showForm || editingProduct) && (
                <ProductForm
                    product={editingProduct || undefined}
                    onSuccess={() => { fetchProducts(); setEditingProduct(null); setShowForm(false); }}
                    onClose={() => { setShowForm(false); setEditingProduct(null); }}
                />
            )}

            {/* Bảng sản phẩm */}
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
                            <th className="px-6 py-3 text-left font-semibold">Ảnh</th>
                            <th className="px-6 py-3 text-left font-semibold">Tên sản phẩm</th>
                            <th className="px-6 py-3 text-left font-semibold">Danh mục</th>
                            <th className="px-6 py-3 text-left font-semibold">Thương hiệu</th>
                            <th className="px-6 py-3 text-left font-semibold">Giá</th>
                            <th className="px-6 py-3 text-left font-semibold">Số lượng</th>
                            <th className="px-6 py-3 text-center font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((p, index) => (
                                <tr key={p._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                                    <td className="px-6 py-3">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">No Img</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 font-medium">{p.name}</td>
                                    <td className="px-6 py-3">{p.categoryName || '—'}</td>
                                    <td className="px-6 py-3">{p.brandName || '—'}</td>
                                    <td className="px-6 py-3 font-semibold">{p.price?.toLocaleString()} đ</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.countInStock && p.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {p.countInStock && p.countInStock > 0 ? `${p.countInStock} còn lại` : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 flex justify-center gap-3">
                                        <button
                                            onClick={() => { setEditingProduct(p); setShowForm(true); }}
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition shadow"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p._id)}
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
                                    Không có sản phẩm nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
                    <div className="text-gray-700 text-sm">
                        Hiển thị <span className="font-semibold text-blue-600">{products.length}</span> sản phẩm —
                        Trang <span className="font-semibold text-blue-600">{currentPage}</span> / {totalPages}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white 
                           hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
