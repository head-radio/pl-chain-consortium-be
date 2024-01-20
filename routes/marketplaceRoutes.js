const express = require('express');
const router = express.Router();
const {
    getNFTs,
    executeNFTCreation,
    executeNFTTransfer,
    getUserOperationOfNFTTransfer,
    executeUploadImage
} = require('../controller/marketplacesController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { isAuth } = require('../config/auth');

router.get('/marketplaces/NFTs', getNFTs)
router.post('/marketplaces/NFTs', isAuth, executeNFTCreation)
router.post('/marketplaces/NFTs/transfer', isAuth, executeNFTTransfer)
router.post('/marketplaces/NFTs/upload-image', isAuth, upload.array("files"), executeUploadImage)
router.get('/marketplaces/NFTs/:sessionId/user-operations/:userOperationHash', getUserOperationOfNFTTransfer)

module.exports = router;