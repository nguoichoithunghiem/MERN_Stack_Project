import axiosInstance from './axiosInstance';
import type { Brand } from '../types';

const BASE_URL = '/api/brands'; // lưu ý bỏ config.API_BASE_URL vì axiosInstance đã có baseURL

// GET all brands
export const getBrands = async (
    query: { name?: string; page?: number; limit?: number } = {}
): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    brands: Brand[];
}> => {
    const params = new URLSearchParams();
    if (query.name) params.append('name', query.name);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const res = await axiosInstance.get(`${BASE_URL}?${params.toString()}`);
    return res.data;
};

// CREATE brand
export const createBrand = async (
    data: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Brand> => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
};

// UPDATE brand
export const updateBrand = async (id: string, data: Partial<Brand>): Promise<Brand> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

// DELETE brand
export const deleteBrand = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};
