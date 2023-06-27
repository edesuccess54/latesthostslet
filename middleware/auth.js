const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        
        if(!token) {
            res.redirect("/")
            return
        }

        // verify token 
        const verified = await jwt.verify(token, process.env.JWT_SECRET);

        if(!verified) {
            res.redirect("/")
            return
        }

        // get user 
        const user = await User.findById(verified.id)

        if (!user) {
            console.log("User not found")
            res.redirect("/")
            return
        }

        req.user = user 
        next()

    } catch (error) {
        res.redirect("/")
        return 
    }
}

module.exports = auth