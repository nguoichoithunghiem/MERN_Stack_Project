import axiosInstance from './axiosInstance';
import type { Category } from '../types';

const BASE_URL = '/api/categories'; // axiosInstance đã có baseURL

// GET all categories
export const getCategories = async (
    query: { name?: string; page?: number; limit?: number } = {}
): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    categories: Category[];
}> => {
    const params = new URLSearchParams();
    if (query.name) params.append('name', query.name);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await axiosInstance.get(`${BASE_URL}?${params.toString()}`);
    return res.data;
};

// CREATE category
export const createCategory = async (
    data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Category> => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
};

// UPDATE category
export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

// DELETE category
export const deleteCategory = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};
