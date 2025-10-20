import axiosInstance from './axiosInstance';
import type { User } from '../types';

const BASE_URL = '/api/users'; // axiosInstance đã có baseURL

// 🧭 Lấy danh sách users (có lọc + phân trang)
export const getUsers = async (query = ''): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    users: User[];
}> => {
    const url = query ? `${BASE_URL}?${query}&t=${Date.now()}` : `${BASE_URL}?t=${Date.now()}`;
    const res = await axiosInstance.get(url, { headers: { 'Cache-Control': 'no-cache' } });
    return res.data;
};

// ➕ Tạo mới user
export const createUser = async (data: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
};

// ✏️ Cập nhật user
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

// ❌ Xóa user
export const deleteUser = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};
