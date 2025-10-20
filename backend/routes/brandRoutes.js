import express from 'express';
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
} from '../controllers/brandController.js';

const router = express.Router();

router.get('/', getBrands);        // Lấy danh sách thương hiệu
router.post('/', createBrand);     // Thêm thương hiệu
router.put('/:id', updateBrand);   // Cập nhật thương hiệu
router.delete('/:id', deleteBrand); // Xóa thương hiệu

export default router;
