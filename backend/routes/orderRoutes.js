import express from 'express';
import {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getTotalRevenue,
    getRevenueByDay,
    getRevenueByMonth
} from '../controllers/orderController.js';

const router = express.Router();

// CRUD đơn hàng
router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// Thống kê doanh thu
router.get('/revenue/total', getTotalRevenue);
router.get('/revenue/daily', getRevenueByDay);
router.get('/revenue/monthly', getRevenueByMonth);

export default router;
