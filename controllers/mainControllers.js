const ErrorResponse = require('../utils/errorResponse');
const Property = require('../models/propertyModel');
const Review = require('../models/reviewModel');


function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
    }

    const randomString1 = generateRandomString(26);
    const randomString2 = generateRandomString(40);



const homePage = async (req, res, next) => {
    const property = await Property.find({pcategory: 'omg'});

    res.render('index', {title: 'omg', property, randomString1,randomString2})
}

const mansionPage = async (req, res, next) => {
    const property = await Property.find({pcategory: 'omg'});
    res.render('mansion', {title: 'mansion', property, randomString1,randomString2})
}

const luxePage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'luxe' });
    res.render('luxe', {title: 'luxe', property, randomString1,randomString2})
}

const iconicPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'iconic' });
    res.render('iconic', {title: 'iconic-city', property, randomString1,randomString2})
}

const tropicalPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'tropical' });
    res.render('tropical', {title: 'tropical', property, randomString1,randomString2})
}

const islandPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'island' });
    res.render('island', {title: 'island', property, randomString1,randomString2})
}

const propertyDetails = async (req, res, next) => {

    const { propertyId } = req.query

    try {
        const property = await Property.findOne({ _id: propertyId });
        const reviews = await Review.find({ propertyId: propertyId });

        if (!property) {
            throw new Error('Property not found')
        }
        res.render('rooms', { title: 'Property Details', property, reviews });
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}



module.exports = {
    homePage,
    mansionPage, 
    luxePage, 
    iconicPage, 
    tropicalPage, 
    islandPage,
    propertyDetails
}