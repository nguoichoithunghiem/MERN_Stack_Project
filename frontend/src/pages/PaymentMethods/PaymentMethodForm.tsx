import React, { useEffect, useState } from "react";
import {
    createPaymentMethod,
    getPaymentMethodById,
    updatePaymentMethod,
} from "../../api/paymentMethodApi";
import Swal from "sweetalert2";

interface PaymentMethodFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    paymentMethodId?: string;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    paymentMethodId,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        if (paymentMethodId) {
            getPaymentMethodById(paymentMethodId).then((data) => {
                setFormData({
                    name: data.name || "",
                    description: data.description || "",
                });
            });
        } else {
            setFormData({
                name: "",
                description: "",
            });
        }
    }, [paymentMethodId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (paymentMethodId) {
                await updatePaymentMethod(paymentMethodId, formData);
            } else {
                await createPaymentMethod(formData);
            }

            onSuccess(); // reload dữ liệu
            onClose();   // đóng modal trước

            // 🔹 Hiển thị thông báo sau khi modal đã đóng
            await Swal.fire({
                icon: 'success',
                title: paymentMethodId ? 'Cập nhật thành công' : 'Tạo thành công',
                text: paymentMethodId
                    ? 'Phương thức thanh toán đã được cập nhật.'
                    : 'Phương thức thanh toán mới đã được tạo.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu phương thức thanh toán.'
            });
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">
                    {paymentMethodId ? "Cập nhật phương thức thanh toán" : "Thêm phương thức thanh toán"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        name="name"
                        placeholder="Tên phương thức"
                        value={formData.name}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Mô tả"
                        value={formData.description}
                        onChange={handleChange}
                        className="border w-full px-3 py-2 rounded"
                        rows={3}
                    />

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
                            {paymentMethodId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentMethodForm;
