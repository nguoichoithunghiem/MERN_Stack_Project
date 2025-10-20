import React, { useRef } from "react";
import type { Order } from "../../types";
import { X } from "lucide-react";

interface OrderDetailModalProps {
    order: Order | null;
    onClose: () => void;
}

const OrderDetail: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;

        const printContents = printRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // reload để React render lại
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={22} />
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    Chi tiết đơn hàng
                </h2>

                <div className="flex justify-end">
                    {/* Nút in */}
                    <button
                        onClick={handlePrint}
                        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        In đơn hàng
                    </button>
                </div>

                {/* Nội dung in */}
                <div ref={printRef}>
                    <div className="mb-4">
                        <p><strong>Mã đơn hàng:</strong> {order._id}</p>
                        <p><strong>Khách hàng:</strong> {order.userName}</p>
                        <p>
                            <strong>Ngày đặt:</strong>{" "}
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Chưa có'}
                        </p>
                        <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === "Booking Successful"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {order.status}
                            </span>
                        </p>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-700">
                        Sản phẩm trong đơn
                    </h3>
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                                <th className="px-4 py-2 text-right">Số lượng</th>
                                <th className="px-4 py-2 text-right">Giá (đ)</th>
                                <th className="px-4 py-2 text-right">Thành tiền (đ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2 text-right">{item.qty}</td>
                                    <td className="px-4 py-2 text-right">
                                        {item.price.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {(item.qty * item.price).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-right mt-4">
                        <p className="text-lg font-semibold text-gray-800">
                            Tổng cộng:{" "}
                            <span className="text-blue-600">
                                {order.totalPrice.toLocaleString()} đ
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
