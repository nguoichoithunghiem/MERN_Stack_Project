import React, { useEffect, useState } from 'react';
import { getTotalRevenue, getRevenueByDay, getRevenueByMonth } from '../../api/orderApi';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const RevenueView: React.FC = () => {
    const [total, setTotal] = useState(0);
    const [daily, setDaily] = useState<any[]>([]);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async (from?: string, to?: string) => {
        try {
            // Tổng doanh thu
            const totalData = await getTotalRevenue();
            setTotal(Number(totalData.totalRevenue) || 0);

            // Doanh thu theo ngày
            const dailyData = await getRevenueByDay(from, to);
            setDaily(
                dailyData.map((d) => ({
                    ...d,
                    dailyRevenue: Number(d.dailyRevenue) || 0,
                }))
            );

            // Doanh thu theo tháng
            const monthlyData = await getRevenueByMonth();
            // Chuẩn bị 12 tháng cố định
            const currentYear = new Date().getFullYear();
            const allMonths = Array.from({ length: 12 }, (_, i) => {
                const monthNum = i + 1;
                const mData = monthlyData.find((m) => m._id.month === monthNum);
                return {
                    monthLabel: `${currentYear}-${monthNum}`,
                    monthlyRevenue: mData ? Number(mData.monthlyRevenue) : 0,
                };
            });
            setMonthly(allMonths);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = () => {
        fetchData(startDate, endDate);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header + Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Thống kê doanh thu</h1>

                <div className="flex items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Từ ngày</label>
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Đến ngày</label>
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleFilter}
                    >
                        Lọc
                    </button>
                </div>
            </div>

            {/* Tổng doanh thu */}
            <div className="bg-white p-4 rounded shadow">
                <p className="text-lg">
                    Tổng doanh thu: <strong>{total.toLocaleString()} VND</strong>
                </p>
            </div>

            {/* Biểu đồ doanh thu theo ngày */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Doanh thu theo ngày</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={daily} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis
                            domain={[0, 30000000]}
                            tickCount={4}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                        />
                        <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} VND`} />
                        <Legend />
                        <Line type="monotone" dataKey="dailyRevenue" stroke="#8884d8" name="Doanh thu" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Biểu đồ doanh thu theo tháng */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Doanh thu theo tháng</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthly} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis
                            domain={[0, 30000000]}
                            tickCount={4}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                        />
                        <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} VND`} />
                        <Legend />
                        <Bar dataKey="monthlyRevenue" fill="#82ca9d" name="Doanh thu" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueView;
