const express = require('express');
const { homePage, mansionPage, luxePage, iconicPage, tropicalPage, islandPage, propertyDetails,loginPage,
signupPage } = require('../controllers/mainControllers')

const router = express.Router();


router.get('/', homePage)
router.get('/mansion', mansionPage)
router.get('/luxe', luxePage)
router.get('/iconic', iconicPage)
router.get('/tropical', tropicalPage)
router.get('/islands', islandPage);

router.get('/login', loginPage);
router.get('/signup', signupPage)

router.get('/rooms/property/details', propertyDetails)






module.exports = router