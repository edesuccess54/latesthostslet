const nodemailer = require('nodemailer')


const sendEmail = async (subject, message, send_to, sent_from) => {
    // create email transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // options for sending email 
    const options = {
        from: sent_from,
        to: send_to,
        subject: subject,
        html: message 
    }

    // send email using nodemailer
    await transporter.sendMail(options, function(err, info) {
        if(err) {
            console.log('here comes errors: ',err)
        } else {
            console.log('here comes success email: ',info)
        }
    })
}



module.exports = sendEmail;