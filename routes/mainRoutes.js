const express = require('express');
const { homePage } = require('../controllers/mainControllers')

const router = express.Router();


router.get('/', homePage)






module.exports = router