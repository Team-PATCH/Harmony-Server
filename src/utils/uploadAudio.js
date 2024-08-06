// src/utils/uploadAudio.js


// const multer = require('multer');
// const { MulterAzureStorage } = require('multer-azure-blob-storage');
// require('dotenv').config();
// const path = require('path');

// const resolveBlobName = (req, file) => {
//     return new Promise((resolve, reject) => {
//         const ext = path.extname(file.originalname);
//         const blobName = `audio/${path.basename(file.originalname, ext)}_${Date.now()}${ext}`;
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


// src/utils/uploadAudio.js

const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const connectionString = process.env.SA_CONNECTION_STRING;
const containerName = process.env.SA_CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

const uploadAudio = async (file) => {
  const blobName = `audio/${path.basename(file.originalname, path.extname(file.originalname))}_${Date.now()}${path.extname(file.originalname)}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  const uploadOptions = {
    bufferSize: 4 * 1024 * 1024,
    maxBuffers: 20,
  };

  await blockBlobClient.uploadData(file.buffer, uploadOptions);
  
  return blockBlobClient.url;
};

module.exports = {
  uploadAudio
};