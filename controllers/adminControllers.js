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
const sendDocumentRejectionEmail = require('../utils/sendDocumentRejectionEmail')


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



const adminDashboard = async (req, res, next) => { 
    const adminId = req.user
    const users = await User.find({ _id: { $ne: adminId } })

    const totalProperty = await Property.countDocuments();
    const totalUser = await User.countDocuments({ role: 'user' });
    const onlineUser = await User.countDocuments({onlineStatus: true})
    res.render('admin/index', {title: 'Dashboard', totalUser, totalProperty, onlineUser})
}

const createProductPage = async (req, res, next) => { 
    const propertys = await Property.find()

    res.render('admin/create', {title: 'Create Property', propertys, randomString1, randomString2})
}

const walletPage = async (req, res, next) => { 
    res.render('admin/wallet', { title: 'Bitcoin Wallet'}) 
}

const editProopertyPage = async (req, res, next) => { 
    const { property: propertyId } = req.query;
    const property = await Property.findById(propertyId);
    res.render('admin/edit', { title: 'Edit Property', property,})
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

    res.render('admin/users', {title: 'Users', users, randomString1, randomString2})
}

// chnage password page 
const changePasswordPage = async (req, res, next) => {
    res.render('admin/change-password', {title: 'Change password'})
}

// user detail page 
const userDetailPage = async (req, res, next) => {
    const {hostsletuser} = req.query
    const user = await User.findOne({ _id: hostsletuser });
    const doc = await UserDocument.findOne({ user: hostsletuser });
    const code = await Code.findOne({ user: hostsletuser });

    const property = await Property.findOne({ _id: user.reference })


    const deposits = await Transaction.find({ transactionType: 'Deposit', user: hostsletuser })
    const withdraws = await Transaction.find({transactionType: 'Withdrawal', user: hostsletuser})

    if (!user) {
        next(new ErrorResponse('User not found', 400))
        return
    }

    res.render('admin/user-detail', {title: 'user detail',property, user, doc, code, randomString1, randomString2, deposits, withdraws})
}

// fund user deposit 
const fundDepositPage = async (req, res, next) => {
    res.render('admin/fund-deposit', {title: 'Fund Deposit'})
}
// fund user profit 
const fundProfitPage = async (req, res, next) => {
    res.render('admin/fund-profit', {title: 'Fund Profit'})
}

// fund user bonus 
const fundBonusPage = async (req, res, next) => {
    res.render('admin/fund-bonus', {title: 'Fund Bonus'})
}



