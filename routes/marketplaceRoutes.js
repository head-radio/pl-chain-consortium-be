const express = require('express');
const router = express.Router();
const {
    getNFTs
} = require('../controller/marketplacesController');

const { isAuth } = require('../config/auth');

router.get('/marketplaces/NFTs', getNFTs)


module.exports = router;