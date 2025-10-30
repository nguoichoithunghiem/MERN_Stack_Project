import React, { useEffect, useState } from 'react';
import type { Order, OrderItem, Product, User, PaymentMethod } from '../../types';
import { createOrder, updateOrder } from '../../api/orderApi';
import { getPaymentMethods } from '../../api/paymentMethodApi';
import Swal from 'sweetalert2';

interface OrderFormProps {
    order?: Order;
    users: User[];
    products: Product[]; // nhận products từ OrderList để chắc chắn đã load
    onSuccess: () => void;
    onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, users, products, onSuccess, onClose }) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [userId, setUserId] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [status, setStatus] = useState<Order['status']>('Processing');
    const [error, setError] = useState('');

    // 🔹 Load payment methods
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const data = await getPaymentMethods();
                setPaymentMethods(Array.isArray(data.methods) ? data.methods : []);
            } catch (err) {
                console.error('Lỗi khi tải payment methods:', err);
                setPaymentMethods([]);
            }
        };
        fetchPaymentMethods();
    }, []);

    // 🔹 Khi order hoặc products thay đổi
    useEffect(() => {
        if (order && products.length > 0) {
            setUserId(order.user || '');
            setPaymentMethod(order.paymentMethod || '');
            setStatus(order.status || 'Processing');

            const mappedItems = order.orderItems?.map((item) => {
                const prod = products.find((p) => p._id === String(item.product));
                return {
                    product: item.product, // luôn giữ id cũ
                    name: prod?.name || item.name || 'Unknown',
                    price: prod?.price || item.price || 0,
                    qty: item.qty,
                };
            }) || [];

            setOrderItems(mappedItems);
        } else if (!order) {
            setOrderItems([]);
            setUserId('');
            setPaymentMethod('');
            setStatus('Processing');
        }
    }, [order, products]);

    // 🔹 Thêm / xóa / cập nhật sản phẩm
    const handleItemChange = (index: number, key: 'qty' | 'product', value: any) => {
        setError('');
        const newItems = [...orderItems];
        if (key === 'product') {
            const prod = products.find((p) => p._id === String(value));
            if (prod) {
                newItems[index] = { ...newItems[index], product: prod._id, name: prod.name, price: prod.price };
            } else {
                newItems[index] = { ...newItems[index], product: value, name: newItems[index].name, price: newItems[index].price };
            }
        } else {
            newItems[index] = { ...newItems[index], [key]: value };
        }
        setOrderItems(newItems);
    };

    const addItem = () => setOrderItems([...orderItems, { product: '', name: '', price: 0, qty: 1 }]);
    const removeItem = (index: number) => setOrderItems(orderItems.filter((_, i) => i !== index));

    // 🔹 Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!userId) { setError('Vui lòng chọn user!'); return; }
        if (orderItems.length === 0) { setError('Vui lòng thêm sản phẩm!'); return; }
        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            if (!item.product) { setError(`Vui lòng chọn sản phẩm ở dòng ${i + 1}`); return; }
            if (item.qty <= 0) { setError(`Số lượng phải lớn hơn 0 ở dòng ${i + 1}`); return; }
        }
        if (!paymentMethod) { setError('Vui lòng chọn phương thức thanh toán!'); return; }

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
                Swal.fire({ icon: 'success', title: 'Cập nhật thành công', timer: 1500, showConfirmButton: false });
            } else {
                await createOrder(data);
                Swal.fire({ icon: 'success', title: 'Tạo thành công', timer: 1500, showConfirmButton: false });
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi lưu đơn hàng.' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
            <form className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative" onSubmit={handleSubmit}>
                <button type="button" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                <h2 className="text-2xl font-bold mb-4 text-center">{order ? 'Sửa' : 'Thêm'} Order</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}

                {/* User */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">User</label>
                    <select
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={userId}
                        onChange={(e) => { setUserId(e.target.value); setError(''); }}
                        required
                    >
                        <option value="">-- Chọn user --</option>
                        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
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
                                required
                            >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                {!products.find(p => p._id === item.product) && <option value={item.product}>{item.name}</option>}
                            </select>
                            <input
                                type="number"
                                min={1}
                                className="border p-2 w-20 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                            />
                            <button type="button" className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => removeItem(index)}>Xóa</button>
                        </div>
                    ))}
                    <button type="button" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={addItem}>
                        Thêm sản phẩm
                    </button>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Phương thức thanh toán</label>
                    <select
                        className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={paymentMethod}
                        onChange={(e) => { setPaymentMethod(e.target.value); setError(''); }}
                        required
                    >
                        <option value="">-- Chọn phương thức thanh toán --</option>
                        {paymentMethods.map(pm => <option key={pm._id} value={pm.name}>{pm.name}</option>)}
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

                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full">Lưu</button>
            </form>
        </div>
    );
};

export default OrderForm;
