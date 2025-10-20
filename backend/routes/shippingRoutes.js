import express from 'express';
import {
    getShippings,
    getShippingById,
    createShipping,
    updateShipping,
    deleteShipping
} from '../controllers/shippingController.js';

const router = express.Router();

router.get('/', getShippings);
router.get('/:id', getShippingById);
router.post('/', createShipping);
router.put('/:id', updateShipping);
router.delete('/:id', deleteShipping);

export default router;
