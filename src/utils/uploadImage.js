// const multer = require('multer');
// const { MulterAzureStorage } = require('multer-azure-blob-storage');
// require('dotenv').config();
// const path = require('path');

// const resolveBlobName = (req, file) => {
//     return new Promise((resolve, reject) => {
//         const ext = path.extname(file.originalname);
//         const blobName = `daily-routine-proving/${path.basename(file.originalname, ext) + Date.now() + ext}`;
//         req.filename = blobName;
//         resolve(blobName);
//     });
// };

// const azureStorage = new MulterAzureStorage({
//     connectionString: process.env.SA_CONNECTION_STRING,
//     containerName: process.env.SA_CONTAINER_NAME,
//     blobName: resolveBlobName,
//     containerAccessLevel: 'blob',
// });

// const upload = multer({
//     storage: azureStorage,
//     limits: { fileSize: 1024 * 1024 * 10 }, // 10MB 제한
// });

// module.exports = upload;


const multer = require('multer');
const { MulterAzureStorage } = require('multer-azure-blob-storage');
require('dotenv').config();
const path = require('path');

const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(file.originalname);
        const blobName = `daily-routine-proving/${path.basename(file.originalname, ext) + Date.now() + ext}`;
        req.filename = blobName;
        resolve(blobName);
    });
};

const azureStorage = new MulterAzureStorage({
    connectionString: process.env.SA_CONNECTION_STRING,
    containerName: process.env.SA_CONTAINER_NAME,
    blobName: resolveBlobName,
    containerAccessLevel: 'blob',
});

const upload = multer({
    storage: azureStorage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB 제한
});

module.exports = upload;
