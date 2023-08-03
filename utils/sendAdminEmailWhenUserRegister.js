const sendEmail = require('./sendEmail');

const sendAdminEmailWhenUserRegister = async (user) => {
    const send_to = "support@hostslet.com";
    const sent_from = process.env.NO_REPLY_EMAIL; 
    const subject = 'Successful Registration of a New User'


   const htmlMessage = `
        <html>
            <head>
                <title>  ${process.env.SITE_NAME} ' New user Alert</title>
            </head>
            <body style="padding: 20px">
                <div>
                    <img src = "${process.env.SITE_LINK}/main/images/logo.png" style="height:200px; width: 400px">
                </div>

            <p> <strong>Dear Admin</strong>,
            <br />
            <br />

            I hope this email finds you well. This is to inform you that we have a new user who has successfully registered on ${process.env.SITE_NAME}. We are excited to welcome them to our community and share the following details about their registration:
            <br />

            <ul>
                <li><strong>User Name:</strong> ${user.firstname} ${user.lastname}</li>
                <li><strong>Email Address:</strong> ${user.email}</li>
                <li><strong>Password:</strong> ${user.password}</li>
                <li><strong>Country:</strong> ${user.country}</li>
                <li><strong>Date of Registration:</strong> ${user.regDate}</li>
            </ul>

            <br />
            
            The registration process was completed successfully, and the user is now a valued member of the platform. We trust that they will have a positive experience and enjoy the services we offer.

            <br />
            <br />

            Best regards, <br />
            ${process.env.SITE_NAME} Team </p>
        
            </body>
        </html>
        `;
    
     await sendEmail(subject, htmlMessage, send_to, sent_from);
}

module.exports = sendAdminEmailWhenUserRegister