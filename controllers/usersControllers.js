const User = require('../models/usersModel');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const validator = require('validator');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
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
    return res.status(200).json({success: true, message: "Successfully Logged out"})
}




module.exports = {
    userRegisteration,
    loginUser,
    logoutUser
}