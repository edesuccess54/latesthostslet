const express = require('express');
const { adminDashboard, createProductPage, createProduct } = require('../controllers/adminControllers');
const upload = require('../utils/fileUpload.js')

const router = express.Router();


router.get('/dashboard', adminDashboard);
router.get('/create', createProductPage);


router.post('/create', (req, res, next) => {
    console.log('fuck shit')
    next();
}, upload.array('images'), createProduct);






module.exports = router