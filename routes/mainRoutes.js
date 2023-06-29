const express = require('express');
const { homePage, mansionPage, luxePage, iconicPage, tropicalPage, islandPage, propertyDetails } = require('../controllers/mainControllers')

const router = express.Router();


router.get('/', homePage)
router.get('/mansion', mansionPage)
router.get('/luxe', luxePage)
router.get('/iconic', iconicPage)
router.get('/tropical', tropicalPage)
router.get('/islands', islandPage)

router.get('/rooms/property/details/:id', propertyDetails)






module.exports = router