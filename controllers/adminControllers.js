const Wallet = require('../models/walletModel');
const Property = require('../models/propertyModel');
const Review = require('../models/reviewModel');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('cloudinary').v2
const fs = require('fs');

const adminDashboard = async (req, res, next) => { 
    const property = await Property.find();
    res.render('admin/index', {title: 'Dashboard', property})
}

const createProductPage = (req, res, next) => { 
    res.render('admin/create', {title: 'Create Property'})
}

const walletPage = async (req, res, next) => { 
    res.render('admin/wallet', { title: 'Bitcoin Wallet'}) 
}

const editProopertyPage = async (req, res, next) => { 
    const { property: propertyId } = req.query;
    const property = await Property.findById(propertyId);
    res.render('admin/editproperty', { title: 'Edit Property', property })
}

const propertyReviewPage = async (req, res, next) => { 
    res.render('admin/review', { title: 'Add property review',})
}




const createProperty = async (req, res, next) => { 
    const { pname, plocation, pamount, hostname, guest, bedroom, bed, bath, rating, review, pcategory } = req.body

    if (!pname || !plocation || !pamount || !hostname || !guest || !bed || !bath || !rating || !review || !pcategory) {
        next(new ErrorResponse('please fill all field', 400))
        return
    }

    if (!req.files) {
        next(new ErrorResponse('No file was uploaded', 400))
        return
    }

    let images = [];
// Create a helper function to read a file and return a promise
    function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
        if (err) {
            console.error(err);
            reject(new ErrorResponse('Error reading image file', 500));
            return;
        }

        const base64String = Buffer.from(data).toString('base64');
        const fileData = {
            url: base64String
        };

        resolve(fileData);
        });
    });
    } 

    try {

        const filePromises = req.files.map(file => readFileAsync(file.path));
        const imageResults = await Promise.all(filePromises);

        images.push(...imageResults);
        
        const creadedProperty = await Property.create({
            pname,
            plocation,
            pamount,
            hostname,
            guest,
            bedroom,
            bed,
            bath,
            rating,
            review,
            pcategory,
            pimages: images
        })

        if (!creadedProperty) {
            throw new ErrorResponse('property could not be created', 400)
        }

        res.status(201).json({success: true, message: "Property successfully created", creadedProperty})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const updatePaymentDetail = async (req, res, next) => { 
    const { address } = req.body

    // check is address is empty 
    if (!address) {
        next(new ErrorResponse('wallet address is required', 400)) 
        return
    }

    if (!req.file) {
        next(new ErrorResponse('No file is uploaded', 400))
        return
    }

    try {
        let fileData = {}

        let uploadedFile = await cloudinary.uploader.upload(req.file.path, { folder: "hostpro", resource_type: "image" })
        
        if (!uploadedFile) {
            next(new ErrorResponse("image could not be uploaded", 500));
            return
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
        }

        const wallet = await Wallet.findOne();

        if (wallet) {

            wallet.address = address;
            wallet.qrcode = fileData

            const updatedWallet = await wallet.save();

            if (!updatedWallet) {
                throw new Error('wallet address failed to update')
            }

            res.status(200).json({ success: true,  message: 'Payment details updated'})
        } else {
            const updatedWallet = await Wallet.create({
                 address,
                qrcode:fileData
            });

            if (!updatedWallet) {
                throw new Error('wallet address failed to update')
            }

            res.status(200).json({ success: true,  message: 'Payment details updated'})
        }


    } catch (error) {
        next(new ErrorResponse(error.message, 400)) 
        return
    }
}

const editProopertyDetail = async (req, res, next) => { 
    const { pname, plocation, pamount, hostname, guest, bedroom, bed, bath, rating, review, pcategory } = req.body
    const { propertyId } = req.params

    if (!pname || !plocation || !pamount || !hostname || !guest || !bed || !bath || !rating || !review || !pcategory) {
        next(new ErrorResponse('please fill all field', 400))
        return
    }

    let images = []

    if (req.files) {

        for (let i = 0; i < req.files.length; i++){
            let fileData = {}

            let uploadedFile = await cloudinary.uploader.upload(req.files[i].path, { folder: "hostpro", resource_type: "image" })

            if (!uploadedFile) {
                next(new ErrorResponse("image could not be uploaded", 500));
                return
            }

            fileData = {
                fileName: req.files[i].originalname,
                filePath: uploadedFile.secure_url,
                fileType: req.files[i].mimetype,
                fileSize: req.files[i].size,
            }
            images.push(fileData)
        }
    }

    try {
        const property = await Property.findOne({ _id: propertyId })
        
        if (!property) {
            throw new ErrorResponse('property not found')
        }

        const { pname, plocation, pamount, hostname, guest, bedroom, bed, bath, rating, review, pcategory, pimages } = property

        property.pname = req.body.pname || pname
        property.plocation = req.body.plocation || plocation
        property.pamount = req.body.pamount || pamount
        property.hostname = req.body.hostname || hostname
        property.guest = req.body.guest || guest
        property.bedroom = req.body.bedroom || bedroom
        property.bed = req.body.bed || bed
        property.bath = req.body.bath || bath
        property.rating = req.body.rating || rating
        property.review = req.body.review || review
        property.pcategory = req.body.pcategory || pcategory
        property.pimages = images.length > 0 ? images : pimages

        const newProperty = await property.save()

        if (!newProperty) { 
            throw new Error('Property update failed')
        }

        console.log(newProperty)

        res.status(200).json({success: true, message: 'Property has been updated', newProperty})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }

    console.log(req.body)
}

const addPropertyReview = async (req, res, next) => {
    const { review } = req.body
    const { propertyId } = req.params

    try {
        if (!review) {
            throw new Error('Please provide a property review')
        }

        let fileData;

        let uploadedPhoto = await cloudinary.uploader.upload(req.file.path, { folder: "hostpro", resource_type: "image" })

        if (!uploadedPhoto) {
            next(new ErrorResponse('photo upload failed', 500))
            return
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedPhoto.secure_url,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
        }

        const proverptyReview = await Review.create({
            propertyId: propertyId,
            review: review,
            photo: fileData
        })

        if (!proverptyReview) {
            throw new Error('Property review could not be created')
        }

        res.status(200).json({success: true, message: 'Property review has been added'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }

    
}

const deleteProperty = async (req, res, next) => { 
    const { propertyId } = req.params
    
    try {
        const property = await Property.findOne({ _id: propertyId })
        if (!property) { 
            throw new Error('this property does not exist');
        }

        const deletedProperty = await Property.deleteOne({ _id: property._id });

        if (!deletedProperty) {
            throw new Error('property could not be deleted');
        }

        res.status(200).json({ success: true, message: 'Property has been deleted successfully'})
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}









module.exports = {
    adminDashboard,
    createProductPage,
    createProperty,
    walletPage,
    updatePaymentDetail,
    editProopertyPage,
    editProopertyDetail,
    propertyReviewPage,
    addPropertyReview,
    deleteProperty
}