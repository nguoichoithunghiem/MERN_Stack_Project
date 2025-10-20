import axiosInstance from './axiosInstance';
import type { Shipping } from '../types';

const API_URL = '/api/shippings'; // axiosInstance đã có baseURL

// ✅ Lấy danh sách shipping (có lọc + phân trang)
export const getShippings = async (queryParams?: {
    receiverName?: string;
    address?: string;
    status?: string;
    page?: string;
    limit?: string;
}): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    shippings: Shipping[];
}> => {
    const params = new URLSearchParams(queryParams as any).toString();
    const url = params ? `${API_URL}?${params}` : API_URL;
    const res = await axiosInstance.get(url);
    return res.data;
};

// ✅ Lấy chi tiết 1 shipping
export const getShippingById = async (id: string): Promise<Shipping> => {
    const res = await axiosInstance.get(`${API_URL}/${id}`);
    return res.data;
};

// ✅ Tạo mới shipping
export const createShipping = async (data: Partial<Shipping>): Promise<Shipping> => {
    const res = await axiosInstance.post(API_URL, data);
    return res.data;
};

// ✅ Cập nhật shipping
export const updateShipping = async (id: string, data: Partial<Shipping>): Promise<Shipping> => {
    const res = await axiosInstance.put(`${API_URL}/${id}`, data);
    return res.data;
};

// ✅ Xóa shipping
export const deleteShipping = async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/${id}`);
};
