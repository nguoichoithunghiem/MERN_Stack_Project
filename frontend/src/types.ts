// src/types.ts

// User
export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

// Product
export interface Product {
    _id: string;
    name: string;
    categoryName: string;
    brandName: string;
    price: number;
    description?: string;
    countInStock?: number;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Order
export interface OrderItem {
    name: string;
    qty: number;
    price: number;
    product: string; // productId
}

export interface Order {
    _id: string;
    user: string; // userId
    userName: string;
    orderItems: OrderItem[];
    totalPrice: number;
    paymentMethod: string;
    status: 'Processing' | 'Booking Successful';
    createdAt?: string;
    updatedAt?: string;
}
export interface Brand {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// Shipping
export interface Shipping {
    _id: string;
    order: string | Order; // có thể là id hoặc object populate từ backend
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    shippingStatus: 'Pending' | 'Shipping' | 'Delivered';
    createdAt?: string;
    updatedAt?: string;
}
export interface PaymentMethod {
    _id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}





