const Property = require('../models/propertyModel');


const homePage = async (req, res, next) => {
    const property = await Property.find({pcategory: 'omg'});
    // const property = [{pamount: '2000'}]

    res.render('index', {title: 'omg', property})
}

const mansionPage = async (req, res, next) => {
    res.render('mansion', {title: 'mansion'})
}

const luxePage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'luxe' });
    res.render('luxe', {title: 'luxe', property})
}

const iconicPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'iconic' });
    res.render('iconic', {title: 'iconic-city', property})
}

const tropicalPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'tropical' });
    res.render('tropical', {title: 'tropical', property})
}

const islandPage = async (req, res, next) => {
    const property = await Property.find({ pcategory: 'island' });
    res.render('island', {title: 'island', property})
}

const propertyDetails = async (req, res, next) => {

    res.render('rooms', {title: 'Property Details'})
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