const createProperty = async (req, res, next) => { 
    const { pname, plocation, pdistance, pamount, guest, bedroom, bed, bath, rating, review, pcategory } = req.body

      
    if (!pname || !plocation || !pdistance || !pamount || !guest || !bed || !bath || !rating || !review || !pcategory) {
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
    const { pname, plocation, pamount, guest, bedroom, bed, bath, rating, review, pcategory } = req.body
    const { propertyId } = req.params

    if (!pname || !plocation || !pamount ||!bedroom || !guest || !bed || !bath || !rating || !review || !pcategory) {
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

const generateWithdrawalCode = async (req, res, next) => { 
    const { id } = req.params
    
    try {

        const code = await Code.findOne({ user: id })
        
        if (code) {
            await Code.deleteOne({ _id: code._id })
        }

        const withdrawalCode = Math.floor(Math.random() * 10000000000);

        const withdrawCode = await Code.create({
            user: id,
            code: withdrawalCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000) //30 minutes,
        })

        if (!withdrawCode) {
            throw new Error('withdrawaal code could not be created');
        }

        res.status(200).json({ success: true, message: withdrawCode.code})
        
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
        user.unitAmount = transaction.unitAmount
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
        user.profit = Number(user.profit) + Number(transaction.amount)
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
    const { id } = req.params

    const { checkins, checkindate, checkoutdate, status } = req.body
    
    try {
        const user = await User.findOne({_id : id});

        if(!user) {
            throw new Error('User not found')
        }

        const property = await Property.findOne({_id: user.reference});

        if(!property) {
            throw new Error('Property not found')
        }

        if (!checkins || !checkindate || !checkoutdate || !status) {
            throw new Error('All fields are required')
        }

        const checkin = await Checkins.create({
            user: user._id,
            name: property.pname,
            property: property._id,
            amount: property.pamount,
            location: property.plocation,
            checkins,
            checkindate,
            checkoutdate,
            status
        })

        if (!checkin) {
            next(new ErrorResponse('checkins failed to create, try again', 500))
        }

        res.status(200).json({success: true, message: checkins=="old checkins" ? 'Old Checkins created' : 'New Checkins created' , checkin})

    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
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
        userDocument.statusMessage = 'Approved'

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
    
    const user = await User.findOne({ _id: id });
    
    console.log(user)

    if (!user) {
        next(new ErrorResponse('this user does not exits', 400))
        return
    }
    
    try {

        const userDocument = await UserDocument.deleteOne({ user: id })
        
        if (!userDocument) {
            throw new Error('This user has not uploaded any document');
        }

        // userDocument.status = false;
        // userDocument.doc = {}
        // userDocument.statusMessage == 'Rejected'

        // const approvedDoc = await userDocument.save();

        // send user email after rejection 

        await sendDocumentRejectionEmail(user)
        
        res.status(200).json({success: true, message: 'Document has been rejected'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const changePassword = async (req, res, next) => {
    const { oldpassword, password1, password2 } = req.body;

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

const updateUserAccountStatus = async (req, res, next) => {
    const { id } = req.params;
    const { accountStatus } = req.body
    
    if (!accountStatus) {
        next(new ErrorResponse('account status is required', 400))
        return
    }

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            throw new Error('This user does not exist')
        }

        user.accountStatus = accountStatus;

        await user.save();

        res.status(200).json({success: true, message: 'account updated'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const blockUserAccount = async (req, res, next) => {
    const { id } = req.params

    try {
        const user = await User.findOne({ _id: id });

        console.log(user)

        if (!user) {
            throw new Error("This user does not exist");
        }

        user.block = !user.block;

        await user.save();

        res.status(200).json({success: true, message: user.block? 'user has been unblocked' : 'user has been blocked'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const activateUserWithdrawal = async (req, res, next) => {
     const { id } = req.params

    try {
        const user = await User.findOne({ _id: id });

        console.log(user)

        if (!user) {
            throw new Error("This user does not exist");
        }

        user.withDrawStatus = !user.withDrawStatus;

        await user.save();

        res.status(200).json({success: true, message: !user.withDrawStatus? 'withdrawal deactivated' : 'withdrawal activated'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const fundDeposit = async (req, res, next) => {
    const { amount, action} = req.body
    const { id } = req.params
    
    try {
        if (!amount || !action) {
           throw new Error("Please fill all field") 
        }

        const user = await User.findOne({ _id: id });

        if (!user) {
            throw new Error("user does not exits")
        }

        const currentBalance = user.deposit;
        let newBalance;

        if (action == 'increase') {
             newBalance = Number(user.deposit) + Number(amount); 
        }
        
         if (action == 'reduce') {
             newBalance = Number(user.deposit) - Number(amount); 
        }

        user.deposit = newBalance
        await user.save();

        console.log(amount, action)

        res.status(200).json(
            {
                success: true,
                message: action == "increase" ? "user deposit has been funded" : "user deposit has been reduced"
            })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const fundProfit = async (req, res, next) => {
    const { amount, action} = req.body
    const { id } = req.params
    
    try {
        if (!amount || !action) {
           throw new Error("Please fill all field") 
        }

        const user = await User.findOne({ _id: id });

        if (!user) {
            throw new Error("user does not exits")
        }

        const currentBalance = user.profit;
        let newBalance;

        if (action == 'increase') {
             newBalance = Number(user.profit) + Number(amount); 
        }
        
         if (action == 'reduce') {
             newBalance = Number(user.profit) - Number(amount); 
        }

        user.profit = newBalance
        await user.save();

        res.status(200).json(
            {
                success: true,
                message: action == "increase" ? "user profit has been funded" : "user profit has been reduced"
            })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const fundBonus = async (req, res, next) => {
    const { amount, action} = req.body
    const { id } = req.params
    
    try {
        if (!amount || !action) {
           throw new Error("Please fill all field") 
        }

        const user = await User.findOne({ _id: id });

        if (!user) {
            throw new Error("user does not exits")
        }

        const currentBalance = user.bonus;
        let newBalance;

        if (action == 'increase') {
             newBalance = Number(user.bonus) + Number(amount); 
        }
        
         if (action == 'reduce') {
             newBalance = Number(user.bonus) - Number(amount); 
        }

        user.bonus = newBalance
        await user.save();

        res.status(200).json(
            {
                success: true,
                message: action == "increase" ? "user bonus has been funded" : "user bonus has been reduced"
            })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const deleteUser = async (req, res, next) => {
    const { id } = req.params
    
    try {
        const user = await User.findOne({ _id: id })
        
        if (!user) {
            throw new Error("Oops! user not found")
        }

        const deleteOneUser = await User.deleteOne({ _id: user._id });

        if (!deleteOneUser) {
            throw new Error("user failed to delete, try again")
        }

        res.status(200).json({success: true, message: "user has been deleted!"})

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
    generateWithdrawalCode,
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
    changePasswordPage,
    userDetailPage,
    updateUserAccountStatus,
    blockUserAccount,
    activateUserWithdrawal,
    fundDepositPage,
    fundProfitPage,
    fundBonusPage,
    fundDeposit,
    fundProfit,
    fundBonus,
    deleteUser
}