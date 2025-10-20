import axiosInstance from './axiosInstance';

const API_URL = '/api/auth';

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    token: string;
}

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(`${API_URL}/login`, data);

    // Lưu token và user vào localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
};
