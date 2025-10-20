import axiosInstance from './axiosInstance';
import type { Order } from '../types';

const BASE_URL = '/api/orders'; // axiosInstance đã có baseURL

// ✅ GET orders (có filter + pagination)
export const getOrders = async (filters?: {
    userName?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const res = await axiosInstance.get(BASE_URL, { params: filters });
    return res.data;
};

// CREATE order
export const createOrder = async (
    data: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Order> => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
};

// UPDATE order
export const updateOrder = async (id: string, data: Partial<Order>): Promise<Order> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

// DELETE order
export const deleteOrder = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};

// 🔹 Thống kê tổng doanh thu
export const getTotalRevenue = async (): Promise<{ totalRevenue: number; totalOrders: number }> => {
    const res = await axiosInstance.get(`${BASE_URL}/revenue/total`);
    return res.data;
};

// 🔹 Thống kê doanh thu theo ngày
export const getRevenueByDay = async (startDate?: string, endDate?: string): Promise<any[]> => {
    const res = await axiosInstance.get(`${BASE_URL}/revenue/daily`, {
        params: { startDate, endDate },
    });
    return res.data;
};

// 🔹 Thống kê doanh thu theo tháng
export const getRevenueByMonth = async (): Promise<any[]> => {
    const res = await axiosInstance.get(`${BASE_URL}/revenue/monthly`);
    return res.data;
};
