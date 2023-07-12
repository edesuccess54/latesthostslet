const User = require('../models/usersModel');
const Code = require('../models/codeModel');
const Transaction = require('../models/transactionModel');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const fs = require('fs');

const generateToken = (id) => {
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
const personalInfoPage = (req, res, next) => { 
    const { user } = req;
    res.render('user/personal-info', {user})
}

// account page 
const accountPage = (req, res, next) => {
    res.render('user/account')
}

// profile page 
const profilePage = (req, res, next) => {
    res.render('user/profile')
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
const paymentPage = (req, res, next) => { 
    res.render('user/payment')
}

// widthdrawal page
const withdrawalPage = (req, res, next) => {
    res.render('user/withdraw')
}

// transactions page 
const transactionPage = async (req, res, next) => {
    const user = req.user
    const transactions = await Transaction.find({ user: user._id })
    
    res.render('user/transaction', {transactions})
}

// checkins page 
const checkinsPage = (req, res, next) => {
    res.render('user/checkins')
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
    const { reference, unit, amount, method } = req.body
    const {_id} = req.user
    
    try {
        if (!reference || !amount || !method || !unit) {
            throw new Error('All fields are required');
        }

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

const withdraw = async (req, res, next) => {
    const { balance, amount, method, address } = req.body;
    const user = req.user
    
    try {

        if (!balance || !amount || !method || !address) {
            throw new Error('All fields are required')
        }

        // check if amount greater than net balance 
        if (Number(amount) > Number(balance)) {
            throw new Error('Insufficient balance')
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

        // update user balance 
        const currentBalance = Number(balance) - Number(amount);
        user.profit = currentBalance
        
        const updateUserBalance = await user.save();

        if (!updateUserBalance) {
            throw new Error('user balance was not updated')
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
    const { firstname, lastname, email, reserveCode, password } = req.body

    if (!firstname || !lastname || !email || !reserveCode || !password) {
        next(new ErrorResponse('Please fill all fields', 400))
        return
    }

    if (!validator.isEmail(email)) { 
         next(new ErrorResponse('Please enter a valid email', 400))
        return
    }

    if (password.length < 6) {
        next(new ErrorResponse('Password must be atleast 6 character long', 400))
        return
    }
    
    try {

        const reservationCode = Code.findOne({ code: reserveCode })

        if (!reservationCode) {
            throw new Error('reservation code does not exist')
        }

        if (reservationCode.code !== reserveCode) { 
            throw new Error('you have entered a wrong reservation code')
        }

        if (!reservationCode.userEmail !== email) { 
            throw new Error('email provided does not match reservation code email')
        }

        const user = await User.create({
            firstname,
            lastname,
            email,
            reserveCode,
            password
        })

        if (!user) {
            throw new Error('user was not created')
        }

        const token = await generateToken(user._id)

        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        })

        res.json({success: true, message: 'successfully registered', user, token})
        
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
        
        const { firstname, lastname, email, reserveCode, role } = user

        res.status(200).json({
            firstname,
            lastname,
            email,
            reserveCode,
            role,
            token
        })
        
    } catch (error) {
        next(new ErrorResponse(error.message, 400))
        return
    }
}

const logoutUser = async (req, res, next) => { 
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        expires: new Date(0),
        secure: true
    })
    res.status(200).json({success: true, message: "Successfully Logged out"})
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
    checkinsPage,
    payment,
    withdraw,
    changedp
}