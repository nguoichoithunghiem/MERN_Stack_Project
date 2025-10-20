import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    countInStock: { type: Number, default: 0 },
    categoryName: { type: String, required: true },  // Tên danh mục
    brandName: { type: String, required: true }       // Tên thương hiệu
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
