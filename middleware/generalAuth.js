const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

const generalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        
        if(!token) {
            next()
            return
        }

        // verify token 
        const verified = await jwt.verify(token, process.env.JWT_SECRET);

        if(!verified) {
            next()
            return
        }

        // get user 
        const user = await User.findById(verified.id)

        if (!user) {
            next()
            return
        }

        req.user = user 
        next()

    } catch (error) {
        res.redirect("/")
        return 
    }
}

module.exports = generalAuth