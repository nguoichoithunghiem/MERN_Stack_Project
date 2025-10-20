import express from 'express';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);        // Lấy danh sách danh mục
router.post('/', createCategory);      // Thêm danh mục
router.put('/:id', updateCategory);    // Cập nhật danh mục
router.delete('/:id', deleteCategory); // Xóa danh mục

export default router;
