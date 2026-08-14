const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { loginUser, getMe, updateProfile, uploadLogo } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `hotel-logo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-logo', protect, upload.single('logo'), uploadLogo);

module.exports = router;
