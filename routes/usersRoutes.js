const express = require('express');
const { userRegisteration, loginUser, logoutUser } = require('../controllers/usersControllers')

const router = express.Router();


router.post('/signup', userRegisteration);
router.post('/login', loginUser);
router.get('/logout', logoutUser);






module.exports = router