
const homePage = async (req, res, next) => {
    
    res.render('index', {title: 'omg'})
}

const mansionPage = async (req, res, next) => {
    res.render('mansion', {title: 'mansion'})
}

const luxePage = async (req, res, next) => {
    res.render('luxe', {title: 'luxe'})
}

const iconicPage = async (req, res, next) => {
    res.render('iconic', {title: 'iconic-city'})
}

const tropicalPage = async (req, res, next) => {
    res.render('tropical', {title: 'tropical'})
}

const islandPage = async (req, res, next) => {
    res.render('island', {title: 'island'})
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