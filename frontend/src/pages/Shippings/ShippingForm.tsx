import React, { useEffect, useState } from "react";
import { createShipping, getShippingById, updateShipping } from "../../api/shippingApi";
import { getOrders } from "../../api/orderApi";
import type { Shipping, Order } from "../../types";
import Swal from "sweetalert2";

interface ShippingFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    shippingId?: string;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ isOpen, onClose, onSuccess, shippingId }) => {
    const [formData, setFormData] = useState<Partial<Shipping>>({
        order: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        shippingStatus: "Pending",
    });

    const [orders, setOrders] = useState<Order[]>([]); // ✅ Lưu danh sách đơn hàng
    const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

    // ✅ Lấy danh sách đơn hàng
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data.orders);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng:", error);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

    // ✅ Lấy dữ liệu khi sửa
    useEffect(() => {
        if (shippingId) {
            getShippingById(shippingId).then((data) => {
                setFormData({
                    order: typeof data.order === "string" ? data.order : data.order?._id || "",
                    address: data.address || "",
                    city: data.city || "",
                    postalCode: data.postalCode || "",
                    country: data.country || "",
                    shippingStatus: data.shippingStatus || "Pending",
                });
            });
        } else {
            setFormData({
                order: "",
                address: "",
                city: "",
                postalCode: "",
                country: "",
                shippingStatus: "Pending",
            });
        }
    }, [shippingId]);

    // ✅ Thay đổi input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (shippingId) {
                await updateShipping(shippingId, formData);
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    text: 'Thông tin shipping đã được cập nhật.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await createShipping(formData);
                await Swal.fire({
                    icon: 'success',
                    title: 'Tạo thành công',
                    text: 'Thông tin shipping mới đã được tạo.',
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
                text: 'Có lỗi xảy ra khi lưu thông tin shipping.'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">
                    {shippingId ? "Cập nhật giao hàng" : "Thêm giao hàng"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* ✅ Dropdown chọn đơn hàng */}
                    <label className="block font-medium text-gray-700">Mã đơn hàng</label>
                    <select
                        name="order"
                        value={typeof formData.order === "string" ? formData.order : formData.order?._id || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                        required
                    >
                        <option value="">{loadingOrders ? "Đang tải..." : "-- Chọn đơn hàng --"}</option>
                        {orders.map((order) => (
                            <option key={order._id} value={order._id}>
                                {order._id} - {order.userName} ({order.totalPrice}₫)
                            </option>
                        ))}
                    </select>

                    <input
                        name="address"
                        placeholder="Địa chỉ"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                        required
                    />
                    <input
                        name="city"
                        placeholder="Thành phố"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                        required
                    />
                    <input
                        name="postalCode"
                        placeholder="Mã bưu điện"
                        value={formData.postalCode || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                    />
                    <input
                        name="country"
                        placeholder="Quốc gia"
                        value={formData.country || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                    />

                    <select
                        name="shippingStatus"
                        value={formData.shippingStatus}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                    >
                        <option value="Pending">Đang chờ</option>
                        <option value="Shipping">Đang giao</option>
                        <option value="Delivered">Đã giao</option>
                    </select>

                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded mr-2"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {shippingId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShippingForm;
