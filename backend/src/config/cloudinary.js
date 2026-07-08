const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
if (process.env.NODE_ENV === 'production') {
    cloudinary.api.ping()
        .then(() => console.log('✅ Cloudinary connected successfully'))
        .catch((err) => console.error('❌ Cloudinary connection failed:', err));
}

module.exports = cloudinary;