const Wallet = require('../models/walletModel');
const Property = require('../models/propertyModel');
const Review = require('../models/reviewModel');
const UserDocument = require('../models/documentModel')
const Code = require('../models/codeModel');
const Transaction = require('../models/transactionModel');
const Checkins = require('../models/checkinModel')
const User =require('../models/usersModel')
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
    const { property } = req.query
    const review = Review.find({propertyId: property})
    res.render('admin/review', { title: 'Add property review', review})
}

// reservation code page 
const reservationCodePage = async (req, res, next) => { 
    res.render('admin/code', { title: 'Reservation Code'})
}

// payment page 
const pagmentPage = async (req, res, next) => {
    const payment = await Transaction.find({transactionType: 'Deposit'})
    res.render('admin/payment', {title: 'Payment', payment})
}

// withdrawal page 
const withdrawalPage = async (req, res, next) => {
    const payment = await Transaction.find({transactionType: 'Withdrawal'})
    res.render('admin/withdraw', {title: 'withdraw', payment})
}

// new and old checkins page 
const checkinsPage = async (req, res, next) => {
    res.render('admin/checkins', {title: 'checkins'})
}

// users page 
const usersPage = async (req, res, next) => {
    const adminId = req.user
    const users = await User.find({ _id: { $ne: adminId } })

    res.render('admin/users', {title: 'Users', users})
}

// chnage password page 
const changePasswordPage = async (req, res, next) => {
    res.render('admin/change-password', {title: 'Change password'})
}




