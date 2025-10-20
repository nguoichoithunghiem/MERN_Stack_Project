import axiosInstance from './axiosInstance';
import type { Product } from '../types';

const BASE_URL = '/api/products'; // axiosInstance đã có baseURL

// GET products with filters + pagination
export const getProducts = async (params?: {
    name?: string;
    categoryName?: string;
    brandName?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}) => {
    const query = new URLSearchParams();

    if (params?.name) query.append('name', params.name);
    if (params?.categoryName) query.append('categoryName', params.categoryName);
    if (params?.brandName) query.append('brandName', params.brandName);
    if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await axiosInstance.get(`${BASE_URL}?${query.toString()}`);
    return res.data; // { total, page, limit, totalPages, products }
};

// CREATE product (upload ảnh bằng FormData)
export const createProduct = async (data: FormData): Promise<Product> => {
    const res = await axiosInstance.post(BASE_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' }, // token tự thêm
    });
    return res.data;
};

// UPDATE product
export const updateProduct = async (id: string, data: FormData): Promise<Product> => {
    const res = await axiosInstance.put(`${BASE_URL}/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }, // token tự thêm
    });
    return res.data;
};

// DELETE product
export const deleteProduct = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return res.data;
};
