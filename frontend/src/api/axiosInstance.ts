import axios from 'axios';
import config from '../config.json';

// Tạo instance axios mặc định
const axiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ Request interceptor: tự động thêm Authorization header
axiosInstance.interceptors.request.use(
    (request) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Cách 1: ép kiểu để TypeScript không báo lỗi
            (request.headers as any).Authorization = `Bearer ${token}`;

            // Cách 2: dùng set nếu muốn dùng AxiosHeaders:
            // request.headers?.set('Authorization', `Bearer ${token}`);
        }
        return request;
    },
    (error) => Promise.reject(error)
);

// ✅ Response interceptor: bắt 401 (token hết hạn)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
