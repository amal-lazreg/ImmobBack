const multer = require('multer');
const path = require('path');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:\\Users\\lazre\\Desktop\\stage\\frontend\\src\\assets\\img');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
