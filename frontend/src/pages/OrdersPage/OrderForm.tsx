import React, { useEffect, useState } from 'react';
import type { Order, OrderItem, Product, User, PaymentMethod } from '../../types';
import { createOrder, updateOrder } from '../../api/orderApi';
import { getPaymentMethods } from '../../api/paymentMethodApi';
import Swal from 'sweetalert2';

interface OrderFormProps {
    order?: Order;
    users: User[];
    products: Product[];
    onSuccess: () => void;
    onClose: () => void; // bắt buộc
}

const OrderForm: React.FC<OrderFormProps> = ({ order, users, products, onSuccess, onClose }) => {
    const [userId, setUserId] = useState(order?.user || '');
    const [orderItems, setOrderItems] = useState<OrderItem[]>(order?.orderItems || []);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || '');
    const [status, setStatus] = useState<Order['status']>(order?.status || 'Processing');

    // 🔹 Lấy danh sách phương thức thanh toán
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const data = await getPaymentMethods();
                console.log('Payment methods raw:', data);
                setPaymentMethods(Array.isArray(data.methods) ? data.methods : []);
            } catch (err) {
                console.error('Lỗi khi tải payment methods:', err);
                setPaymentMethods([]);
            }
        };
        fetchPaymentMethods();
    }, []);


    const handleItemChange = (index: number, key: 'qty' | 'product', value: any) => {
        const newItems = [...orderItems];
        if (key === 'product') {
            const prod = products.find((p) => p._id === value);
            if (prod) {
                newItems[index] = { ...newItems[index], product: prod._id, name: prod.name, price: prod.price };
            }
        } else {
            newItems[index] = { ...newItems[index], [key]: value };
        }
        setOrderItems(newItems);
    };

    const addItem = () => setOrderItems([...orderItems, { product: '', name: '', price: 0, qty: 1 }]);
    const removeItem = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
            const userName = users.find((u) => u._id === userId)?.name || 'Unknown';

            const data: Omit<Order, '_id' | 'createdAt' | 'updatedAt'> = {
                user: userId,
                userName,
                orderItems,
                totalPrice,
                paymentMethod,
                status,
            };

            if (order?._id) {
                await updateOrder(order._id, data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'Đơn hàng đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createOrder(data);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'Đơn hàng mới đã được tạo.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu đơn hàng.'
            });
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <form className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onSubmit={handleSubmit}>
                {/* Nút đóng */}
                <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">{order ? 'Sửa' : 'Thêm'} Order</h2>

                {/* User */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">User</label>
                    <select
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn user --</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Sản phẩm</label>
                    {orderItems.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2 items-center">
                            <select
                                className="border p-2 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={item.product}
                                onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min={1}
                                className="border p-2 w-20 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                            />
                            <button
                                type="button"
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => removeItem(index)}
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={addItem}
                    >
                        Thêm sản phẩm
                    </button>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Phương thức thanh toán</label>
                    <select
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    >
                        <option value="">-- Chọn phương thức thanh toán --</option>
                        {paymentMethods.map((pm) => (
                            <option key={pm._id} value={pm.name}>
                                {pm.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Trạng thái</label>
                    <select
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Order['status'])}
                    >
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
                >
                    Lưu
                </button>
            </form>
        </div>
    );
};

export default OrderForm;
