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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
    const [error, setError] = useState<string>(""); // state hiển thị lỗi

    // Lấy danh sách đơn hàng
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

    // Lấy dữ liệu khi sửa
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
        setError("");
    }, [shippingId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(""); // reset lỗi khi user nhập
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🔹 Validate tất cả các trường bắt buộc
        if (!formData.order) {
            setError("Vui lòng chọn đơn hàng!");
            return;
        }
        if (!formData.address || !formData.address.trim()) {
            setError("Vui lòng nhập địa chỉ!");
            return;
        }
        if (!formData.city || !formData.city.trim()) {
            setError("Vui lòng nhập thành phố!");
            return;
        }
        if (!formData.postalCode || !formData.postalCode.trim()) {
            setError("Vui lòng nhập mã bưu điện!");
            return;
        }
        if (!formData.country || !formData.country.trim()) {
            setError("Vui lòng nhập quốc gia!");
            return;
        }

        try {
            if (shippingId) {
                await updateShipping(shippingId, formData);
            } else {
                await createShipping(formData);
            }

            onSuccess(); // gọi callback load lại dữ liệu
            onClose();   // đóng modal trước

            // 🔹 Hiển thị thông báo sau khi modal đã đóng
            await Swal.fire({
                icon: 'success',
                title: shippingId ? 'Cập nhật thành công' : 'Tạo thành công',
                text: shippingId
                    ? 'Thông tin shipping đã được cập nhật.'
                    : 'Thông tin shipping mới đã được tạo.',
                timer: 1500,
                showConfirmButton: false,
            });

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">
                    {shippingId ? "Cập nhật giao hàng" : "Thêm giao hàng"}
                </h2>

                {/* Hiển thị lỗi */}
                {error && <p className="text-red-500 mb-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <label className="block font-medium text-gray-700">Mã đơn hàng</label>
                    <select
                        name="order"
                        value={typeof formData.order === "string" ? formData.order : formData.order?._id || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
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
                    />
                    <input
                        name="city"
                        placeholder="Thành phố"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
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
