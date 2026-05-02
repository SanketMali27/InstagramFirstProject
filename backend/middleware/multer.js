import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only image and video uploads are allowed'));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter
});

export default upload;
