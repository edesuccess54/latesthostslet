const User = require('../models/usersModel');
const Code = require('../models/codeModel');
const Transaction = require('../models/transactionModel');
const ErrorResponse = require('../utils/errorResponse');
const UserDocument = require('../models/documentModel');
const Property = require('../models/propertyModel');
const Checkins = require('../models/checkinModel')
const Wallet = require('../models/walletModel');
const Token = require('../models/tokenModel');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const fs = require('fs');
const getIP = require('ipware')().get_ip;
const sendEmail = require('../utils/sendEmail');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendAdminEmailWhenUserRegister = require('../utils/sendAdminEmailWhenUserRegister')
const crypto = require('crypto');
const mongoose = require('mongoose');
const { registered } = require('fontawesome');


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

const generateToken = async (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

// current daytime 
let currentdate = new Date(); 

let datetime = `${currentdate.getDate()}/${(currentdate.getMonth() + 1)}/${currentdate.getFullYear()} ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;


// useer dashboard page 
const userDashboardPage = async (req, res, next) => {

    const { user } = req;
    
    res.render('user/dashboard', {user})
}

// personal info page 
const personalInfoPage = async (req, res, next) => { 
    const { user } = req;
    const doc = await UserDocument.findOne({ user: user._id })
    
    console.log(doc)

    res.render('user/personal-info', {user, doc})
}

// account page 
const accountPage = (req, res, next) => {
    res.render('user/account')
}

// profile page 
const profilePage = async (req, res, next) => {
    const user = req.user

    const property = await Property.findOne({_id: user.reference})
    res.render('user/profile', {user, property, randomString1, randomString2})
}

// change property page 
const changePropertyPage = async (req, res, next) => {
    const user = req.user

    // const property = await Property.findOne({_id: user.reference})
    res.render('user/change-user-property', {user})
}

// help page 
const helpPage = (req, res, next) => { 
    res.render('user/help-center')
}

// how it works page 
const howItWorksPage = (req, res, next) => { 
    res.render('user/how-it-works')
}

const tripspage = (req, res, next) => {
    res.render('user/trips')
}

// payment page 
const paymentPage = async (req, res, next) => { 
    const wallets = await Wallet.find();

    res.render('user/payment', {wallets})
}

// widthdrawal page
const withdrawalPage = (req, res, next) => {
    const user = req.user
    res.render('user/withdraw', {user})
}

// transactions page 
const transactionPage = async (req, res, next) => {
    const user = req.user
    const transactions = await Transaction.find({ user: user._id })
    
    res.render('user/transaction', {transactions})
}

// checkins page 
const oldCheckinsPage = async (req, res, next) => {
    const user = req.user

    const checkins = await Checkins.find({user: user._id, checkins: "old checkins"});

    res.render('user/old-checkins', {checkins})
}

const newCheckinsPage = async (req, res, next) => {
    const user = req.user

    const checkins = await Checkins.find({user: user._id, checkins: "new checkins"});

    res.render('user/new-checkins', {checkins})
}

// email verification page 
const emailVerificationPage = async (req, res, next) => {

    const { verificationToken } = req.query

    // hash token then compare token in the database 
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

        // find token in db 
        const emailVerificationToken = await Token.findOne({
            token: hashedToken,
            expiresAt: {$gt: Date.now()}
        })

        if(!emailVerificationToken) {
            next(new ErrorResponse("Invalid or expired token", 400))
            return
        }

        const user = await User.findOne({_id: emailVerificationToken.user})

        user.emailveirify = true 
       
        await user.save()

    
    res.render('user/email-verification', {emailVerificationToken})
}

// function to update user name 
const updateName = async (req, res, next) => { 
    const {_id: authUser} = req.user
    const { firstname, lastname } = req.body;

    try {

        if (!firstname || !lastname) {
            throw new Error('Please enter firstname and lastname');
        }

        const user = await User.findOne({ _id: authUser });

        if (!user) {
            throw new Error('User not found');
        }

        user.firstname = firstname;
        user.lastname = lastname;

        await user.save();

        res.status(200).json({success: true, message: 'informtion has been updated',  user});
        
    } catch (error) {
        next(new ErrorResponse(error.message, error.code))
        return
    }
}

// functionto execute transaction 
const payment = async (req, res, next) => {
    const {unit, amount, method } = req.body
    const { _id, reference } = req.user
    const user = req.user
    
    try {
        if (!amount || !method || !unit) {
            throw new Error('All fields are required');
        }

        if (!req.file) {
            throw new Error('No file was provided');
        }

        if (user.accountStatus == 'suspended') {
            throw new Error('Your account is suspended')
        }

        if (user.accountStatus == 'closed') {
            throw new Error('Your account is closed')
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

        const payment = await Transaction.create({
            user: _id,
            propertyReference: reference,
            unitAmount: unit,
            amount: amount,
            method: method,
            proof: imageResults.url,
            datetime 
        })

        if(!payment) {
            next(new ErrorResponse('payment upload failed', 500))
            return
        }

        res.json({success: true, message: 'Payment in process', payment})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

// change user dp 
const changedp = async (req, res, next) => {
    const user = req.user
    try {
        if (!req.file) {
            throw new Error('No file was provided');
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

        user.picture =  imageResults

        const pictureUpdate = await user.save()

        if (!pictureUpdate) {
            next(new ErrorResponse(error.message, 500))
            return
        }

        res.status(200).json({success: true, user})

    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const verifyWithdrawal = async (req, res, next) => {
    const {earning, amount, method, address } = req.body;
    const user = req.user;
    const netBalance = user.netBalance
    
    try {

        if (!earning || !amount || !method || !address) {
            throw new Error('All fields are required')
        }

        if (user.accountStatus == 'suspended') {
            throw new Error('Your account is suspended')
        }

        if (user.accountStatus == 'closed') {
            throw new Error('Your account is closed')
        }

        if(earning == 'profit') {
            // check if amount greater than net balance 
            if (Number(amount) > Number(user.profit)) {
                throw new Error('Insufficient balance')
            }
        }

        if(earning == 'bonus') {
            // check if amount greater than net balance 
            if (Number(amount) > Number(user.bonus)) {
                throw new Error('Insufficient balance')
            }
        }

        const result = {
            earning: earning,
            amount: amount,
            method: method,
            address: address,
            netBalance: netBalance
        }

        console.log(result)

        res.status(200).json({success: true, result})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const withdraw = async (req, res, next) => {
    const {code, earning, amount, method, address } = req.body
    const user = req.user;
    const withdrawCode = await Code.findOne({user: user._id})

    console.log(req.body)
    
    
    try {

        if (code != withdrawCode.code) {
            throw new Error("Invalid withdrawal code")
        }

        const withdraw = await Transaction.create({
            user: user._id,
            amount: amount,
            method: method,
            wallet: address,
            transactionType: 'Withdrawal',
            datetime
        })

        if (!withdraw) {
            next(new ErrorResponse('Withdrawal failed', 500))
            return
        }

        if(earning == 'profit') {
            // update user balance 
            const currentBalance = Number(user.profit) - Number(amount);
            user.profit = currentBalance
            
            const updateUserBalance = await user.save();

            if (!updateUserBalance) {
                throw new Error('user balance was not updated')
            }
        } 

        if(earning == 'bonus') {
            // update user balance 
            const currentBalance = Number(user.bonus) - Number(amount);
            user.bonus = currentBalance
            
            const updateUserBalance = await user.save();

            if (!updateUserBalance) {
                throw new Error('user balance was not updated')
            }
        }

        res.status(200).json({success: true, message: 'withdrawal is being processed'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

// update email 
const updateEmail = async (req, res, next) => { 
    const {_id: authUser} = req.user
    const { email } = req.body;

    try {

        if (!email) {
            throw new Error('Please enter an email address');
        }
        
        if (!validator.isEmail(email)) { 
            throw new Error('Please enter a valid email address');
        }

        const user = await User.findOne({ _id: authUser });

        if (!user) {
            throw new Error('User not found');
        }

        user.email = email;

        await user.save();

        res.status(200).json({success: true, message: 'email has been updated',  user});
        
    } catch (error) {
        next(new ErrorResponse(error.message, error.code))
        return
    }
}

// update user number 
const updateNumber = async (req, res, next) => {
    const {_id: authUser} = req.user
    const { number } = req.body;


    try {

        if (!number) {
            throw new Error('Please enter a number')
        }

        const user = await User.findOne({ _id: authUser });

        if (!user) {
            throw new Error('User not found');
        }

        user.number = number;

        await user.save();

        res.status(200).json({success: true, message: 'number has been updated',  user});
        
    } catch (error) {
        next(new ErrorResponse(error.message, error.code))
        return
    }
}

// change password 
const updatePassword = async (req, res, next) => { 
    const { _id: authUser } = req.user
    const { password, newPassword, confirmPassword } = req.body


    try {

        if (!password || !confirmPassword || !newPassword) { 
            throw new Error('Please fill in all fields')
        }

        const user = await User.findOne({ _id: authUser });

        if (user.password !== password) { 
            throw new Error('Old password is not correct')
        }

        if (newPassword !== confirmPassword) { 
            throw new Error('password does not match!')
        }

        if (newPassword < 6 || confirmPassword < 6) { 
            throw new Error('Password must be at least 6 characters long')
        }

        if (!user) {
            throw new Error('User not found');
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({success: true, message: 'Password has been changed',  user});
        
    } catch (error) {
        next(new ErrorResponse(error.message, error.code))
        return
    }
}
    

const userRegisteration = async (req, res, next) => { 
    const { firstname, lastname, email, gender, country, reference, password2, password, number, } = req.body

    let { clientIp } = getIP(req);
    
    if (!reference) { 
         next(new ErrorResponse('Please enter property reference', 400))
        return
    }

    if(!mongoose.Types.ObjectId.isValid(reference)) {
        next(new ErrorResponse('Property reference is invalid', 400))
        return
    }

    const property = await Property.findOne({ _id: reference })
    
    if (!property) {
        next(new ErrorResponse('Invalid property reference', 400))
        return
    }

    if (!firstname || !lastname || !email || !password || !gender || !country || !password2 || !number) {
        next(new ErrorResponse('Please fill all fields', 400))
        return
    }

    if (!validator.isEmail(email)) { 
         next(new ErrorResponse('Please enter a valid email', 400))
        return
    }

    if (password != password2) {
        next(new ErrorResponse("Password does not match"));
        return
    }

    if (password.length < 6) {
        next(new ErrorResponse('Password must be atleast 6 character long', 400))
        return
    }
    
    try {
    
        const userExist = await User.find();

        userExist.map((user) => {
             if (user.email == email) {
                throw new Error('This email already exist')
             }
             if (number == user.number) {
                throw new Error('This number already exist')
            }
        })

        const user = await User.create({
            firstname,
            lastname,
            email,
            ip: clientIp,
            reference,
            password,
            gender,
            regDate: datetime,
            number,
            country,
        });

        if (!user) {
            throw new Error('user was not created')
        }

        const token = await generateToken(user._id);

        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })

        // send user verification email 
        await sendVerificationEmail(user);

        // send email to admin when a user get registered
        await sendAdminEmailWhenUserRegister(user)

        res.json({ success: true, message: 'successfully registered', user, token })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}


const loginUser = async (req, res, next) => { 
    const { email: userEmail, password } = req.body
   
    try {
        if (!password || !userEmail) {
            throw new Error('Please fill in your email and password');
        }

        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            throw new Error('Invalid email or password')
        }

        if (password !== user.password) {
            throw new Error('Invalid email or password')
         }

        const token = await generateToken(user._id)

        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })
        
        const { firstname, lastname, email, reference, role } = user

        if (user.role == 'user') {
            user.onlineStatus = true;
            
            await user.save()
        }

        res.status(200).json({
            firstname,
            lastname,
            email,
            reference,
            role,
            token
        })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const uploadUserIdentityDocument = async (req, res, next) => {
    const user = req.user
    const { idtype, country} = req.body;
    
    if (!idtype || !country) {
        next(new ErrorResponse('All fields are required', 400))
        return
    }

    if (!req.file) {
        next(new ErrorResponse('no file was uploaded', 400))
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

        const userDocument = await UserDocument.findOne({ user });

        if (userDocument) {
            userDocument.idType = idtype,
            userDocument.country = country,
            userDocument.doc = imageResults,
            userDocument.statusMessage = "Pending"
            
            await userDocument.save()
            
            res.status(200).json({success: true, message: 'document updated, wait for review'})
            
        } else {
            await UserDocument.create({
                user,
                idType: idtype,
                country,
                statusMessage: "Pending",
                doc: imageResults
            })

            res.status(200).json({success: true, message: 'document uploaded, wait for review'})
        }

    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }

}

const logoutUser = async (req, res, next) => { 
    const { _id } = req.user
    
    const user = await User.findOne({ _id });

    if (!user) {
        throw new Error('user is not logged in');
    }

    if (user.role == 'user') {
        user.lastseen = datetime;
        user.onlineStatus = false;

        await user.save();
    }

    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        expires: new Date(0),
        secure: true
    })
    res.status(200).json({success: true, message: "Successfully Logged out"})
}

const resendVerificationEmail = async (req, res, next) => {
    const  userId  = req.user
    
    try {
        const user = await User.findOne({ _id: userId });

        if (!user) {
            throw new Error("This user does not exits")
        }

        if (user.emailveirify) {
            throw new Error('your email has already been verified')
        }

        await sendVerificationEmail(user);

        res.status(200).json({ success: true, message: "verification mail has been sent." })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}


const updateUserProperty = async (req, res, next) => {
    const {id} = req.params;
    const {property} = req.body
    try {

        if(!property) {
            throw new Error('Please provide property reference');
        }

        if(!mongoose.Types.ObjectId.isValid(property)) {
            throw new Error('Property reference is invalid');
        }

        const user = await User.findOne({_id: id});

        if(!user) {
            throw new Error('This user is not found');
        }

        user.reference = property;
        user.unitAmount = 0;

        await user.save();

        res.status(200).json({success: true, message: 'Your property has been updated'})
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return;
    }
}

module.exports = {
    userRegisteration,
    loginUser,
    logoutUser,
    userDashboardPage,
    personalInfoPage,
    accountPage,
    helpPage,
    howItWorksPage,
    tripspage,
    paymentPage,
    updateName,
    updateEmail,
    updateNumber,
    updatePassword,
    profilePage,
    withdrawalPage,
    transactionPage,
    oldCheckinsPage,
    newCheckinsPage,
    payment,
    withdraw,
    changedp,
    uploadUserIdentityDocument,
    emailVerificationPage,
    resendVerificationEmail,
    verifyWithdrawal,
    changePropertyPage,
    updateUserProperty,
}