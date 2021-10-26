const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'UsefulShit',
    allowedFormats:['jpg', 'jpeg', 'png', 'ico'],
    limits: {fileSize: 10 * 1000 * 1000, files: 5},
  },
  limits: {fileSize: 10 * 1000 * 1000, files: 5},
});

module.exports = {
    cloudinary,
    storage,
}
