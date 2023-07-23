const sendEmail = require('./sendEmail');
const Token = require('../models/tokenModel');
const crypto = require("crypto")


const sendVerificationEmail = async (user) => {
    const send_to = user.email;
    const sent_from = process.env.NO_REPLY_EMAIL; 
    const subject = 'Please Verify Your Email Address - Action Required'

    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const token = await Token.findOne({user: user._id})
    
        if(token) {
            await Token.deleteOne({_id: token._id})
        }
    
        await new Token({
            user: user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * (60 * 60 * 1000) // 24hr,
        }).save()
    
    
        // construct url to reset password 
      const verificationUrl = `${process.env.SITE_LINK}/auth/users/emailverification?verificationToken=${verificationToken}`

   const htmlMessage = `
        <html>
            <head>
                <title>  ${process.env.SITE_NAME} ' Verification Email</title>
            </head>
            <body>
                <div>
                    <img src = "${process.env.SITE_LINK}/main/images/logo.png" style="height:200px; width: 400px">
                </div>

            <p> Dear ${user.firstname},

            Thank you for signing up with ${process.env.SITE_NAME}! We are excited to have you as a part of our community. 
            <br />
            <br />

            To ensure the security of your account and to complete the registration process, we kindly ask you to verify your email address by clicking on this link or copy the link below to your browser url

            <a href="${verificationUrl}">Verify your email</a>
            <br />
            <br />

            <a href="#">${verificationUrl}</a>

            <br />
            <br />
            

            Please note that this link is valid for the next 24 hours. After that, you will need to request a new verification email. <br />
            <br />

            If you did not sign up for an account on ${process.env.SITE_NAME}, please disregard this email. Your account will not be activated. 
            <br />
            <br />

            By verifying your email, you gain access to a wide range of features and benefits, including: <br />

            <ul>
                <li>Personalized user experience</li>
                <li>Secure account recovery options</li>
                <li>Exclusive member-only content and promotions</li>
                <li>Personalized user experience</li>
            </ul>  <br />
            
            Should you encounter any issues or need further assistance, don't hesitate to contact our support team at ${process.env.SUPPORT_EMAIL}. 
            <br />
            <br />

            Thank you for joining ${process.env.SITE_NAME}. We look forward to providing you with an exceptional experience. 
            <br />
            <br />

            Best regards, <br />
            ${process.env.SITE_NAME} Team </p>
        
            </body>
        </html>
        `;
    
    const send = await sendEmail(subject, htmlMessage, send_to, sent_from);
}

module.exports = sendVerificationEmail