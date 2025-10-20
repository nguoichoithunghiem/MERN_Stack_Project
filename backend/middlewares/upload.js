import multer from 'multer';
import path from 'path';

// Lưu file vào folder 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // lưu vào folder uploads
    },
    filename: (req, file, cb) => {
        // đặt tên file: timestamp + tên gốc
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Chỉ nhận file ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ cho phép file ảnh'), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