const createProperty = async (req, res, next) => { 
    const { pname, plocation, pdistance, pamount, hostname, guest, bedroom, bed, bath, rating, review, pcategory } = req.body

      
    if (!pname || !plocation || !pdistance || !pamount || !hostname || !guest || !bed || !bath || !rating || !review || !pcategory) {
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
            pdistance,
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
    const { address, wallettype } = req.body

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

        const filePromises = readFileAsync(req.file.path);
        const imageResults = await filePromises;


        const bitcoin = await Wallet.findOne({ walletAssets: 'bitcoin' });
        const etherum = await Wallet.findOne({ walletAssets: 'etherum' });

        
        if(wallettype === 'bitcoin') {
            // bitcoin wallet update starts here 
            if (bitcoin) {

                bitcoin.address = address;
                bitcoin.qrcode = imageResults

                const updatedWallet = await bitcoin.save();

                if (!updatedWallet) {
                    throw new Error('wallet address failed to update')
                }

                res.status(200).json({ success: true,  message: 'Payment details updated'})
            } else {
                const updatedWallet = await Wallet.create({
                    walletAssets: wallettype,
                    address,
                    qrcode:imageResults
                });

                if (!updatedWallet) {
                    throw new Error('wallet address failed to update')
                }

                res.status(200).json({ success: true,  message: 'Payment details updated'})
            }
            // bitcoin wallet update ends here
        } else if(wallettype === 'etherum') {

            // etherum wallet update starts here 
            if (etherum) {

                etherum.address = address;
                etherum.qrcode = imageResults

                const updatedWallet = await etherum.save();

                if (!updatedWallet) {
                    throw new Error('wallet address failed to update')
                }

                res.status(200).json({ success: true,  message: 'Payment details updated'})
            } else {
                const updatedWallet = await Wallet.create({
                    walletAssets: wallettype,
                    address,
                    qrcode:imageResults
                });

                if (!updatedWallet) {
                    throw new Error('wallet address failed to update')
                }

                res.status(200).json({ success: true,  message: 'Payment details updated'})
            }
            // etherum wallet update ends here
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
    const { review, name } = req.body
    const { propertyId } = req.params

    try {
        if (!review || !name) {
            throw new Error('Please all fields are required')
        }

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

        const filePromises = readFileAsync(req.file.path);
        const imageResults = await filePromises;

        const proverptyReview = await Review.create({
            propertyId: propertyId,
            name,
            review,
            photo: imageResults
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

const generateReservationCode = async (req, res, next) => { 
    const { email } = req.body
    
    try {

        const code = await Code.findOne({ userEmail: email })
        
        if (code) {
            await Code.deleteOne({ _id: code._id })
        }

        const reservationCode = Math.floor(Math.random()*10000000000)

        const bookCode = await Code.create({
            userEmail: email,
            code: reservationCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000) //30 minutes,
        })

        if (!bookCode) {
            throw new Error('reservation code could not be created');
        }

        res.status(200).json({ success: true, message: `Reservation code is: ${reservationCode}`})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const approvePayment = async (req, res, next) => {
    const { id } = req.params
    try {
        
        const transaction = await Transaction.findOne({ _id: id });
        const user = await User.findOne({ _id: transaction.user });

        transaction.status = true;
        user.host = true;
        await user.save();
        await transaction.save();

        res.status(200).json({success: true, message: 'payment approved'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}


const rejectPayment = async (req, res, next) => {
    const { id } = req.params
    try {
        
        const transaction = await Transaction.findOne({ _id: id });
        const user = await User.findOne({ _id: transaction.user });

        transaction.status = false;
        transaction.statusMessage = "Rejected";
        user.host = false;
        await user.save();
        await transaction.save();

        res.status(200).json({success: true, message: 'payment reject'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const approveWithdrawal = async (req, res, next) => {
    const { id } = req.params
    try {
        const transaction = await Transaction.findOne({ _id: id });
        if (!transaction) {
            throw new Error('No transaction was found')
        }
        transaction.status = true
        const withdrawUpdate = await transaction.save();

        if (!withdrawUpdate) {
            next(new ErrorResponse('withdrawal has failed to update', 500))
            return
        }

        res.status(200).json({success: true, message: 'withdrawal has been approved'})
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const rejectWithdrawal = async (req, res, next) => {
    const { id } = req.params
    try {
        const transaction = await Transaction.findOne({ _id: id });
        if (!transaction) {
            throw new Error('No transaction was found')
        }
        transaction.status = false
        transaction.statusMessage = 'Rejected'
        const withdrawUpdate = await transaction.save();

        console.log(transaction)

        if (!withdrawUpdate) {
            next(new ErrorResponse('withdrawal has failed to update', 500))
            return
        }

        res.status(200).json({success: true, message: 'withdrawal has been approved'})
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const checkins = async (req, res, next) => {
    const { name, checkins, location, city, amount, date, status } = req.body
    
    try {
        if (!name || !checkins || !location || !city || !amount || !date || !status) {
            throw new Error('All fields are required')
        }

        const checkin = await Checkins.create({
            name,
            checkins,
            location,
            city,
            amount,
            date,
            status
        })

        if (!checkin) {
            next(new ErrorResponse('checkins failed to create, try again', 500))
        }

        res.status(200).json({success: true, message: 'Checkins created', checkin})

    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
    
    console.log(req.body)
}

const viewUserDocument = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const userDocument = await UserDocument.findOne({ user: id })
        
        if (!userDocument) {
            throw new Error('this user have not uploaded any document yet');
        }

        res.status(200).json({success: true, message: 'Successful', userDocument})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const approveDocument = async (req, res, next) => {
    const { id } = req.params
    
    try {

        const userDocument = await UserDocument.findOne({ user: id })
        
        if (!userDocument) {
            throw new Error('This user has not uploaded any document');
        }

        userDocument.status = true;

        const approvedDoc = await userDocument.save();

        if (!approvedDoc) {
            throw new Error('document failed to be verified');
        }
        
        res.status(200).json({success: true, message: 'Document has been verified'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const rejectDocument = async (req, res, next) => {
   const { id } = req.params
    
    try {

        const userDocument = await UserDocument.findOne({ user: id })
        
        if (!userDocument) {
            throw new Error('This user has not uploaded any document');
        }

        userDocument.status = false;

        const approvedDoc = await userDocument.save();

        if (!approvedDoc) {
            throw new Error('document failed to be rejected');
        }
        
        res.status(200).json({success: true, message: 'Document has been rejected'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const changePassword = async (req, res, next) => {
    const { oldpassword, password1, password2 } = req.body;

    console.log(password2)

    // check for empty field 
    if (!oldpassword || !password1 || !password2) {
        next(new ErrorResponse("All fields are required", 400))
        return
    }

    if (password1.length < 6) {
        next(new ErrorResponse("password must be atleast 6 character long,", 400))
        return
    }

    // check if password matches 
    if (password1 !== password2) {
        next(new ErrorResponse("Password does not match"))
        return
    }

    try {

        const user = await User.findOne({ _id: req.user });

        if (!user) {
            throw new Error("user not found")
        }

        // check if old password is correct 
        if (oldpassword != user.password) {
            throw new Error("old password is not correct")
        }

        user.password = password1;

        await user.save();

        res.status(200).json({success: true, message: 'Password has been changed successfully'})
 
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
    deleteProperty,
    reservationCodePage,
    generateReservationCode,
    pagmentPage,
    approvePayment,
    rejectPayment,
    withdrawalPage,
    approveWithdrawal,
    rejectWithdrawal,
    checkinsPage,
    checkins,
    usersPage,
    viewUserDocument,
    approveDocument,
    rejectDocument,
    changePassword,
    changePasswordPage
}