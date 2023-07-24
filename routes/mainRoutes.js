const express = require('express');
const { homePage, mansionPage, luxePage, iconicPage, tropicalPage, islandPage, propertyDetails,loginPage,
signupPage } = require('../controllers/mainControllers');

const generalAuth = require('../middleware/generalAuth');

const router = express.Router();


router.get('/', generalAuth, homePage)
router.get('/mansion', generalAuth, mansionPage)
router.get('/luxe', generalAuth, luxePage)
router.get('/iconic', generalAuth, iconicPage)
router.get('/tropical', generalAuth, tropicalPage)
router.get('/islands', generalAuth, islandPage);

router.get('/login', loginPage);
router.get('/signup', signupPage)

router.get('/rooms/property/details', generalAuth, propertyDetails)






module.exports = router