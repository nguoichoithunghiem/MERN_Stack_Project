import axiosInstance from './axiosInstance';
import type { PaymentMethod } from '../types';

const BASE_URL = '/api/payment-methods'; // axiosInstance đã có baseURL

// ✅ Lấy danh sách phương thức thanh toán (có thể lọc + phân trang)
export const getPaymentMethods = async (queryParams?: {
    name?: string;
    description?: string;
    page?: number;
    limit?: number;
}) => {
    const params = new URLSearchParams(queryParams as any).toString();
    const url = params ? `${BASE_URL}?${params}` : BASE_URL;
    const res = await axiosInstance.get(url);
    return res.data; // { total, page, limit, totalPages, methods }
};

// ✅ Lấy chi tiết 1 phương thức thanh toán
export const getPaymentMethodById = async (id: string): Promise<PaymentMethod> => {
    const res = await axiosInstance.get(`${BASE_URL}/${id}`);
    return res.data;
};

// ✅ Tạo mới
export const createPaymentMethod = async (
    data: Omit<PaymentMethod, "_id" | "createdAt" | "updatedAt">
): Promise<PaymentMethod> => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
};

// ✅ Cập nhật
export const updatePaymentMethod = async (
    id: string,
    data: Partial<PaymentMethod>
): Promise<PaymentMethod> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

// ✅ Xóa
export const deletePaymentMethod = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};
